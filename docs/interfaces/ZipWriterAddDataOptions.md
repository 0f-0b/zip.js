[**@zip.js/zip.js**](../README.md)

***

[@zip.js/zip.js](../globals.md) / ZipWriterAddDataOptions

# Interface: ZipWriterAddDataOptions

Defined in: [index.d.ts:1179](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1179)

Represents the options passed to [ZipWriter#add](../classes/ZipWriter.md#add).

## Extends

- [`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`EntryDataOnprogressOptions`](EntryDataOnprogressOptions.md).[`WorkerConfiguration`](WorkerConfiguration.md)

## Properties

### bufferedWrite?

> `optional` **bufferedWrite**: `boolean`

Defined in: [index.d.ts:1265](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1265)

`true` to write entry data in a buffer before appending it to the zip file.

`bufferedWrite` is automatically set to `true` when compressing more than one entry in parallel.

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`bufferedWrite`](ZipWriterConstructorOptions.md#bufferedwrite)

***

### comment?

> `optional` **comment**: `string`

Defined in: [index.d.ts:1199](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1199)

The comment of the entry.

***

### compressionMethod?

> `optional` **compressionMethod**: `number`

Defined in: [index.d.ts:1408](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1408)

The compression method (e.g. 8 for DEFLATE, 0 for STORE).

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`compressionMethod`](ZipWriterConstructorOptions.md#compressionmethod)

***

### creationDate?

> `optional` **creationDate**: `Date`

Defined in: [index.d.ts:1314](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1314)

The creation date.

This option is ignored if the [ZipWriterConstructorOptions#extendedTimestamp](ZipWriterConstructorOptions.md#extendedtimestamp) option is set to `false`.

#### Default Value

```ts
The current date.
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`creationDate`](ZipWriterConstructorOptions.md#creationdate)

***

### dataDescriptor?

> `optional` **dataDescriptor**: `boolean`

Defined in: [index.d.ts:1356](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1356)

`true` to add a data descriptor.

When set to `false`, the [ZipWriterConstructorOptions#bufferedWrite](ZipWriterConstructorOptions.md#bufferedwrite) option  will automatically be set to `true`.

#### Default Value

```ts
true
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`dataDescriptor`](ZipWriterConstructorOptions.md#datadescriptor)

***

### dataDescriptorSignature?

> `optional` **dataDescriptorSignature**: `boolean`

Defined in: [index.d.ts:1362](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1362)

`true` to add the signature of the data descriptor.

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`dataDescriptorSignature`](ZipWriterConstructorOptions.md#datadescriptorsignature)

***

### directory?

> `optional` **directory**: `boolean`

Defined in: [index.d.ts:1189](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1189)

`true` if the entry is a directory.

#### Default Value

```ts
false
```

***

### encrypted?

> `optional` **encrypted**: `boolean`

Defined in: [index.d.ts:1400](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1400)

`true` to write encrypted data when `passThrough` is set to `true`.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`encrypted`](ZipWriterConstructorOptions.md#encrypted)

***

### encryptionStrength?

> `optional` **encryptionStrength**: `1` \| `2` \| `3`

Defined in: [index.d.ts:1288](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1288)

The encryption strength (AES).

#### Default Value

```ts
3
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`encryptionStrength`](ZipWriterConstructorOptions.md#encryptionstrength)

***

### executable?

> `optional` **executable**: `boolean`

Defined in: [index.d.ts:1195](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1195)

`true` if the entry is an executable file.

#### Default Value

```ts
false
```

***

### extendedTimestamp?

> `optional` **extendedTimestamp**: `boolean`

Defined in: [index.d.ts:1322](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1322)

`true` to store extended timestamp extra fields.

When set to `false`, the maximum last modification date cannot exceed November 31, 2107 and the maximum accuracy is 2 seconds.

#### Default Value

```ts
true
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`extendedTimestamp`](ZipWriterConstructorOptions.md#extendedtimestamp)

***

### externalFileAttributes?

> `optional` **externalFileAttributes**: `number`

Defined in: [index.d.ts:1374](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1374)

The external file attribute.

#### Default Value

```ts
0
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`externalFileAttributes`](ZipWriterConstructorOptions.md#externalfileattributes)

***

### extraField?

> `optional` **extraField**: `Map`\<`number`, `Uint8Array`\>

Defined in: [index.d.ts:1203](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1203)

The extra field of the entry.

***

### internalFileAttributes?

> `optional` **internalFileAttributes**: `number`

Defined in: [index.d.ts:1380](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1380)

The internal file attribute.

#### Default Value

```ts
0
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`internalFileAttributes`](ZipWriterConstructorOptions.md#internalfileattributes)

***

### keepOrder?

> `optional` **keepOrder**: `boolean`

Defined in: [index.d.ts:1274](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1274)

`true` to keep the order of the entry physically in the zip file.

When set to `true`, the use of web workers will be improved. However, it also prevents files larger than 4GB from being created without setting the `zip64` option to `true` explicitly.
Another solution to improve the use of web workers is to add entries from smallest to largest in uncompressed size.

#### Default Value

```ts
true
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`keepOrder`](ZipWriterConstructorOptions.md#keeporder)

***

### lastAccessDate?

> `optional` **lastAccessDate**: `Date`

Defined in: [index.d.ts:1306](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1306)

The last access date.

This option is ignored if the [ZipWriterConstructorOptions#extendedTimestamp](ZipWriterConstructorOptions.md#extendedtimestamp) option is set to `false`.

#### Default Value

```ts
The current date.
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`lastAccessDate`](ZipWriterConstructorOptions.md#lastaccessdate)

***

### lastModDate?

> `optional` **lastModDate**: `Date`

Defined in: [index.d.ts:1298](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1298)

The last modification date.

#### Default Value

```ts
The current date.
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`lastModDate`](ZipWriterConstructorOptions.md#lastmoddate)

***

### level?

> `optional` **level**: `number`

Defined in: [index.d.ts:1257](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1257)

The level of compression.

The minimum value is 0 and means that no compression is applied. The maximum value is 9.

#### Default Value

```ts
5
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`level`](ZipWriterConstructorOptions.md#level)

***

### msDosCompatible?

> `optional` **msDosCompatible**: `boolean`

Defined in: [index.d.ts:1368](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1368)

`true` to write [EntryMetaData#externalFileAttributes](EntryMetaData.md#externalfileattributes) in MS-DOS format for folder entries.

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`msDosCompatible`](ZipWriterConstructorOptions.md#msdoscompatible)

***

### offset?

> `optional` **offset**: `number`

Defined in: [index.d.ts:1404](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1404)

The offset of the first entry in the zip file.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`offset`](ZipWriterConstructorOptions.md#offset)

***

### passThrough?

> `optional` **passThrough**: `boolean`

Defined in: [index.d.ts:1396](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1396)

`true` to write the data as-is without compressing it and without crypting it.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`passThrough`](ZipWriterConstructorOptions.md#passthrough)

***

### password?

> `optional` **password**: `string`

Defined in: [index.d.ts:1278](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1278)

The password used to encrypt the content of the entry.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`password`](ZipWriterConstructorOptions.md#password)

***

### preventClose?

> `optional` **preventClose**: `boolean`

Defined in: [index.d.ts:1249](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1249)

`true` to prevent closing of [WritableWriter#writable](WritableWriter.md#writable).

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`preventClose`](ZipWriterConstructorOptions.md#preventclose)

***

### rawPassword?

> `optional` **rawPassword**: `Uint8Array`

Defined in: [index.d.ts:1282](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1282)

The password used to encrypt the content of the entry (raw).

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`rawPassword`](ZipWriterConstructorOptions.md#rawpassword)

***

### signal?

> `optional` **signal**: `AbortSignal`

Defined in: [index.d.ts:1292](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1292)

The `AbortSignal` instance used to cancel the compression.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`signal`](ZipWriterConstructorOptions.md#signal)

***

### signature?

> `optional` **signature**: `number`

Defined in: [index.d.ts:1211](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1211)

The signature (CRC32 checksum) of the content. This option is ignored if the [ZipWriterConstructorOptions#passThrough](ZipWriterConstructorOptions.md#passthrough) option is not set to `true`.

***

### supportZip64SplitFile?

> `optional` **supportZip64SplitFile**: `boolean`

Defined in: [index.d.ts:1386](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1386)

`false` to never write disk numbers in zip64 data.

#### Default Value

```ts
true
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`supportZip64SplitFile`](ZipWriterConstructorOptions.md#supportzip64splitfile)

***

### uncompressedSize?

> `optional` **uncompressedSize**: `number`

Defined in: [index.d.ts:1207](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1207)

The uncompressed size of the entry. This option is ignored if the [ZipWriterConstructorOptions#passThrough](ZipWriterConstructorOptions.md#passthrough) option is not set to `true`.

***

### usdz?

> `optional` **usdz**: `boolean`

Defined in: [index.d.ts:1392](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1392)

`true`to produce zip files compatible with the USDZ specification.

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`usdz`](ZipWriterConstructorOptions.md#usdz)

***

### useCompressionStream?

> `optional` **useCompressionStream**: `boolean`

Defined in: [index.d.ts:143](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L143)

`true` to use the native API `CompressionStream`/`DecompressionStream` to compress/decompress data.

#### Default Value

```ts
true
```

#### Inherited from

[`WorkerConfiguration`](WorkerConfiguration.md).[`useCompressionStream`](WorkerConfiguration.md#usecompressionstream)

***

### useUnicodeFileNames?

> `optional` **useUnicodeFileNames**: `boolean`

Defined in: [index.d.ts:1348](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1348)

`true` to mark the file names as UTF-8 setting the general purpose bit 11 in the header (see Appendix D - Language Encoding (EFS)), `false` to mark the names as compliant with the original IBM Code Page 437.

Note that this does not ensure that the file names are in the correct encoding.

#### Default Value

```ts
true
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`useUnicodeFileNames`](ZipWriterConstructorOptions.md#useunicodefilenames)

***

### useWebWorkers?

> `optional` **useWebWorkers**: `boolean`

Defined in: [index.d.ts:137](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L137)

`true` to use web workers to compress/decompress data in non-blocking background processes.

#### Default Value

```ts
true
```

#### Inherited from

[`WorkerConfiguration`](WorkerConfiguration.md).[`useWebWorkers`](WorkerConfiguration.md#usewebworkers)

***

### version?

> `optional` **version**: `number`

Defined in: [index.d.ts:1334](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1334)

The "Version" field.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`version`](ZipWriterConstructorOptions.md#version)

***

### versionMadeBy?

> `optional` **versionMadeBy**: `number`

Defined in: [index.d.ts:1340](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1340)

The "Version made by" field.

#### Default Value

```ts
20
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`versionMadeBy`](ZipWriterConstructorOptions.md#versionmadeby)

***

### zip64?

> `optional` **zip64**: `boolean`

Defined in: [index.d.ts:1243](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1243)

`true` to use Zip64 to store the entry.

`zip64` is automatically set to `true` when necessary (e.g. compressed data larger than 4GB or with unknown size).

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`zip64`](ZipWriterConstructorOptions.md#zip64)

***

### zipCrypto?

> `optional` **zipCrypto**: `boolean`

Defined in: [index.d.ts:1330](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1330)

`true` to use the ZipCrypto algorithm to encrypt the content of the entry.

It is not recommended to set `zipCrypto` to `true` because the ZipCrypto encryption can be easily broken.

#### Default Value

```ts
false
```

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`zipCrypto`](ZipWriterConstructorOptions.md#zipcrypto)

## Methods

### encodeText()?

> `optional` **encodeText**(`text`): `Uint8Array`

Defined in: [index.d.ts:1415](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1415)

Encode the filename and the comment of the entry.

#### Parameters

##### text

`string`

The text to encode.

#### Returns

`Uint8Array`

The encoded text or `undefined` if the text should be encoded by zip.js.

#### Inherited from

[`ZipWriterConstructorOptions`](ZipWriterConstructorOptions.md).[`encodeText`](ZipWriterConstructorOptions.md#encodetext)

***

### onend()?

> `optional` **onend**(`computedSize`): `Promise`\<`void`\>

Defined in: [index.d.ts:1443](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1443)

The function called when ending compression/decompression.

#### Parameters

##### computedSize

`number`

The total number of bytes (computed).

#### Returns

`Promise`\<`void`\>

An empty promise or `undefined`.

#### Inherited from

[`EntryDataOnprogressOptions`](EntryDataOnprogressOptions.md).[`onend`](EntryDataOnprogressOptions.md#onend)

***

### onprogress()?

> `optional` **onprogress**(`progress`, `total`): `Promise`\<`void`\>

Defined in: [index.d.ts:1436](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1436)

The function called during compression/decompression.

#### Parameters

##### progress

`number`

The current progress in bytes.

##### total

`number`

The total number of bytes.

#### Returns

`Promise`\<`void`\>

An empty promise or `undefined`.

#### Inherited from

[`EntryDataOnprogressOptions`](EntryDataOnprogressOptions.md).[`onprogress`](EntryDataOnprogressOptions.md#onprogress)

***

### onstart()?

> `optional` **onstart**(`total`): `Promise`\<`void`\>

Defined in: [index.d.ts:1428](https://github.com/gildas-lormeau/zip.js/blob/6e0fd98b749fcfd4608f898ad72964d533d72ffa/index.d.ts#L1428)

The function called when starting compression/decompression.

#### Parameters

##### total

`number`

The total number of bytes.

#### Returns

`Promise`\<`void`\>

An empty promise or `undefined`.

#### Inherited from

[`EntryDataOnprogressOptions`](EntryDataOnprogressOptions.md).[`onstart`](EntryDataOnprogressOptions.md#onstart)
