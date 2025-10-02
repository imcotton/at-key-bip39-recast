# `bip39-recast`

[![jsr](https://jsr.io/badges/@key/bip39-recast)](https://jsr.io/@key/bip39-recast)
[![npm](https://badgen.net/npm/v/bip39-recast)](https://www.npmjs.com/package/bip39-recast)
[![codecov](https://codecov.io/gh/imcotton/at-key-bip39-recast/graph/badge.svg)](https://codecov.io/gh/imcotton/at-key-bip39-recast)

> convert bip39 mnemonic sentence from / to entropy





## Web

- https://bip39-recast.js.org (GitHub Pages)
- https://bip39-recast.pages.dev (Cloudflare Pages)





## CLI

recommend using **Deno**:

```
deno      npm:bip39-recast
deno jsr:@key/bip39-recast
```

<details>

<summary>also available from: npx, bun, pnpm, yarn etc...</summary>

```
npx      bip39-recast
bun    x bip39-recast
pnpm dlx bip39-recast
yarn dlx bip39-recast
```
</details>



### `gen`

    gen [OPTIONS] <INPUTS>
  
    OPTIONS:
      --size           Mnemonic sentence size: 12, 15, 18, 21, 24
  
    INPUTS:
      --bin            Input in binary format [0|1].
      --dec            Input in decimal format.
      --hex            Input in hexadecimal format (default).
      --base58         Input in Base58.
      --base64         Input in Base64.
      --rgba           Input [ rgba(), ... ].



### `extract`

    extract [OPTIONS] <mnemonic sentence>

    OPTIONS:
      --raw            Output the raw bytes.
      --bin            Output in binary format.
      --dec            Output in decimal format.
      --hex            Output in hexadecimal format (default).
      --base58         Output in Base58.
      --base64         Output in Base64.
      --rgba           Output in [ rgba(), ... ].





## License

the **MIT**

