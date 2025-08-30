import { en } from './words-list/index.ts';

import * as u from './utils.ts';





export async function verify_mnemonic (

        sentence: ReadonlyArray<string>,
        dict = en as ReadonlyArray<string>,

): Promise<boolean> {

    try {

        u.assert_sentence(sentence);

        await from_mnemonic(sentence, dict);

        return true;

    } catch {

        return false;

    }

}





export async function from_mnemonic (

        sentence: u.Sentence,
        dict = en as ReadonlyArray<string>,

): Promise<Uint8Array<ArrayBuffer>> {

    const search = u.search_index(dict);

    const split = u.split_at(sentence.length / 3 * 32);

    const [ binary, checksum ] = split(u.join_array_from(
        search(sentence),
        u.padding_binary_by_11,
    ));

    const buf = u.decode_bin(binary);

    if (u.valid_entropy(buf.byteLength)) {

        const hash = await u.sha256(buf).then(u.encode_bin);

        if (hash.startsWith(checksum)) {
            return buf;
        }

        throw new Error('invalid checksum', { cause: checksum });

    }

    throw new Error('invalid entropy size', { cause: buf.byteLength });

}





export async function to_mnemonic (

        buf: Uint8Array<ArrayBuffer>,
        dict = en as ReadonlyArray<string>,

): Promise<ReadonlyArray<string>> {

    const query = u.search_value(dict);
    const index = await chopping(buf);

    return Array.from(query(index));

}





const chopping = checksum_with_chunks_of_bit(11, bytes => {

    const bits = bytes * 8 / 32;

    if (u.valid_checksum(bits)) {
        return bits;
    }

    throw new Error('invalid length', { cause: bytes });

});





function checksum_with_chunks_of_bit (

        n: number,
        calc: (_: number) => number,
        hash = u.sha256,

) {

    return async function (origin: Uint8Array<ArrayBuffer>) {

        const bits = calc(origin.byteLength);
        const split = u.split_at(bits + (origin.byteLength * 8));

        const checksum = new Uint8Array(await hash(origin));

        const buf = flat(
            origin,
            checksum.subarray(0, Math.round(bits / 8)),
        );

        const [ binary ] = split(u.join_array_from(
            buf,
            u.padding_binary_by_8,
        ));

        return Array.from(u.chunk(n, binary), u.parse_int(2));

    };

}





function flat (x: Uint8Array, ...xs: Uint8Array[]) {

    return xs.reduce((a, b) => {

        const merged = new Uint8Array(a.byteLength + b.byteLength);

        merged.set(a);
        merged.set(b, a.length);

        return merged;

    }, x);

}

