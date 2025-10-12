import { webcrypto } from './utils.ts';





export const PBKDF2 = gen_PBKDF2({
    byte: 64,
    hash: 'SHA-512',
    iterations: 2048,
});





export function normalize (str: string) {

    return new TextEncoder().encode(str.normalize('NFKD'));

}





export function gen_PBKDF2 ({ hash, byte, iterations }: {

        byte: number,
        hash: `SHA-${ 256 | 512 }`,
        iterations: number,

}) {

    return async function ({ salt, passphrase }: {

            salt: BufferSource,
            passphrase: BufferSource,

    }): Promise<ArrayBuffer> {

        const name = 'PBKDF2';

        const base = await webcrypto.subtle.importKey(
            'raw',
            passphrase,
            { name },
            false,
            [ 'deriveBits' ],
        );

        return webcrypto.subtle.deriveBits(
            { name, salt, hash, iterations },
            base,
            byte * 8,
        );

    };

}

