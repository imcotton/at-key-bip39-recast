import { en } from './words-list/index.ts';

import { normalize, PBKDF2 } from './pbkdf2.ts';

import * as u from './utils.ts';





export async function verify_mnemonic (

        sentence: Iterable<string> | ArrayLike<string>,
        dict = en as ReadonlyArray<string>,

): Promise<boolean> {

    try {

        await from_mnemonic(sentence, dict);

        return true;

    } catch {

        return false;

    }

}





export async function from_mnemonic (

        sentence: Iterable<string> | ArrayLike<string>,
        dict = en as ReadonlyArray<string>,

): Promise<u.U8Arr> {

    const [ buf ] = await from_mnemonic_with_checksum(sentence, dict);

    return buf;

}





export const from_mnemonic_with_checksum: (

        sentence: Iterable<string> | ArrayLike<string>,
        dict?: ReadonlyArray<string>,

) => Promise<[ u.U8Arr, u.U8Arr ]> = gen_from_mnemonic_with_checksum();





// DI for better coverage
export function gen_from_mnemonic_with_checksum ({

        valid_entropy = u.valid_entropy,

} = {}) {

    return async function (

            sentence: Iterable<string> | ArrayLike<string>,
            dict = en as ReadonlyArray<string>,

    ): Promise<[ u.U8Arr, u.U8Arr ]> {

        const rectified = refine_sentence(sentence, dict);

        const search = u.search_index(dict);

        const split = u.split_at(rectified.length / 3 * 32);

        const [ binary, checksum ] = split(u.join_array_from(
            search(rectified),
            u.padding_binary_by_11,
        ));

        const buf = u.decode_bin(binary);

        if (valid_entropy(buf.byteLength)) {

            const hash = await u.sha256(buf).then(u.encode_bin);

            if (hash.startsWith(checksum)) {
                return [ buf, u.decode_bin(checksum) ];
            }

            throw new Error('invalid checksum', { cause: checksum });

        }

        throw new Error('invalid entropy size', { cause: buf.byteLength });

    };

}





export async function to_mnemonic (

        buf: u.U8Arr,
        dict = en as ReadonlyArray<string>,

): Promise<u.Sentence> {

    const query = u.search_value(dict);
    const index = await chopping(buf);

    return refine_sentence(query(index), dict);

}





export async function mnemonic_to_seed (

        sentence: u.Sentence,
        password = '',

): Promise<u.U8Arr> {

    const passphrase = normalize(sentence.join(' '));
    const salt = normalize('mnemonic'.concat(password));

    const buf = await PBKDF2({ passphrase, salt });

    return u.mk_Uint8Array(buf);

}





export function refine_sentence (

        source: Iterable<string> | ArrayLike<string>,
        dict: ReadonlyArray<string>,

): u.Sentence {

    const refine = Array.from(source, expand_word_from(dict));

    u.assert_sentence(refine);

    return refine;

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

    return async function (origin: u.U8Arr) {

        const bits = calc(origin.byteLength);
        const split = u.split_at(bits + (origin.byteLength * 8));

        const checksum = new Uint8Array(await hash(origin));

        const buf = u.flat(
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





function starts_with (prefix: string) {

    return (str: string) => str.startsWith(prefix);

}





function expand_word_from (dict: ReadonlyArray<string>) {

    const has = u.lookup(dict);

    return function (word: string) {

        if (has(word)) {
            return word;
        }

        const starts_with_word = starts_with(word);

        const head = dict.find(starts_with_word);
        const last = dict.findLast(starts_with_word);

        if (head === last) {
            if (head != null) {
                return head;
            }
        }

        throw new Error('invalid element', { cause: { word, head, last } });

    };

}

