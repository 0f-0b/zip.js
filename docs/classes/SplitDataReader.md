[**@zip.js/zip.js**](../README.md)

***

[@zip.js/zip.js](../globals.md) / SplitDataReader

# Class: SplitDataReader

Defined in: [index.d.ts:551](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L551)

Represents a [Reader](Reader.md) instance used to read data provided as an array of [ReadableReader](../interfaces/ReadableReader.md) instances (e.g. split zip files).

## Extends

- [`Reader`](Reader.md)\<[`Reader`](Reader.md)\<`unknown`\>[] \| [`ReadableReader`](../interfaces/ReadableReader.md)[] \| `ReadableStream`[]\>

## Extended by

- [`SplitZipReader`](SplitZipReader.md)

## Constructors

### Constructor

> **new SplitDataReader**(`value`): `SplitDataReader`

Defined in: [index.d.ts:498](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L498)

Creates the [Reader](Reader.md) instance

#### Parameters

##### value

The data to read.

[`Reader`](Reader.md)\<`unknown`\>[] | [`ReadableReader`](../interfaces/ReadableReader.md)[] | `ReadableStream`\<`any`\>[]

#### Returns

`SplitDataReader`

#### Inherited from

[`Reader`](Reader.md).[`constructor`](Reader.md#constructor)

## Properties

### readable

> **readable**: `ReadableStream`

Defined in: [index.d.ts:502](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L502)

The `ReadableStream` instance.

#### Inherited from

[`Reader`](Reader.md).[`readable`](Reader.md#readable)

***

### size

> **size**: `number`

Defined in: [index.d.ts:506](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L506)

The total size of the data in bytes.

#### Inherited from

[`Reader`](Reader.md).[`size`](Reader.md#size)

## Methods

### init()?

> `optional` **init**(): `Promise`\<`void`\>

Defined in: [index.d.ts:510](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L510)

Initializes the instance asynchronously

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`Reader`](Reader.md).[`init`](Reader.md#init)

***

### readUint8Array()

> **readUint8Array**(`index`, `length`): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

Defined in: [index.d.ts:518](https://github.com/gildas-lormeau/zip.js/blob/f3a32a7ff6dfd704bbdd861b62eec086ef8a7c94/index.d.ts#L518)

Reads a chunk of data

#### Parameters

##### index

`number`

The byte index of the data to read.

##### length

`number`

The length of the data to read in bytes.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

A promise resolving to a chunk of data.

#### Inherited from

[`Reader`](Reader.md).[`readUint8Array`](Reader.md#readuint8array)
