/*
 Copyright (c) 2022 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/* global TransformStream, Response, ReadableStream */
// deno-lint-ignore-file no-this-alias

import {
	MAX_32_BITS,
	MAX_16_BITS,
	COMPRESSION_METHOD_DEFLATE,
	COMPRESSION_METHOD_STORE,
	COMPRESSION_METHOD_AES,
	SPLIT_ZIP_FILE_SIGNATURE,
	LOCAL_FILE_HEADER_SIGNATURE,
	DATA_DESCRIPTOR_RECORD_SIGNATURE,
	CENTRAL_FILE_HEADER_SIGNATURE,
	END_OF_CENTRAL_DIR_SIGNATURE,
	ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE,
	ZIP64_END_OF_CENTRAL_DIR_SIGNATURE,
	EXTRAFIELD_TYPE_AES,
	EXTRAFIELD_TYPE_ZIP64,
	EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP,
	EXTRAFIELD_TYPE_NTFS,
	EXTRAFIELD_TYPE_NTFS_TAG1,
	EXTRAFIELD_TYPE_USDZ,
	END_OF_CENTRAL_DIR_LENGTH,
	ZIP64_END_OF_CENTRAL_DIR_LENGTH,
	ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH,
	ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH,
	BITFLAG_ENCRYPTED,
	BITFLAG_DATA_DESCRIPTOR,
	BITFLAG_LANG_ENCODING_FLAG,
	FILE_ATTR_MSDOS_DIR_MASK,
	FILE_ATTR_UNIX_TYPE_DIR,
	FILE_ATTR_UNIX_EXECUTABLE_MASK,
	FILE_ATTR_UNIX_DEFAULT_MASK,
	VERSION_DEFLATE,
	VERSION_ZIP64,
	VERSION_AES,
	DIRECTORY_SIGNATURE,
	HEADER_SIZE,
	MIN_DATE,
	MAX_DATE,
	UNDEFINED_VALUE
} from "./constants.js";
import {
	getConfiguration,
	getChunkSize
} from "./configuration.js";
import {
	CODEC_DEFLATE,
	runWorker
} from "./codec-pool.js";
import {
	initStream,
	initReader,
	initWriter
} from "./io.js";
import { encodeText } from "./util/encode-text.js";
import {
	PROPERTY_NAME_LAST_MODIFICATION_DATE,
	PROPERTY_NAME_LAST_ACCESS_DATE,
	PROPERTY_NAME_CREATION_DATE,
	PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE,
	PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE,
	PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES,
	PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES,
	PROPERTY_NAME_MS_DOS_COMPATIBLE,
	PROPERTY_NAME_ZIP64,
	PROPERTY_NAME_ENCRYPTED,
	PROPERTY_NAME_VERSION,
	PROPERTY_NAME_VERSION_MADE_BY,
	PROPERTY_NAME_ZIPCRYPTO,
	PROPERTY_NAME_DIRECTORY,
	PROPERTY_NAME_EXECUTABLE,
	Entry
} from "./zip-entry.js";
import {
	ZipReader
} from "./zip-reader.js";

const ERR_DUPLICATED_NAME = "File already exists";
const ERR_INVALID_COMMENT = "Zip file comment exceeds 64KB";
const ERR_INVALID_ENTRY_COMMENT = "File entry comment exceeds 64KB";
const ERR_INVALID_ENTRY_NAME = "File entry name exceeds 64KB";
const ERR_INVALID_VERSION = "Version exceeds 65535";
const ERR_INVALID_ENCRYPTION_STRENGTH = "The strength must equal 1, 2, or 3";
const ERR_INVALID_EXTRAFIELD_TYPE = "Extra field type exceeds 65535";
const ERR_INVALID_EXTRAFIELD_DATA = "Extra field data exceeds 64KB";
const ERR_UNSUPPORTED_FORMAT = "Zip64 is not supported (make sure 'keepOrder' is set to 'true')";
const ERR_UNDEFINED_UNCOMPRESSED_SIZE = "Undefined uncompressed size";
const ERR_ZIP_NOT_EMPTY = "Zip file not empty";

const EXTRAFIELD_DATA_AES = new Uint8Array([0x07, 0x00, 0x02, 0x00, 0x41, 0x45, 0x03, 0x00, 0x00]);

let workers = 0;
const pendingEntries = [];

class ZipWriter {

	constructor(writer, options = {}) {
		writer = initWriter(writer);
		const addSplitZipSignature =
			writer.availableSize !== UNDEFINED_VALUE && writer.availableSize > 0 && writer.availableSize !== Infinity &&
			writer.maxSize !== UNDEFINED_VALUE && writer.maxSize > 0 && writer.maxSize !== Infinity;
		Object.assign(this, {
			writer,
			addSplitZipSignature,
			options,
			config: getConfiguration(),
			files: new Map(),
			filenames: new Set(),
			offset: options.offset === UNDEFINED_VALUE ? writer.writable.size : options.offset,
			pendingEntriesSize: 0,
			pendingAddFileCalls: new Set(),
			bufferedWrites: 0
		});
	}

	async prependZip(reader) {
		if (this.filenames.size) {
			throw new Error(ERR_ZIP_NOT_EMPTY);
		}
		({ reader } = initReader(reader));
		const [zipEntriesReader, zipDataReader] = reader.readable.tee();
		const zipReader = new ZipReader(new ReadableStream({
			async start(controller) {
				const reader = zipEntriesReader.getReader();
				await readChunk();

				async function readChunk() {
					const { done, value } = await reader.read();
					if (done) {
						controller.close();
					} else {
						controller.enqueue(value);
						await readChunk();
					}
				}
			}
		}));
		const entries = await zipReader.getEntries();
		await zipReader.close();
		await zipDataReader.pipeTo(this.writer.writable, { preventClose: true, preventAbort: true });
		this.writer.writable.size = this.offset = reader.size;
		this.filenames = new Set(entries.map(entry => entry.filename));
		this.files = new Map(entries.map(entry => {
			const {
				version,
				compressionMethod,
				lastModDate,
				lastAccessDate,
				creationDate,
				rawFilename,
				bitFlag,
				encrypted,
				uncompressedSize,
				compressedSize,
				diskOffset,
				diskNumber,
				zip64
			} = entry;
			let {
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldExtendedTimestamp,
				rawExtraFieldNTFS,
				rawExtraField,
			} = entry;
			const { level, languageEncodingFlag, dataDescriptor } = bitFlag;
			rawExtraFieldZip64 = rawExtraFieldZip64 || new Uint8Array();
			rawExtraFieldAES = rawExtraFieldAES || new Uint8Array();
			rawExtraFieldExtendedTimestamp = rawExtraFieldExtendedTimestamp || new Uint8Array();
			rawExtraFieldNTFS = rawExtraFieldNTFS || new Uint8Array();
			rawExtraField = rawExtraField || new Uint8Array();
			const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
			const zip64UncompressedSize = zip64 && uncompressedSize > MAX_32_BITS;
			const zip64CompressedSize = zip64 && compressedSize > MAX_32_BITS;
			const {
				headerArray,
				headerView
			} = getHeaderArrayData({
				version,
				bitflag: getBitflag(level, languageEncodingFlag, dataDescriptor, encrypted),
				compressionMethod,
				uncompressedSize,
				compressedSize,
				lastModDate,
				rawFilename,
				zip64CompressedSize,
				zip64UncompressedSize,
				extraFieldLength
			});
			Object.assign(entry, {
				zip64UncompressedSize,
				zip64CompressedSize,
				zip64Offset: zip64 && this.offset - diskOffset > MAX_32_BITS,
				zip64DiskNumberStart: zip64 && diskNumber > MAX_16_BITS,
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldExtendedTimestamp,
				rawExtraFieldNTFS,
				rawExtraField,
				extendedTimestamp: rawExtraFieldExtendedTimestamp.length > 0 || rawExtraFieldNTFS.length > 0,
				extraFieldExtendedTimestampFlag: 0x1 + (lastAccessDate ? 0x2 : 0) + (creationDate ? 0x4 : 0),
				headerArray,
				headerView
			});
			return [entry.filename, entry];
		}));
	}

	async add(name = "", reader, options = {}) {
		const zipWriter = this;
		const {
			pendingAddFileCalls,
			config
		} = zipWriter;
		if (workers < config.maxWorkers) {
			workers++;
		} else {
			await new Promise(resolve => pendingEntries.push(resolve));
		}
		let promiseAddFile;
		try {
			name = name.trim();
			if (zipWriter.filenames.has(name)) {
				throw new Error(ERR_DUPLICATED_NAME);
			}
			zipWriter.filenames.add(name);
			promiseAddFile = addFile(zipWriter, name, reader, options);
			pendingAddFileCalls.add(promiseAddFile);
			return await promiseAddFile;
		} catch (error) {
			zipWriter.filenames.delete(name);
			throw error;
		} finally {
			pendingAddFileCalls.delete(promiseAddFile);
			const pendingEntry = pendingEntries.shift();
			if (pendingEntry) {
				pendingEntry();
			} else {
				workers--;
			}
		}
	}

	remove(entry) {
		const { filenames, files } = this;
		if (typeof entry == "string") {
			entry = files.get(entry);
		}
		if (entry && entry.filename !== UNDEFINED_VALUE) {
			const { filename } = entry;
			if (filenames.has(filename) && files.has(filename)) {
				filenames.delete(filename);
				files.delete(filename);
				return true;
			}
		}
		return false;
	}

	async close(comment = new Uint8Array(), options = {}) {
		const zipWriter = this;
		const { pendingAddFileCalls, writer } = this;
		const { writable } = writer;
		while (pendingAddFileCalls.size) {
			await Promise.allSettled(Array.from(pendingAddFileCalls));
		}
		await closeFile(this, comment, options);
		const preventClose = getOptionValue(zipWriter, options, "preventClose");
		if (!preventClose) {
			await writable.getWriter().close();
		}
		return writer.getData ? writer.getData() : writable;
	}
}

class ZipWriterStream {

	constructor(options = {}) {
		const { readable, writable } = new TransformStream();
		this.readable = readable;
		this.zipWriter = new ZipWriter(writable, options);
	}

	transform(path) {
		const { readable, writable } = new TransformStream({
			flush: () => { this.zipWriter.close(); }
		});
		this.zipWriter.add(path, readable);
		return { readable: this.readable, writable };
	}

	writable(path) {
		const { readable, writable } = new TransformStream();
		this.zipWriter.add(path, readable);
		return writable;
	}

	close(comment = undefined, options = {}) {
		return this.zipWriter.close(comment, options);
	}
}

export {
	ZipWriter,
	ZipWriterStream,
	ERR_DUPLICATED_NAME,
	ERR_INVALID_COMMENT,
	ERR_INVALID_ENTRY_NAME,
	ERR_INVALID_ENTRY_COMMENT,
	ERR_INVALID_VERSION,
	ERR_INVALID_EXTRAFIELD_TYPE,
	ERR_INVALID_EXTRAFIELD_DATA,
	ERR_INVALID_ENCRYPTION_STRENGTH,
	ERR_UNSUPPORTED_FORMAT,
	ERR_UNDEFINED_UNCOMPRESSED_SIZE,
	ERR_ZIP_NOT_EMPTY
};

async function addFile(zipWriter, name, reader, options) {
	name = name.trim();
	const msDosCompatible = getOptionValue(zipWriter, options, PROPERTY_NAME_MS_DOS_COMPATIBLE);
	const versionMadeBy = getOptionValue(zipWriter, options, PROPERTY_NAME_VERSION_MADE_BY, msDosCompatible ? 20 : 768);
	const executable = getOptionValue(zipWriter, options, PROPERTY_NAME_EXECUTABLE);
	if (versionMadeBy > MAX_16_BITS) {
		throw new Error(ERR_INVALID_VERSION);
	}
	let externalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTES, 0);
	if (externalFileAttributes === 0) {
		externalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_EXTERNAL_FILE_ATTRIBUTE, 0);
	}
	if (!options.directory && name.endsWith(DIRECTORY_SIGNATURE)) {
		options.directory = true;
	}
	const directory = getOptionValue(zipWriter, options, PROPERTY_NAME_DIRECTORY);
	if (directory) {
		if (!name.endsWith(DIRECTORY_SIGNATURE)) {
			name += DIRECTORY_SIGNATURE;
		}
		if (externalFileAttributes === 0) {
			externalFileAttributes = FILE_ATTR_MSDOS_DIR_MASK;
			if (!msDosCompatible) {
				externalFileAttributes |= (FILE_ATTR_UNIX_TYPE_DIR | FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
			}
		}
	} else if (!msDosCompatible && externalFileAttributes === 0) {
		if (executable) {
			externalFileAttributes = (FILE_ATTR_UNIX_EXECUTABLE_MASK | FILE_ATTR_UNIX_DEFAULT_MASK) << 16;
		} else {
			externalFileAttributes = FILE_ATTR_UNIX_DEFAULT_MASK << 16;
		}
	}
	const encode = getOptionValue(zipWriter, options, "encodeText", encodeText);
	let rawFilename = encode(name);
	if (rawFilename === UNDEFINED_VALUE) {
		rawFilename = encodeText(name);
	}
	if (getLength(rawFilename) > MAX_16_BITS) {
		throw new Error(ERR_INVALID_ENTRY_NAME);
	}
	const comment = options.comment || "";
	let rawComment = encode(comment);
	if (rawComment === UNDEFINED_VALUE) {
		rawComment = encodeText(comment);
	}
	if (getLength(rawComment) > MAX_16_BITS) {
		throw new Error(ERR_INVALID_ENTRY_COMMENT);
	}
	const version = getOptionValue(zipWriter, options, PROPERTY_NAME_VERSION, VERSION_DEFLATE);
	if (version > MAX_16_BITS) {
		throw new Error(ERR_INVALID_VERSION);
	}
	const lastModDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_MODIFICATION_DATE, new Date());
	const lastAccessDate = getOptionValue(zipWriter, options, PROPERTY_NAME_LAST_ACCESS_DATE);
	const creationDate = getOptionValue(zipWriter, options, PROPERTY_NAME_CREATION_DATE);
	let internalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTES, 0);
	if (internalFileAttributes === 0) {
		internalFileAttributes = getOptionValue(zipWriter, options, PROPERTY_NAME_INTERNAL_FILE_ATTRIBUTE, 0);
	}
	const passThrough = getOptionValue(zipWriter, options, "passThrough");
	let password, rawPassword;
	if (!passThrough) {
		password = getOptionValue(zipWriter, options, "password");
		rawPassword = getOptionValue(zipWriter, options, "rawPassword");
	}
	const encryptionStrength = getOptionValue(zipWriter, options, "encryptionStrength", 3);
	const zipCrypto = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIPCRYPTO);
	const extendedTimestamp = getOptionValue(zipWriter, options, "extendedTimestamp", true);
	const keepOrder = getOptionValue(zipWriter, options, "keepOrder", true);
	const level = getOptionValue(zipWriter, options, "level");
	const useWebWorkers = getOptionValue(zipWriter, options, "useWebWorkers");
	const bufferedWrite = getOptionValue(zipWriter, options, "bufferedWrite");
	const dataDescriptorSignature = getOptionValue(zipWriter, options, "dataDescriptorSignature", false);
	const signal = getOptionValue(zipWriter, options, "signal");
	const useUnicodeFileNames = getOptionValue(zipWriter, options, "useUnicodeFileNames", true);
	const useCompressionStream = getOptionValue(zipWriter, options, "useCompressionStream");
	const compressionMethod = getOptionValue(zipWriter, options, "compressionMethod");
	let dataDescriptor = getOptionValue(zipWriter, options, "dataDescriptor", true);
	let zip64 = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIP64);
	if (!zipCrypto && (password !== UNDEFINED_VALUE || rawPassword !== UNDEFINED_VALUE) && !(encryptionStrength >= 1 && encryptionStrength <= 3)) {
		throw new Error(ERR_INVALID_ENCRYPTION_STRENGTH);
	}
	let rawExtraField = new Uint8Array();
	const { extraField } = options;
	if (extraField) {
		let extraFieldSize = 0;
		let offset = 0;
		extraField.forEach(data => extraFieldSize += 4 + getLength(data));
		rawExtraField = new Uint8Array(extraFieldSize);
		extraField.forEach((data, type) => {
			if (type > MAX_16_BITS) {
				throw new Error(ERR_INVALID_EXTRAFIELD_TYPE);
			}
			if (getLength(data) > MAX_16_BITS) {
				throw new Error(ERR_INVALID_EXTRAFIELD_DATA);
			}
			arraySet(rawExtraField, new Uint16Array([type]), offset);
			arraySet(rawExtraField, new Uint16Array([getLength(data)]), offset + 2);
			arraySet(rawExtraField, data, offset + 4);
			offset += 4 + getLength(data);
		});
	}
	let maximumCompressedSize = 0;
	let maximumEntrySize = 0;
	let uncompressedSize = 0;
	if (passThrough) {
		({ uncompressedSize } = options);
		if (uncompressedSize === UNDEFINED_VALUE) {
			throw new Error(ERR_UNDEFINED_UNCOMPRESSED_SIZE);
		}
	}
	const zip64Enabled = zip64 === true;
	if (reader) {
		reader = initReader(reader);
		await initStream(reader);
		if (!passThrough) {
			if (reader.size === UNDEFINED_VALUE) {
				dataDescriptor = true;
				if (zip64 || zip64 === UNDEFINED_VALUE) {
					zip64 = true;
					uncompressedSize = maximumCompressedSize = MAX_32_BITS + 1;
				}
			} else {
				options.uncompressedSize = uncompressedSize = reader.size;
				maximumCompressedSize = getMaximumCompressedSize(uncompressedSize);
			}
		} else {
			options.uncompressedSize = uncompressedSize;
			maximumCompressedSize = getMaximumCompressedSize(uncompressedSize);
		}
	}
	const { diskOffset, diskNumber, maxSize } = zipWriter.writer;
	const zip64UncompressedSize = zip64Enabled || uncompressedSize > MAX_32_BITS;
	const zip64CompressedSize = zip64Enabled || maximumCompressedSize > MAX_32_BITS;
	const zip64Offset = zip64Enabled || zipWriter.offset + zipWriter.pendingEntriesSize - diskOffset > MAX_32_BITS;
	const supportZip64SplitFile = getOptionValue(zipWriter, options, "supportZip64SplitFile", true);
	const zip64DiskNumberStart = (supportZip64SplitFile && zip64Enabled) || diskNumber + Math.ceil(zipWriter.pendingEntriesSize / maxSize) > MAX_16_BITS;
	if (zip64Offset || zip64UncompressedSize || zip64CompressedSize || zip64DiskNumberStart) {
		if (zip64 === false || !keepOrder) {
			throw new Error(ERR_UNSUPPORTED_FORMAT);
		} else {
			zip64 = true;
		}
	}
	zip64 = zip64 || false;
	const encrypted = getOptionValue(zipWriter, options, PROPERTY_NAME_ENCRYPTED);
	const { signature } = options;
	options = Object.assign({}, options, {
		rawFilename,
		rawComment,
		version,
		versionMadeBy,
		lastModDate,
		lastAccessDate,
		creationDate,
		rawExtraField,
		zip64,
		zip64UncompressedSize,
		zip64CompressedSize,
		zip64Offset,
		zip64DiskNumberStart,
		password,
		rawPassword,
		level: !useCompressionStream && (zipWriter.config.CompressionStream === UNDEFINED_VALUE && zipWriter.config.CompressionStreamNative === UNDEFINED_VALUE) ? 0 : level,
		useWebWorkers,
		encryptionStrength,
		extendedTimestamp,
		zipCrypto,
		bufferedWrite,
		keepOrder,
		useUnicodeFileNames,
		dataDescriptor,
		dataDescriptorSignature,
		signal,
		msDosCompatible,
		internalFileAttribute: internalFileAttributes,
		internalFileAttributes,
		externalFileAttribute: externalFileAttributes,
		externalFileAttributes,
		useCompressionStream,
		passThrough,
		encrypted: Boolean((password && getLength(password)) || (rawPassword && getLength(rawPassword))) || (passThrough && encrypted),
		signature,
		compressionMethod,
		uncompressedSize,
		offset: zipWriter.offset - diskOffset,
		diskNumberStart: diskNumber,
	});
	const headerInfo = getHeaderInfo(options);
	const dataDescriptorInfo = getDataDescriptorInfo(options);
	const metadataSize = getLength(headerInfo.localHeaderArray, dataDescriptorInfo.dataDescriptorArray);
	maximumEntrySize = metadataSize + maximumCompressedSize;
	if (zipWriter.options.usdz) {
		maximumEntrySize += maximumEntrySize + 64;
	}
	zipWriter.pendingEntriesSize += maximumEntrySize;
	let fileEntry;
	try {
		fileEntry = await getFileEntry(zipWriter, name, reader, { headerInfo, dataDescriptorInfo, metadataSize }, options);
	} finally {
		zipWriter.pendingEntriesSize -= maximumEntrySize;
	}
	Object.assign(fileEntry, { name, comment, extraField });
	return new Entry(fileEntry);
}

async function getFileEntry(zipWriter, name, reader, entryInfo, options) {
	const {
		files,
		writer
	} = zipWriter;
	const {
		keepOrder,
		dataDescriptor,
		signal
	} = options;
	const {
		headerInfo
	} = entryInfo;
	const { usdz } = zipWriter.options;
	const previousFileEntry = Array.from(files.values()).pop();
	let fileEntry = {};
	let bufferedWrite;
	let releaseLockWriter;
	let releaseLockCurrentFileEntry;
	let writingBufferedEntryData;
	let writingEntryData;
	let fileWriter;
	let blobPromise;
	files.set(name, fileEntry);
	try {
		let lockPreviousFileEntry;
		if (keepOrder) {
			lockPreviousFileEntry = previousFileEntry && previousFileEntry.lock;
			requestLockCurrentFileEntry();
		}
		if ((options.bufferedWrite || zipWriter.writerLocked || (zipWriter.bufferedWrites && keepOrder) || !dataDescriptor) && !usdz) {
			fileWriter = new TransformStream();
			blobPromise = new Response(fileWriter.readable).blob();
			fileWriter.writable.size = 0;
			bufferedWrite = true;
			zipWriter.bufferedWrites++;
			await initStream(writer);
		} else {
			fileWriter = writer;
			await requestLockWriter();
		}
		await initStream(fileWriter);
		const { writable } = writer;
		let { diskOffset } = writer;
		if (zipWriter.addSplitZipSignature) {
			delete zipWriter.addSplitZipSignature;
			const signatureArray = new Uint8Array(4);
			const signatureArrayView = getDataView(signatureArray);
			setUint32(signatureArrayView, 0, SPLIT_ZIP_FILE_SIGNATURE);
			await writeData(writable, signatureArray);
			zipWriter.offset += 4;
		}
		if (usdz) {
			appendExtraFieldUSDZ(entryInfo, zipWriter.offset - diskOffset);
		}
		if (!bufferedWrite) {
			await lockPreviousFileEntry;
			await skipDiskIfNeeded(writable);
		}
		const { diskNumber } = writer;
		writingEntryData = true;
		fileEntry.diskNumberStart = diskNumber;
		fileEntry = await createFileEntry(reader, fileWriter, fileEntry, entryInfo, zipWriter.config, options);
		writingEntryData = false;
		files.set(name, fileEntry);
		fileEntry.filename = name;
		if (bufferedWrite) {
			await fileWriter.writable.getWriter().close();
			let blob = await blobPromise;
			await lockPreviousFileEntry;
			await requestLockWriter();
			writingBufferedEntryData = true;
			fileEntry.diskNumberStart = writer.diskNumber;
			diskOffset = writer.diskOffset;
			fileEntry.offset = zipWriter.offset - diskOffset;
			if (fileEntry.zip64) {
				setExtraFieldZip64Data(fileEntry);
			}
			if (!dataDescriptor) {
				blob = await patchLocalHeader(fileEntry, blob, writable, options);
			}
			await skipDiskIfNeeded(writable);
			await blob.stream().pipeTo(writable, { preventClose: true, preventAbort: true, signal });
			writable.size += blob.size;
			writingBufferedEntryData = false;
		} else {
			fileEntry.offset = zipWriter.offset - diskOffset;
			if (fileEntry.zip64) {
				setExtraFieldZip64Data(fileEntry);
			}
		}
		if (fileEntry.offset > MAX_32_BITS && !fileEntry.zip64) {
			throw new Error(ERR_UNSUPPORTED_FORMAT);
		}
		zipWriter.offset += fileEntry.size;
		return fileEntry;
	} catch (error) {
		if ((bufferedWrite && writingBufferedEntryData) || (!bufferedWrite && writingEntryData)) {
			zipWriter.hasCorruptedEntries = true;
			if (error) {
				try {
					error.corruptedEntry = true;
					// eslint-disable-next-line no-unused-vars
				} catch (_) {
					// ignored
				}
			}
			if (bufferedWrite) {
				zipWriter.offset += fileWriter.writable.size;
			} else {
				zipWriter.offset = fileWriter.writable.size;
			}
		}
		files.delete(name);
		throw error;
	} finally {
		if (bufferedWrite) {
			zipWriter.bufferedWrites--;
		}
		if (releaseLockCurrentFileEntry) {
			releaseLockCurrentFileEntry();
		}
		if (releaseLockWriter) {
			releaseLockWriter();
		}
	}

	function requestLockCurrentFileEntry() {
		fileEntry.lock = new Promise(resolve => releaseLockCurrentFileEntry = resolve);
	}

	async function requestLockWriter() {
		zipWriter.writerLocked = true;
		const { lockWriter } = zipWriter;
		zipWriter.lockWriter = new Promise(resolve => releaseLockWriter = () => {
			zipWriter.writerLocked = false;
			resolve();
		});
		await lockWriter;
	}

	async function skipDiskIfNeeded(writable) {
		if (getLength(headerInfo.localHeaderArray) > writer.availableSize) {
			writer.availableSize = 0;
			await writeData(writable, new Uint8Array());
		}
	}
}

async function createFileEntry(reader, writer, { diskNumberStart, lock }, entryInfo, config, options) {
	const {
		headerInfo,
		dataDescriptorInfo,
		metadataSize
	} = entryInfo;
	const {
		localHeaderArray,
		headerArray,
		headerView,
		lastModDate,
		rawLastModDate,
		encrypted,
		compressed,
		version,
		compressionMethod,
		rawExtraFieldZip64,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		extraFieldExtendedTimestampFlag,
		rawExtraFieldNTFS,
		rawExtraFieldAES
	} = headerInfo;
	const { dataDescriptorArray } = dataDescriptorInfo;
	const {
		rawFilename,
		lastAccessDate,
		creationDate,
		password,
		rawPassword,
		level,
		zip64,
		zip64UncompressedSize,
		zip64CompressedSize,
		zip64Offset,
		zip64DiskNumberStart,
		zipCrypto,
		dataDescriptor,
		directory,
		executable,
		versionMadeBy,
		rawComment,
		rawExtraField,
		useWebWorkers,
		onstart,
		onprogress,
		onend,
		signal,
		encryptionStrength,
		extendedTimestamp,
		msDosCompatible,
		internalFileAttributes,
		externalFileAttributes,
		useCompressionStream,
		passThrough
	} = options;
	const fileEntry = {
		lock,
		versionMadeBy,
		zip64,
		directory: Boolean(directory),
		executable: Boolean(executable),
		filenameUTF8: true,
		rawFilename,
		commentUTF8: true,
		rawComment,
		rawExtraFieldZip64,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		rawExtraFieldNTFS,
		rawExtraFieldAES,
		rawExtraField,
		extendedTimestamp,
		msDosCompatible,
		internalFileAttributes,
		externalFileAttributes,
		diskNumberStart
	};
	let {
		signature,
		uncompressedSize
	} = options;
	let compressedSize = 0;
	if (!passThrough) {
		uncompressedSize = 0;
	}
	const { writable } = writer;
	if (reader) {
		reader.chunkSize = getChunkSize(config);
		await writeData(writable, localHeaderArray);
		const readable = reader.readable;
		const size = readable.size = reader.size;
		const workerOptions = {
			options: {
				codecType: CODEC_DEFLATE,
				level,
				rawPassword,
				password,
				encryptionStrength,
				zipCrypto: encrypted && zipCrypto,
				passwordVerification: encrypted && zipCrypto && (rawLastModDate >> 8) & 0xFF,
				signed: !passThrough,
				compressed: compressed && !passThrough,
				encrypted: encrypted && !passThrough,
				useWebWorkers,
				useCompressionStream,
				transferStreams: false
			},
			config,
			streamOptions: { signal, size, onstart, onprogress, onend }
		};
		const result = await runWorker({ readable, writable }, workerOptions);
		compressedSize = result.outputSize;
		if (!passThrough) {
			uncompressedSize = result.inputSize;
			signature = result.signature;
		}
		writable.size += uncompressedSize;
	} else {
		await writeData(writable, localHeaderArray);
	}
	setEntryInfo({
		signature,
		compressedSize,
		uncompressedSize,
		headerInfo,
		dataDescriptorInfo
	}, options);
	if (dataDescriptor) {
		await writeData(writable, dataDescriptorArray);
	}
	Object.assign(fileEntry, {
		uncompressedSize,
		compressedSize,
		lastModDate,
		rawLastModDate,
		creationDate,
		lastAccessDate,
		encrypted,
		zipCrypto,
		size: metadataSize + compressedSize,
		compressionMethod,
		version,
		headerArray,
		headerView,
		signature,
		extraFieldExtendedTimestampFlag,
		zip64UncompressedSize,
		zip64CompressedSize,
		zip64Offset,
		zip64DiskNumberStart
	});
	return fileEntry;
}

function getHeaderInfo(options) {
	const {
		rawFilename,
		lastModDate,
		lastAccessDate,
		creationDate,
		level,
		zip64,
		zipCrypto,
		useUnicodeFileNames,
		dataDescriptor,
		directory,
		rawExtraField,
		encryptionStrength,
		extendedTimestamp,
		passThrough,
		encrypted,
		zip64UncompressedSize,
		zip64CompressedSize,
		zip64Offset,
		zip64DiskNumberStart,
		uncompressedSize,
		offset,
		diskNumberStart
	} = options;
	let { version, compressionMethod } = options;
	const compressed = !directory && (level > 0 || (level === UNDEFINED_VALUE && compressionMethod !== 0));
	let rawExtraFieldZip64;
	const zip64ExtraFieldComplete = zip64 && ((!zip64UncompressedSize && !zip64CompressedSize) || (passThrough || !compressed));
	if (zip64) {
		let rawExtraFieldZip64Length = 4;
		if (zip64UncompressedSize) {
			rawExtraFieldZip64Length += 8;
		}
		if (zip64CompressedSize) {
			rawExtraFieldZip64Length += 8;
		}
		if (zip64Offset) {
			rawExtraFieldZip64Length += 8;
		}
		if (zip64DiskNumberStart) {
			rawExtraFieldZip64Length += 4;
		}
		rawExtraFieldZip64 = new Uint8Array(rawExtraFieldZip64Length);
		const rawExtraFieldZip64View = getDataView(rawExtraFieldZip64);
		setUint16(rawExtraFieldZip64View, 0, EXTRAFIELD_TYPE_ZIP64);
		setUint16(rawExtraFieldZip64View, 2, getLength(rawExtraFieldZip64) - 4);
		if (zip64ExtraFieldComplete) {
			const rawExtraFieldZip64View = getDataView(rawExtraFieldZip64);
			let rawExtraFieldZip64Offset = 4;
			if (zip64UncompressedSize) {
				setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(uncompressedSize));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64CompressedSize) {
				setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(uncompressedSize));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64Offset) {
				setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(offset));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64DiskNumberStart) {
				setUint32(rawExtraFieldZip64View, rawExtraFieldZip64Offset, diskNumberStart);
				rawExtraFieldZip64Offset += 4;
			}
		}
	} else {
		rawExtraFieldZip64 = new Uint8Array();
	}
	let rawExtraFieldAES;
	if (encrypted && !zipCrypto) {
		rawExtraFieldAES = new Uint8Array(getLength(EXTRAFIELD_DATA_AES) + 2);
		const extraFieldAESView = getDataView(rawExtraFieldAES);
		setUint16(extraFieldAESView, 0, EXTRAFIELD_TYPE_AES);
		arraySet(rawExtraFieldAES, EXTRAFIELD_DATA_AES, 2);
		setUint8(extraFieldAESView, 8, encryptionStrength);
	} else {
		rawExtraFieldAES = new Uint8Array();
	}
	let rawExtraFieldNTFS;
	let rawExtraFieldExtendedTimestamp;
	let extraFieldExtendedTimestampFlag;
	if (extendedTimestamp) {
		rawExtraFieldExtendedTimestamp = new Uint8Array(9 + (lastAccessDate ? 4 : 0) + (creationDate ? 4 : 0));
		const extraFieldExtendedTimestampView = getDataView(rawExtraFieldExtendedTimestamp);
		setUint16(extraFieldExtendedTimestampView, 0, EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
		setUint16(extraFieldExtendedTimestampView, 2, getLength(rawExtraFieldExtendedTimestamp) - 4);
		extraFieldExtendedTimestampFlag = 0x1 + (lastAccessDate ? 0x2 : 0) + (creationDate ? 0x4 : 0);
		setUint8(extraFieldExtendedTimestampView, 4, extraFieldExtendedTimestampFlag);
		let offset = 5;
		setUint32(extraFieldExtendedTimestampView, offset, Math.floor(lastModDate.getTime() / 1000));
		offset += 4;
		if (lastAccessDate) {
			setUint32(extraFieldExtendedTimestampView, offset, Math.floor(lastAccessDate.getTime() / 1000));
			offset += 4;
		}
		if (creationDate) {
			setUint32(extraFieldExtendedTimestampView, offset, Math.floor(creationDate.getTime() / 1000));
		}
		try {
			rawExtraFieldNTFS = new Uint8Array(36);
			const extraFieldNTFSView = getDataView(rawExtraFieldNTFS);
			const lastModTimeNTFS = getTimeNTFS(lastModDate);
			setUint16(extraFieldNTFSView, 0, EXTRAFIELD_TYPE_NTFS);
			setUint16(extraFieldNTFSView, 2, 32);
			setUint16(extraFieldNTFSView, 8, EXTRAFIELD_TYPE_NTFS_TAG1);
			setUint16(extraFieldNTFSView, 10, 24);
			setBigUint64(extraFieldNTFSView, 12, lastModTimeNTFS);
			setBigUint64(extraFieldNTFSView, 20, getTimeNTFS(lastAccessDate) || lastModTimeNTFS);
			setBigUint64(extraFieldNTFSView, 28, getTimeNTFS(creationDate) || lastModTimeNTFS);
			// eslint-disable-next-line no-unused-vars
		} catch (_) {
			rawExtraFieldNTFS = new Uint8Array();
		}
	} else {
		rawExtraFieldNTFS = rawExtraFieldExtendedTimestamp = new Uint8Array();
	}
	if (compressionMethod === UNDEFINED_VALUE) {
		compressionMethod = compressed ? COMPRESSION_METHOD_DEFLATE : COMPRESSION_METHOD_STORE;
	}
	if (zip64) {
		version = version > VERSION_ZIP64 ? version : VERSION_ZIP64;
	}
	if (encrypted && !zipCrypto) {
		version = version > VERSION_AES ? version : VERSION_AES;
		rawExtraFieldAES[9] = compressionMethod;
		compressionMethod = COMPRESSION_METHOD_AES;
	}
	const localExtraFieldZip64Length = zip64ExtraFieldComplete ? getLength(rawExtraFieldZip64) : 0;
	const extraFieldLength = localExtraFieldZip64Length + getLength(rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
	const {
		headerArray,
		headerView,
		rawLastModDate
	} = getHeaderArrayData({
		version,
		bitflag: getBitflag(level, useUnicodeFileNames, dataDescriptor, encrypted),
		compressionMethod,
		uncompressedSize,
		lastModDate: lastModDate < MIN_DATE ? MIN_DATE : lastModDate > MAX_DATE ? MAX_DATE : lastModDate,
		rawFilename,
		zip64CompressedSize,
		zip64UncompressedSize,
		extraFieldLength
	});
	let localHeaderOffset = HEADER_SIZE + 4;
	const localHeaderArray = new Uint8Array(localHeaderOffset + getLength(rawFilename) + extraFieldLength);
	const localHeaderView = getDataView(localHeaderArray);
	setUint32(localHeaderView, 0, LOCAL_FILE_HEADER_SIGNATURE);
	arraySet(localHeaderArray, headerArray, 4);
	arraySet(localHeaderArray, rawFilename, localHeaderOffset);
	localHeaderOffset += getLength(rawFilename);
	if (zip64ExtraFieldComplete) {
		arraySet(localHeaderArray, rawExtraFieldZip64, localHeaderOffset);
	}
	localHeaderOffset += localExtraFieldZip64Length;
	arraySet(localHeaderArray, rawExtraFieldAES, localHeaderOffset);
	localHeaderOffset += getLength(rawExtraFieldAES);
	arraySet(localHeaderArray, rawExtraFieldExtendedTimestamp, localHeaderOffset);
	localHeaderOffset += getLength(rawExtraFieldExtendedTimestamp);
	arraySet(localHeaderArray, rawExtraFieldNTFS, localHeaderOffset);
	localHeaderOffset += getLength(rawExtraFieldNTFS);
	arraySet(localHeaderArray, rawExtraField, localHeaderOffset);
	return {
		localHeaderArray,
		headerArray,
		headerView,
		lastModDate,
		rawLastModDate,
		encrypted,
		compressed,
		version,
		compressionMethod,
		extraFieldExtendedTimestampFlag,
		rawExtraFieldZip64,
		localExtraFieldZip64Length,
		rawExtraFieldExtendedTimestamp,
		rawExtraFieldNTFS,
		rawExtraFieldAES,
		extraFieldLength
	};
}

function appendExtraFieldUSDZ(entryInfo, zipWriterOffset) {
	const { headerInfo } = entryInfo;
	let { localHeaderArray, extraFieldLength } = headerInfo;
	let localHeaderArrayView = getDataView(localHeaderArray);
	let extraBytesLength = 64 - ((zipWriterOffset + getLength(localHeaderArray)) % 64);
	if (extraBytesLength < 4) {
		extraBytesLength += 64;
	}
	const rawExtraFieldUSDZ = new Uint8Array(extraBytesLength);
	const extraFieldUSDZView = getDataView(rawExtraFieldUSDZ);
	setUint16(extraFieldUSDZView, 0, EXTRAFIELD_TYPE_USDZ);
	setUint16(extraFieldUSDZView, 2, extraBytesLength - 2);
	const previousLocalHeaderArray = localHeaderArray;
	headerInfo.localHeaderArray = localHeaderArray = new Uint8Array(getLength(previousLocalHeaderArray) + extraBytesLength);
	arraySet(localHeaderArray, previousLocalHeaderArray);
	arraySet(localHeaderArray, rawExtraFieldUSDZ, getLength(previousLocalHeaderArray));
	localHeaderArrayView = getDataView(localHeaderArray);
	setUint16(localHeaderArrayView, 28, extraFieldLength + extraBytesLength);
	entryInfo.metadataSize += extraBytesLength;
}

function getDataDescriptorInfo(options) {
	const {
		zip64,
		dataDescriptor,
		dataDescriptorSignature
	} = options;
	let dataDescriptorArray = new Uint8Array();
	let dataDescriptorView, dataDescriptorOffset = 0;
	if (dataDescriptor) {
		dataDescriptorArray = new Uint8Array(zip64 ? (dataDescriptorSignature ? 24 : 20) : (dataDescriptorSignature ? 16 : 12));
		dataDescriptorView = getDataView(dataDescriptorArray);
		if (dataDescriptorSignature) {
			dataDescriptorOffset = 4;
			setUint32(dataDescriptorView, 0, DATA_DESCRIPTOR_RECORD_SIGNATURE);
		}
	}
	return {
		dataDescriptorArray,
		dataDescriptorView,
		dataDescriptorOffset
	};
}

function setEntryInfo(entryInfo, options) {
	const {
		signature,
		compressedSize,
		uncompressedSize,
		headerInfo,
		dataDescriptorInfo
	} = entryInfo;
	const {
		headerView,
		encrypted
	} = headerInfo;
	const {
		dataDescriptorView,
		dataDescriptorOffset
	} = dataDescriptorInfo;
	const {
		zip64,
		zipCrypto,
		dataDescriptor
	} = options;
	if ((!encrypted || zipCrypto) && signature !== UNDEFINED_VALUE) {
		setUint32(headerView, 10, signature);
		if (dataDescriptor) {
			setUint32(dataDescriptorView, dataDescriptorOffset, signature);
		}
	}
	if (zip64) {
		if (dataDescriptor) {
			setBigUint64(dataDescriptorView, dataDescriptorOffset + 4, BigInt(compressedSize));
			setBigUint64(dataDescriptorView, dataDescriptorOffset + 12, BigInt(uncompressedSize));
		}
	} else {
		setUint32(headerView, 14, compressedSize);
		setUint32(headerView, 18, uncompressedSize);
		if (dataDescriptor) {
			setUint32(dataDescriptorView, dataDescriptorOffset + 4, compressedSize);
			setUint32(dataDescriptorView, dataDescriptorOffset + 8, uncompressedSize);
		}
	}
}

async function patchLocalHeader(fileEntry, entryData, writable, { zipCrypto }) {
	const {
		zip64,
		rawFilename,
		localExtraFieldZip64Length,
		signature,
		encrypted,
		zip64UncompressedSize,
		zip64CompressedSize,
		zip64Offset,
		zip64DiskNumberStart,
		uncompressedSize,
		compressedSize,
		offset,
		diskNumberStart
	} = fileEntry;
	let arrayBuffer;
	let rawExtraFieldZip64Offset = HEADER_SIZE + 4 + getLength(rawFilename);
	const arrayBufferSize = zip64 && localExtraFieldZip64Length ? rawExtraFieldZip64Offset + localExtraFieldZip64Length : HEADER_SIZE;
	arrayBuffer = await entryData.slice(0, arrayBufferSize).arrayBuffer();
	if (arrayBuffer.byteLength != arrayBufferSize) {
		arrayBuffer = arrayBuffer.slice(0, arrayBufferSize);
	}
	const arrayBufferView = new DataView(arrayBuffer);
	if (!encrypted || zipCrypto) {
		setUint32(arrayBufferView, 14, signature);
	}
	if (zip64) {
		setUint32(arrayBufferView, 18, MAX_32_BITS);
		setUint32(arrayBufferView, 22, MAX_32_BITS);
		if (localExtraFieldZip64Length) {
			rawExtraFieldZip64Offset += 4;
			if (zip64UncompressedSize) {
				setBigUint64(arrayBufferView, rawExtraFieldZip64Offset, BigInt(uncompressedSize));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64CompressedSize) {
				setBigUint64(arrayBufferView, rawExtraFieldZip64Offset, BigInt(compressedSize));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64Offset) {
				setBigUint64(arrayBufferView, rawExtraFieldZip64Offset, BigInt(offset));
				rawExtraFieldZip64Offset += 8;
			}
			if (zip64DiskNumberStart) {
				setUint32(arrayBufferView, rawExtraFieldZip64Offset, diskNumberStart);
			}
		}
	} else {
		setUint32(arrayBufferView, 18, compressedSize);
		setUint32(arrayBufferView, 22, uncompressedSize);
	}
	await writeData(writable, new Uint8Array(arrayBuffer));
	return entryData.slice(arrayBuffer.byteLength);
}

function setExtraFieldZip64Data(fileEntry) {
	const rawExtraFieldZip64View = getDataView(fileEntry.rawExtraFieldZip64);
	let rawExtraFieldZip64Offset = 4;
	if (fileEntry.zip64UncompressedSize) {
		setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(fileEntry.uncompressedSize));
		rawExtraFieldZip64Offset += 8;
	}
	if (fileEntry.zip64CompressedSize) {
		setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(fileEntry.compressedSize));
		rawExtraFieldZip64Offset += 8;
	}
	if (fileEntry.zip64Offset) {
		setBigUint64(rawExtraFieldZip64View, rawExtraFieldZip64Offset, BigInt(fileEntry.offset));
		rawExtraFieldZip64Offset += 8;
	}
	if (fileEntry.zip64DiskNumberStart) {
		setUint32(rawExtraFieldZip64View, rawExtraFieldZip64Offset, fileEntry.diskNumberStart);
	}
}

async function closeFile(zipWriter, comment, options) {
	const { files, writer } = zipWriter;
	const { diskOffset, writable } = writer;
	let { diskNumber } = writer;
	let offset = 0;
	let directoryDataLength = 0;
	let directoryOffset = zipWriter.offset - diskOffset;
	let filesLength = files.size;
	for (const [, fileEntry] of files) {
		const {
			rawFilename,
			rawExtraFieldZip64,
			rawExtraFieldAES,
			rawComment,
			rawExtraFieldNTFS,
			rawExtraField,
			extendedTimestamp,
			extraFieldExtendedTimestampFlag,
			lastModDate
		} = fileEntry;
		let rawExtraFieldTimestamp;
		if (extendedTimestamp) {
			rawExtraFieldTimestamp = new Uint8Array(9);
			const extraFieldExtendedTimestampView = getDataView(rawExtraFieldTimestamp);
			setUint16(extraFieldExtendedTimestampView, 0, EXTRAFIELD_TYPE_EXTENDED_TIMESTAMP);
			setUint16(extraFieldExtendedTimestampView, 2, 5);
			setUint8(extraFieldExtendedTimestampView, 4, extraFieldExtendedTimestampFlag);
			setUint32(extraFieldExtendedTimestampView, 5, Math.floor(lastModDate.getTime() / 1000));
		} else {
			rawExtraFieldTimestamp = new Uint8Array();
		}
		fileEntry.rawExtraFieldExtendedTimestamp = rawExtraFieldTimestamp;
		directoryDataLength += 46 +
			getLength(
				rawFilename,
				rawComment,
				rawExtraFieldZip64,
				rawExtraFieldAES,
				rawExtraFieldNTFS,
				rawExtraFieldTimestamp,
				rawExtraField);
	}
	const directoryArray = new Uint8Array(directoryDataLength);
	const directoryView = getDataView(directoryArray);
	await initStream(writer);
	let directoryDiskOffset = 0;
	for (const [indexFileEntry, fileEntry] of Array.from(files.values()).entries()) {
		const {
			offset: fileEntryOffset,
			rawFilename,
			rawExtraFieldZip64,
			rawExtraFieldAES,
			rawExtraFieldExtendedTimestamp,
			rawExtraFieldNTFS,
			rawExtraField,
			rawComment,
			versionMadeBy,
			headerArray,
			headerView,
			zip64,
			zip64UncompressedSize,
			zip64CompressedSize,
			zip64DiskNumberStart,
			zip64Offset,
			internalFileAttributes,
			externalFileAttributes,
			diskNumberStart,
			uncompressedSize,
			compressedSize
		} = fileEntry;
		const extraFieldLength = getLength(rawExtraFieldZip64, rawExtraFieldAES, rawExtraFieldExtendedTimestamp, rawExtraFieldNTFS, rawExtraField);
		setUint32(directoryView, offset, CENTRAL_FILE_HEADER_SIGNATURE);
		setUint16(directoryView, offset + 4, versionMadeBy);
		if (!zip64UncompressedSize) {
			setUint32(headerView, 18, uncompressedSize);
		}
		if (!zip64CompressedSize) {
			setUint32(headerView, 14, compressedSize);
		}
		arraySet(directoryArray, headerArray, offset + 6);
		let directoryOffset = offset + HEADER_SIZE + 4;
		setUint16(directoryView, directoryOffset, extraFieldLength);
		directoryOffset += 2;
		setUint16(directoryView, directoryOffset, getLength(rawComment));
		directoryOffset += 2;
		setUint16(directoryView, directoryOffset, zip64 && zip64DiskNumberStart ? MAX_16_BITS : diskNumberStart);
		directoryOffset += 2;
		setUint16(directoryView, directoryOffset, internalFileAttributes);
		directoryOffset += 2;
		if (externalFileAttributes) {
			setUint32(directoryView, directoryOffset, externalFileAttributes);
		}
		directoryOffset += 4;
		setUint32(directoryView, directoryOffset, zip64 && zip64Offset ? MAX_32_BITS : fileEntryOffset);
		directoryOffset += 4;
		arraySet(directoryArray, rawFilename, directoryOffset);
		directoryOffset += getLength(rawFilename);
		arraySet(directoryArray, rawExtraFieldZip64, directoryOffset);
		directoryOffset += getLength(rawExtraFieldZip64);
		arraySet(directoryArray, rawExtraFieldAES, directoryOffset);
		directoryOffset += getLength(rawExtraFieldAES);
		arraySet(directoryArray, rawExtraFieldExtendedTimestamp, directoryOffset);
		directoryOffset += getLength(rawExtraFieldExtendedTimestamp);
		arraySet(directoryArray, rawExtraFieldNTFS, directoryOffset);
		directoryOffset += getLength(rawExtraFieldNTFS);
		arraySet(directoryArray, rawExtraField, directoryOffset);
		directoryOffset += getLength(rawExtraField);
		arraySet(directoryArray, rawComment, directoryOffset);
		if (offset - directoryDiskOffset > writer.availableSize) {
			writer.availableSize = 0;
			await writeData(writable, directoryArray.slice(directoryDiskOffset, offset));
			directoryDiskOffset = offset;
		}
		offset = directoryOffset;
		if (options.onprogress) {
			try {
				await options.onprogress(indexFileEntry + 1, files.size, new Entry(fileEntry));
				// eslint-disable-next-line no-unused-vars
			} catch (_) {
				// ignored
			}
		}
	}
	await writeData(writable, directoryDiskOffset ? directoryArray.slice(directoryDiskOffset) : directoryArray);
	let lastDiskNumber = writer.diskNumber;
	const { availableSize } = writer;
	if (availableSize < END_OF_CENTRAL_DIR_LENGTH) {
		lastDiskNumber++;
	}
	let zip64 = getOptionValue(zipWriter, options, PROPERTY_NAME_ZIP64);
	if (directoryOffset > MAX_32_BITS || directoryDataLength > MAX_32_BITS || filesLength > MAX_16_BITS || lastDiskNumber > MAX_16_BITS) {
		if (zip64 === false) {
			throw new Error(ERR_UNSUPPORTED_FORMAT);
		} else {
			zip64 = true;
		}
	}
	const endOfdirectoryArray = new Uint8Array(zip64 ? ZIP64_END_OF_CENTRAL_DIR_TOTAL_LENGTH : END_OF_CENTRAL_DIR_LENGTH);
	const endOfdirectoryView = getDataView(endOfdirectoryArray);
	offset = 0;
	if (zip64) {
		setUint32(endOfdirectoryView, 0, ZIP64_END_OF_CENTRAL_DIR_SIGNATURE);
		setBigUint64(endOfdirectoryView, 4, BigInt(44));
		setUint16(endOfdirectoryView, 12, 45);
		setUint16(endOfdirectoryView, 14, 45);
		setUint32(endOfdirectoryView, 16, lastDiskNumber);
		setUint32(endOfdirectoryView, 20, diskNumber);
		setBigUint64(endOfdirectoryView, 24, BigInt(filesLength));
		setBigUint64(endOfdirectoryView, 32, BigInt(filesLength));
		setBigUint64(endOfdirectoryView, 40, BigInt(directoryDataLength));
		setBigUint64(endOfdirectoryView, 48, BigInt(directoryOffset));
		setUint32(endOfdirectoryView, 56, ZIP64_END_OF_CENTRAL_DIR_LOCATOR_SIGNATURE);
		setBigUint64(endOfdirectoryView, 64, BigInt(directoryOffset) + BigInt(directoryDataLength));
		setUint32(endOfdirectoryView, 72, lastDiskNumber + 1);
		const supportZip64SplitFile = getOptionValue(zipWriter, options, "supportZip64SplitFile", true);
		if (supportZip64SplitFile) {
			lastDiskNumber = MAX_16_BITS;
			diskNumber = MAX_16_BITS;
		}
		filesLength = MAX_16_BITS;
		directoryOffset = MAX_32_BITS;
		directoryDataLength = MAX_32_BITS;
		offset += ZIP64_END_OF_CENTRAL_DIR_LENGTH + ZIP64_END_OF_CENTRAL_DIR_LOCATOR_LENGTH;
	}
	setUint32(endOfdirectoryView, offset, END_OF_CENTRAL_DIR_SIGNATURE);
	setUint16(endOfdirectoryView, offset + 4, lastDiskNumber);
	setUint16(endOfdirectoryView, offset + 6, diskNumber);
	setUint16(endOfdirectoryView, offset + 8, filesLength);
	setUint16(endOfdirectoryView, offset + 10, filesLength);
	setUint32(endOfdirectoryView, offset + 12, directoryDataLength);
	setUint32(endOfdirectoryView, offset + 16, directoryOffset);
	const commentLength = getLength(comment);
	if (commentLength) {
		if (commentLength <= MAX_16_BITS) {
			setUint16(endOfdirectoryView, offset + 20, commentLength);
		} else {
			throw new Error(ERR_INVALID_COMMENT);
		}
	}
	await writeData(writable, endOfdirectoryArray);
	if (commentLength) {
		await writeData(writable, comment);
	}
}

async function writeData(writable, array) {
	const streamWriter = writable.getWriter();
	try {
		await streamWriter.ready;
		writable.size += getLength(array);
		await streamWriter.write(array);
	} finally {
		streamWriter.releaseLock();
	}
}

function getTimeNTFS(date) {
	if (date) {
		return ((BigInt(date.getTime()) + BigInt(11644473600000)) * BigInt(10000));
	}
}

function getOptionValue(zipWriter, options, name, defaultValue) {
	const result = options[name] === UNDEFINED_VALUE ? zipWriter.options[name] : options[name];
	return result === UNDEFINED_VALUE ? defaultValue : result;
}

function getMaximumCompressedSize(uncompressedSize) {
	return uncompressedSize + (5 * (Math.floor(uncompressedSize / 16383) + 1));
}

function setUint8(view, offset, value) {
	view.setUint8(offset, value);
}

function setUint16(view, offset, value) {
	view.setUint16(offset, value, true);
}

function setUint32(view, offset, value) {
	view.setUint32(offset, value, true);
}

function setBigUint64(view, offset, value) {
	view.setBigUint64(offset, value, true);
}

function arraySet(array, typedArray, offset) {
	array.set(typedArray, offset);
}

function getDataView(array) {
	return new DataView(array.buffer);
}

function getLength(...arrayLikes) {
	let result = 0;
	arrayLikes.forEach(arrayLike => arrayLike && (result += arrayLike.length));
	return result;
}

function getHeaderArrayData({
	version,
	bitflag,
	compressionMethod,
	uncompressedSize,
	compressedSize,
	lastModDate,
	rawFilename,
	zip64CompressedSize,
	zip64UncompressedSize,
	extraFieldLength
}) {
	const headerArray = new Uint8Array(HEADER_SIZE);
	const headerView = getDataView(headerArray);
	setUint16(headerView, 0, version);
	setUint16(headerView, 2, bitflag);
	setUint16(headerView, 4, compressionMethod);
	const dateArray = new Uint32Array(1);
	const dateView = getDataView(dateArray);
	setUint16(dateView, 0, (((lastModDate.getHours() << 6) | lastModDate.getMinutes()) << 5) | lastModDate.getSeconds() / 2);
	setUint16(dateView, 2, ((((lastModDate.getFullYear() - 1980) << 4) | (lastModDate.getMonth() + 1)) << 5) | lastModDate.getDate());
	const rawLastModDate = dateArray[0];
	setUint32(headerView, 6, rawLastModDate);
	if (zip64CompressedSize || compressedSize !== UNDEFINED_VALUE) {
		setUint32(headerView, 14, zip64CompressedSize ? MAX_32_BITS : compressedSize);
	}
	if (zip64UncompressedSize || uncompressedSize !== UNDEFINED_VALUE) {
		setUint32(headerView, 18, zip64UncompressedSize ? MAX_32_BITS : uncompressedSize);
	}
	setUint16(headerView, 22, getLength(rawFilename));
	setUint16(headerView, 24, extraFieldLength);
	return {
		headerArray,
		headerView,
		rawLastModDate
	};
}

function getBitflag(level, useUnicodeFileNames, dataDescriptor, encrypted) {
	let bitFlag = 0;
	if (useUnicodeFileNames) {
		bitFlag = bitFlag | BITFLAG_LANG_ENCODING_FLAG;
	}
	if (dataDescriptor) {
		bitFlag = bitFlag | BITFLAG_DATA_DESCRIPTOR;
	}
	if (level >= 1 && level < 3) {
		bitFlag = bitFlag | 0b110;
	}
	if (level >= 3 && level < 5) {
		bitFlag = bitFlag | 0b01;
	}
	if (level === 9) {
		bitFlag = bitFlag | 0b10;
	}
	if (encrypted) {
		bitFlag = bitFlag | BITFLAG_ENCRYPTED;
	}
	return bitFlag;
}
