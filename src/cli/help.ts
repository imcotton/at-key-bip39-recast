export const summary: string = `
Available commands:

    gen [--size] <INPUTS>

    extract [OPTIONS] <mnemonic sentence>
`;





export const gen: string = `
Usage: gen [OPTIONS] <INPUTS>

OPTIONS:
  --size           Mnemonic sentence size: 12, 15, 18, 21, 24

INPUTS:
  --bin            Input in binary format [0|1].
  --dec            Input in decimal format.
  --hex            Input in hexadecimal format (default).
  --base58         Input in Base58.
  --base64         Input in Base64.
`;





export const extract: string = `
Usage: extract [OPTIONS] <mnemonic sentence>

Extract out the entropy from a BIP-39 mnemonic sentence.

OPTIONS:
  --raw            Output the raw entropy.
  --bin            Output in binary format.
  --dec            Output in decimal format.
  --hex            Output in hexadecimal format (default).
  --base58         Output in Base58.
  --base64         Output in Base64.
`;

