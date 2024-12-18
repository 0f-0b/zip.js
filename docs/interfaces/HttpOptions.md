[**@zip.js/zip.js**](../README.md)

***

[@zip.js/zip.js](../globals.md) / HttpOptions

# Interface: HttpOptions

Represents the options passed to the constructor of [HttpReader](../classes/HttpReader.md).

## Extends

- [`HttpRangeOptions`](HttpRangeOptions.md)

## Extended by

- [`ZipDirectoryEntryImportHttpOptions`](ZipDirectoryEntryImportHttpOptions.md)

## Properties

### combineSizeEocd?

> `optional` **combineSizeEocd**: `boolean`

`true` to use `Range: bytes=-22` on the first request and cache the EOCD, make sure beforehand that the server supports a suffix range request.

#### Default Value

```ts
false
```

#### Defined in

[index.d.ts:453](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L453)

***

### forceRangeRequests?

> `optional` **forceRangeRequests**: `boolean`

`true` to always use `Range` headers when fetching data.

#### Default Value

```ts
false
```

#### Defined in

[index.d.ts:440](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L440)

***

### headers?

> `optional` **headers**: `Iterable`\<[`string`, `string`], `any`, `any`\> \| `Map`\<`string`, `string`\>

The HTTP headers.

#### Inherited from

[`HttpRangeOptions`](HttpRangeOptions.md).[`headers`](HttpRangeOptions.md#headers)

#### Defined in

[index.d.ts:469](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L469)

***

### preventHeadRequest?

> `optional` **preventHeadRequest**: `boolean`

`true` to prevent using `HEAD` HTTP request in order the get the size of the content.
`false` to explicitly use `HEAD`, this is useful in case of CORS where `Access-Control-Expose-Headers: Content-Range` is not returned by the server.

#### Default Value

```ts
false
```

#### Defined in

[index.d.ts:447](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L447)

***

### useRangeHeader?

> `optional` **useRangeHeader**: `boolean`

`true` to use `Range` headers when fetching data from servers returning `Accept-Ranges` headers.

#### Default Value

```ts
false
```

#### Defined in

[index.d.ts:434](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L434)

***

### useXHR?

> `optional` **useXHR**: `boolean`

`true` to rely `XMLHttpRequest` instead of `fetch` to fetch data.

#### Default Value

```ts
false
```

#### Inherited from

[`HttpRangeOptions`](HttpRangeOptions.md).[`useXHR`](HttpRangeOptions.md#usexhr)

#### Defined in

[index.d.ts:465](https://github.com/gildas-lormeau/zip.js/blob/24ecd74cb4237f29fe97eb10cff1144c3877ce3d/index.d.ts#L465)
