import { encodeHex,    decodeHex    } from '@std/encoding/hex';
import { encodeBase58, decodeBase58 } from '@std/encoding/base58';
import { encodeBase64, decodeBase64 } from '@std/encoding/base64';





export const { crypto: webcrypto } = globalThis;





export type U8Arr = ReturnType<typeof Uint8Array.of>;





function id <T> (a: T) {

    return a;

}





export const sha256 = shasum('SHA-256');

export const sha512 = shasum('SHA-512');

export function shasum (algo: `SHA-${ '256' | '384' | '512' }`) {

    return function (data: BufferSource) {

        return webcrypto.subtle.digest(algo, data);

    };

}





export function mk_Uint8Array (buf: U8Arr | ArrayBuffer) {

    return ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);

}





export function encode_hex (data: U8Arr | ArrayBuffer) {

    // @ts-ignore polyfill
    const result = data.toHex?.();

    if (typeof result === 'string') {
        return result;
    // deno-coverage-ignore
    }

    return encodeHex(data);

}

export function decode_hex (data: string) {

    // @ts-ignore polyfill
    const result = Uint8Array.fromHex?.(data);

    if (result instanceof Uint8Array) {
        return result as never;
    // deno-coverage-ignore
    }

    return decodeHex(data);

}





export function encode_base64 (data: U8Arr | ArrayBuffer) {

    // @ts-ignore polyfill
    const result = data.toBase64?.();

    if (typeof result === 'string') {
        return result;
    // deno-coverage-ignore
    }

    return encodeBase64(data);

}

export function decode_base64 (data: string) {

    // @ts-ignore polyfill
    const result = Uint8Array.fromBase64?.(data);

    if (result instanceof Uint8Array) {
        return result as never;
    // deno-coverage-ignore
    }

    return decodeBase64(data);

}





export function decode_bin (bin: string) {

    return Uint8Array.from(chunk(8, padding_bin(bin)), parse_int(2));

}

export function encode_bin (buf: U8Arr | ArrayBuffer) {

    return join_array_from(mk_Uint8Array(buf), padding_binary_by_8);

}





export function decode_dec (bin: string) {

    return decode_hex(padding_hex(radix16(BigInt(bin))));

}

export function encode_dec (buf: U8Arr | ArrayBuffer) {

    return radix10(BigInt(_0x(encode_hex(buf))));

}





export function padding_bin (bin: string) {

    return bin.padStart(Math.ceil(bin.length / 8) * 8, '0');

}





export function padding_hex (hex: string) {

    return hex.length % 2 === 0 ? hex : _0(hex);

}





export type Sentence = ReadonlyArray<string> & { readonly _: unique symbol };

export function assert_sentence (

        arr: unknown,

): asserts arr is Sentence {

    if (   Array.isArray(arr)
        && valid_sentence(arr.length)
        && arr.every(str => typeof str === 'string')
    ) {
        return;
    }

    throw new Error('invalid mnemonic sentence');

}





export function nmap <A, B> (

        f: (a: A) => B,
        a: A | undefined | null,

): B | undefined {

    if (a != null) {
        return f(a);
    }

    return void 0;

}





export function to_error (error: unknown, msg = 'unknown') {

    return error instanceof Error ? error : new Error(msg);

}





export function parse_int (base: number) {

    return function (str: string) {

        return Number.parseInt(str, base);

    };

}





export function it_to_rgba ([ r, g, b, a ]: Iterable<number>) {

    if (   r != null
        && g != null
        && b != null
        && a != null
    ) {
        return [ r, g, b, a ] as const;
    }

    throw new Error('invalid 32-byte Iterable');

}





export function search_value <T> (arr: ReadonlyArray<T>) {

    return function * (indexes: Iterable<number>) {

        for (const k of indexes)  {

            const v = arr[k];

            if (v == null) {
                throw new Error('missing', { cause: k });
            }

            yield v;

        }

    };

}





export function search_index <T> (arr: ReadonlyArray<T>) {

    return function * (indexes: Iterable<T>) {

        for (const v of indexes)  {

            const i = arr.indexOf(v);

            if (i < 0) {
                throw new Error('invalid word', { cause: v });
            }

            yield i;

        }

    };

}





function lookup <T> (xs: Iterable<T>) {

    const table = new Set(xs);

    return function (x: T) {

        return table.has(x);

    };

}





export const valid_checksum = lookup([  4,  5,  6,  7,  8 ]);
export const valid_sentence = lookup([ 12, 15, 18, 21, 24 ]);
export const valid_entropy  = lookup([ 16, 20, 24, 28, 32 ]);





const _0 = concat('0');

const _0x = concat('0x');

function concat (fst: string) {

    return function (snd: string) {

        return fst.concat(snd);

    }

}





const radix10 = radix(10);

const radix16 = radix(16);

function radix (base: number) {

    return function (n: number | bigint) {

        return n.toString(base);

    };

}





export function * chunk (n: number, str: string) {

    let chunk = str;

    while (chunk.length > 0) {
        yield chunk.slice(0, n);
        chunk = chunk.slice(n);
    }

}





export function * chunk_buf (n: number, buf: U8Arr) {

    let chunk = buf;

    while (chunk.length > 0) {
        yield chunk.subarray(0, n);
        chunk = chunk.subarray(n);
    }

}





type RPR <T extends string, P> = Readonly<Partial<Record<T, P>>>;

export function encode ({ raw, bin, dec, hex, base58, base64 }: RPR<

        | 'raw'
        | 'bin'
        | 'dec'
        | 'hex'
        | 'base58'
        | 'base64'

, boolean>) {

    if (raw) return id;

    if (bin) return encode_bin;

    if (dec) return encode_dec;

    if (hex) return encode_hex;

    if (base58) return encodeBase58;

    if (base64) return encode_base64;

    return encode_hex;

}

export function decode ({ bin, dec, hex, base58, base64 }: RPR<

        | 'bin'
        | 'dec'
        | 'hex'
        | 'base58'
        | 'base64'

, string>) {

    if (bin) return decode_bin(bin);

    if (dec) return decode_dec(dec);

    if (hex) return decode_hex(hex);

    if (base58) return decodeBase58(base58);

    if (base64) return decode_base64(base64);

    return void 0;

}





export const padding_binary_by_8 = num_to_padding(2, 8);

export const padding_binary_by_11 = num_to_padding(2, 11);

function num_to_padding (base: number, n: number, s = '0') {

    const show = radix(base);

    return function (m: number) {

        return show(m).padStart(n, s);

    }

}





export function split_at (at: number) {

    return function (str: string) {

        return [ str.slice(0, at), str.slice(at) ] as const;

    };

}





export function join_array_from <A> (

        it: Iterable<A>,
        fn: (a: A) => string,

) {

    return join(Array.from(it, fn));

}





export const join = join_by('');

export function join_by (by: string) {

    return function (arr: ReadonlyArray<string>) {

        return arr.join(by);

    };

}

