[**@zip.js/zip.js**](../README.md)

***

[@zip.js/zip.js](../globals.md) / ZipDirectoryEntry

# Class: ZipDirectoryEntry

Defined in: [index.d.ts:1653](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1653)

Represents a directory entry in the zip (Filesystem API).

## Extends

- [`ZipEntry`](ZipEntry.md)

## Extended by

- [`FS`](FS.md)

## Constructors

### new ZipDirectoryEntry()

> **new ZipDirectoryEntry**(): [`ZipDirectoryEntry`](ZipDirectoryEntry.md)

#### Returns

[`ZipDirectoryEntry`](ZipDirectoryEntry.md)

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`constructor`](ZipEntry.md#constructors)

## Properties

### children

> **children**: [`ZipEntry`](ZipEntry.md)[]

Defined in: [index.d.ts:1492](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1492)

The children of the entry.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`children`](ZipEntry.md#children)

***

### data?

> `optional` **data**: [`EntryMetaData`](../interfaces/EntryMetaData.md)

Defined in: [index.d.ts:1476](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1476)

The underlying [EntryMetaData](../interfaces/EntryMetaData.md) instance.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`data`](ZipEntry.md#data)

***

### directory

> **directory**: `true`

Defined in: [index.d.ts:1657](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1657)

`true` for  [ZipDirectoryEntry](ZipDirectoryEntry.md) instances.

***

### id

> **id**: `number`

Defined in: [index.d.ts:1480](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1480)

The ID of the instance.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`id`](ZipEntry.md#id)

***

### name

> **name**: `string`

Defined in: [index.d.ts:1472](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1472)

The relative filename of the entry.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`name`](ZipEntry.md#name)

***

### parent?

> `optional` **parent**: [`ZipEntry`](ZipEntry.md)

Defined in: [index.d.ts:1484](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1484)

The parent directory of the entry.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`parent`](ZipEntry.md#parent)

***

### uncompressedSize

> **uncompressedSize**: `number`

Defined in: [index.d.ts:1488](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1488)

The uncompressed size of the content.

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`uncompressedSize`](ZipEntry.md#uncompressedsize)

## Methods

### addBlob()

> **addBlob**(`name`, `blob`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`Blob`, `Blob`\>

Defined in: [index.d.ts:1697](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1697)

Adds a entry entry with content provided as a `Blob` instance

#### Parameters

##### name

`string`

The relative filename of the entry.

##### blob

`Blob`

The `Blob` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`Blob`, `Blob`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### addData64URI()

> **addData64URI**(`name`, `dataURI`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`string`, `string`\>

Defined in: [index.d.ts:1710](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1710)

Adds a entry entry with content provided as a Data URI `string` encoded in Base64

#### Parameters

##### name

`string`

The relative filename of the entry.

##### dataURI

`string`

The Data URI `string` encoded in Base64.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`string`, `string`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### addDirectory()

> **addDirectory**(`name`, `options`?): [`ZipDirectoryEntry`](ZipDirectoryEntry.md)

Defined in: [index.d.ts:1672](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1672)

Adds a directory

#### Parameters

##### name

`string`

The relative filename of the directory.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipDirectoryEntry`](ZipDirectoryEntry.md)

A [ZipDirectoryEntry](ZipDirectoryEntry.md) instance.

***

### addFile()

> **addFile**(`file`, `options`?): `Promise`\<[`ZipEntry`](ZipEntry.md)\>

Defined in: [index.d.ts:1761](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1761)

Adds an entry with content provided via a `File` instance

#### Parameters

##### file

`File`

The `File` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

`Promise`\<[`ZipEntry`](ZipEntry.md)\>

A promise resolving to a [ZipFileEntry](ZipFileEntry.md) or a [ZipDirectoryEntry](ZipDirectoryEntry.md) instance.

***

### addFileSystemEntry()

> **addFileSystemEntry**(`fileSystemEntry`, `options`?): `Promise`\<[`ZipEntry`](ZipEntry.md)[]\>

Defined in: [index.d.ts:1772](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1772)

Adds an entry with content provided via a `FileSystemEntry` instance

#### Parameters

##### fileSystemEntry

[`FileSystemEntryLike`](../interfaces/FileSystemEntryLike.md)

The `FileSystemEntry` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

`Promise`\<[`ZipEntry`](ZipEntry.md)[]\>

A promise resolving to an array of [ZipFileEntry](ZipFileEntry.md) or a [ZipDirectoryEntry](ZipDirectoryEntry.md) instances.

***

### addFileSystemHandle()

> **addFileSystemHandle**(`fileSystemHandle`, `options`?): `Promise`\<[`ZipEntry`](ZipEntry.md)[]\>

Defined in: [index.d.ts:1783](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1783)

Adds an entry with content provided via a `FileSystemHandle` instance

#### Parameters

##### fileSystemHandle

[`FileSystemHandleLike`](../interfaces/FileSystemHandleLike.md)

The `fileSystemHandle` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

`Promise`\<[`ZipEntry`](ZipEntry.md)[]\>

A promise resolving to an array of [ZipFileEntry](ZipFileEntry.md) or a [ZipDirectoryEntry](ZipDirectoryEntry.md) instances.

***

### addHttpContent()

> **addHttpContent**(`name`, `url`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`string`, `void`\>

Defined in: [index.d.ts:1736](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1736)

Adds an entry with content fetched from a URL

#### Parameters

##### name

`string`

The relative filename of the entry.

##### url

`string`

The URL.

##### options?

[`HttpOptions`](../interfaces/HttpOptions.md) & [`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`string`, `void`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### addReadable()

> **addReadable**(`name`, `readable`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`ReadableStream`, `void`\>

Defined in: [index.d.ts:1749](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1749)

Adds a entry entry with content provided via a `ReadableStream` instance

#### Parameters

##### name

`string`

The relative filename of the entry.

##### readable

`ReadableStream`

The `ReadableStream` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`ReadableStream`, `void`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### addText()

> **addText**(`name`, `text`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`string`, `string`\>

Defined in: [index.d.ts:1684](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1684)

Adds an entry with content provided as text

#### Parameters

##### name

`string`

The relative filename of the entry.

##### text

`string`

The text.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`string`, `string`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### addUint8Array()

> **addUint8Array**(`name`, `array`, `options`?): [`ZipFileEntry`](ZipFileEntry.md)\<`Uint8Array`, `Uint8Array`\>

Defined in: [index.d.ts:1723](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1723)

Adds an entry with content provided as a `Uint8Array` instance

#### Parameters

##### name

`string`

The relative filename of the entry.

##### array

`Uint8Array`

The `Uint8Array` instance.

##### options?

[`ZipWriterAddDataOptions`](../interfaces/ZipWriterAddDataOptions.md)

The options.

#### Returns

[`ZipFileEntry`](ZipFileEntry.md)\<`Uint8Array`, `Uint8Array`\>

A [ZipFileEntry](ZipFileEntry.md) instance.

***

### checkPassword()

> **checkPassword**(`password`, `options`?): `Promise`\<`boolean`\>

Defined in: [index.d.ts:1520](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1520)

Tests the password on the entry and all children if any, returns `true` if the entry is not password protected

#### Parameters

##### password

`string`

##### options?

[`EntryGetDataOptions`](../interfaces/EntryGetDataOptions.md)

#### Returns

`Promise`\<`boolean`\>

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`checkPassword`](ZipEntry.md#checkpassword)

***

### clone()

> **clone**(`deepClone`?): [`ZipEntry`](ZipEntry.md)

Defined in: [index.d.ts:1498](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1498)

Clones the entry

#### Parameters

##### deepClone?

`boolean`

`true` to clone all the descendants.

#### Returns

[`ZipEntry`](ZipEntry.md)

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`clone`](ZipEntry.md#clone)

***

### exportBlob()

> **exportBlob**(`options`?): `Promise`\<`Blob`\>

Defined in: [index.d.ts:1859](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1859)

Returns a `Blob` instance containing a zip file of the entry and its descendants

#### Parameters

##### options?

[`ZipDirectoryEntryExportOptions`](../interfaces/ZipDirectoryEntryExportOptions.md)

The options.

#### Returns

`Promise`\<`Blob`\>

A promise resolving to the `Blob` instance.

***

### exportData64URI()

> **exportData64URI**(`options`?): `Promise`\<`string`\>

Defined in: [index.d.ts:1866](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1866)

Returns a Data URI `string` encoded in Base64 containing a zip file of the entry and its descendants

#### Parameters

##### options?

[`ZipDirectoryEntryExportOptions`](../interfaces/ZipDirectoryEntryExportOptions.md)

The options.

#### Returns

`Promise`\<`string`\>

A promise resolving to the Data URI `string` encoded in Base64.

***

### exportUint8Array()

> **exportUint8Array**(`options`?): `Promise`\<`Uint8Array`\>

Defined in: [index.d.ts:1873](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1873)

Returns a `Uint8Array` instance containing a zip file of the entry and its descendants

#### Parameters

##### options?

[`ZipDirectoryEntryExportOptions`](../interfaces/ZipDirectoryEntryExportOptions.md)

The options.

#### Returns

`Promise`\<`Uint8Array`\>

A promise resolving to the `Uint8Array` instance.

***

### exportWritable()

> **exportWritable**(`writable`?, `options`?): `Promise`\<`WritableStream`\>

Defined in: [index.d.ts:1883](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1883)

Creates a zip file via a `WritableStream` instance containing the entry and its descendants

#### Parameters

##### writable?

`WritableStream`

The `WritableStream` instance.

##### options?

[`ZipDirectoryEntryExportOptions`](../interfaces/ZipDirectoryEntryExportOptions.md)

The options.

#### Returns

`Promise`\<`WritableStream`\>

A promise resolving to the `Uint8Array` instance.

***

### exportZip()

> **exportZip**(`writer`, `options`?): `Promise`\<`unknown`\>

Defined in: [index.d.ts:1894](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1894)

Creates a zip file via a custom [Writer](Writer.md) instance containing the entry and its descendants

#### Parameters

##### writer

The [Writer](Writer.md) instance.

`WritableStream` | [`WritableWriter`](../interfaces/WritableWriter.md) | [`Writer`](Writer.md)\<`unknown`\> | `AsyncGenerator`\<`WritableStream` \| [`WritableWriter`](../interfaces/WritableWriter.md) \| [`Writer`](Writer.md)\<`unknown`\>\>

##### options?

[`ZipDirectoryEntryExportOptions`](../interfaces/ZipDirectoryEntryExportOptions.md)

The options.

#### Returns

`Promise`\<`unknown`\>

A promise resolving to the data.

***

### getChildByName()

> **getChildByName**(`name`): [`ZipEntry`](ZipEntry.md)

Defined in: [index.d.ts:1664](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1664)

Gets a [ZipEntry](ZipEntry.md) child instance from its relative filename

#### Parameters

##### name

`string`

The relative filename.

#### Returns

[`ZipEntry`](ZipEntry.md)

A [ZipFileEntry](ZipFileEntry.md) or a [ZipDirectoryEntry](ZipDirectoryEntry.md) instance (use the [ZipFileEntry#directory](ZipFileEntry.md#directory) and [ZipDirectoryEntry#directory](ZipDirectoryEntry.md#directory) properties to differentiate entries).

***

### getFullname()

> **getFullname**(): `string`

Defined in: [index.d.ts:1502](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1502)

Returns the full filename of the entry

#### Returns

`string`

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`getFullname`](ZipEntry.md#getfullname)

***

### getRelativeName()

> **getRelativeName**(`ancestor`): `string`

Defined in: [index.d.ts:1506](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1506)

Returns the filename of the entry relative to a parent directory

#### Parameters

##### ancestor

[`ZipDirectoryEntry`](ZipDirectoryEntry.md)

#### Returns

`string`

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`getRelativeName`](ZipEntry.md#getrelativename)

***

### importBlob()

> **importBlob**(`blob`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1793](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1793)

Extracts a zip file provided as a `Blob` instance into the entry

#### Parameters

##### blob

`Blob`

The `Blob` instance.

##### options?

[`ZipReaderConstructorOptions`](../interfaces/ZipReaderConstructorOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### importData64URI()

> **importData64URI**(`dataURI`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1803](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1803)

Extracts a zip file provided as a Data URI `string` encoded in Base64 into the entry

#### Parameters

##### dataURI

`string`

The Data URI `string` encoded in Base64.

##### options?

[`ZipReaderConstructorOptions`](../interfaces/ZipReaderConstructorOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### importHttpContent()

> **importHttpContent**(`url`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1823](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1823)

Extracts a zip file fetched from a URL into the entry

#### Parameters

##### url

`string`

The URL.

##### options?

[`ZipDirectoryEntryImportHttpOptions`](../interfaces/ZipDirectoryEntryImportHttpOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### importReadable()

> **importReadable**(`readable`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1833](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1833)

Extracts a zip file provided via a `ReadableStream` instance into the entry

#### Parameters

##### readable

`ReadableStream`

The `ReadableStream` instance.

##### options?

[`ZipReaderConstructorOptions`](../interfaces/ZipReaderConstructorOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### importUint8Array()

> **importUint8Array**(`array`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1813](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1813)

Extracts a zip file provided as a `Uint8Array` instance into the entry

#### Parameters

##### array

`Uint8Array`

The `Uint8Array` instance.

##### options?

[`ZipReaderConstructorOptions`](../interfaces/ZipReaderConstructorOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### importZip()

> **importZip**(`reader`, `options`?): `Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

Defined in: [index.d.ts:1843](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1843)

Extracts a zip file provided via a custom [Reader](Reader.md) instance into the entry

#### Parameters

##### reader

The [Reader](Reader.md) instance.

`ReadableStream` | [`ReadableReader`](../interfaces/ReadableReader.md) | [`Reader`](Reader.md)\<`unknown`\> | [`Reader`](Reader.md)\<`unknown`\>[] | [`ReadableReader`](../interfaces/ReadableReader.md)[] | `ReadableStream`[]

##### options?

[`ZipReaderConstructorOptions`](../interfaces/ZipReaderConstructorOptions.md)

The options.

#### Returns

`Promise`\<\[[`ZipEntry`](ZipEntry.md)\]\>

***

### isDescendantOf()

> **isDescendantOf**(`ancestor`): `boolean`

Defined in: [index.d.ts:1512](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1512)

Tests if a [ZipDirectoryEntry](ZipDirectoryEntry.md) instance is an ancestor of the entry

#### Parameters

##### ancestor

[`ZipDirectoryEntry`](ZipDirectoryEntry.md)

The [ZipDirectoryEntry](ZipDirectoryEntry.md) instance.

#### Returns

`boolean`

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`isDescendantOf`](ZipEntry.md#isdescendantof)

***

### isPasswordProtected()

> **isPasswordProtected**(): `boolean`

Defined in: [index.d.ts:1516](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1516)

Tests if the entry or any of its children is password protected

#### Returns

`boolean`

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`isPasswordProtected`](ZipEntry.md#ispasswordprotected)

***

### rename()

> **rename**(`name`): `void`

Defined in: [index.d.ts:1529](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1529)

Set the name of the entry

#### Parameters

##### name

`string`

The new name of the entry.

#### Returns

`void`

#### Inherited from

[`ZipEntry`](ZipEntry.md).[`rename`](ZipEntry.md#rename)
