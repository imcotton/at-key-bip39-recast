import { en } from './words-list/index.ts';

import { from_mnemonic, to_mnemonic } from './bip39.ts';

import * as u from './utils.ts';





export type RGBA = readonly [

        r: number,
        g: number,
        b: number,
        a: number,

];





export async function mnemonic_to_rgba (

        sentence: u.Sentence,
        dict = en as ReadonlyArray<string>,

): Promise<ReadonlyArray<RGBA>> {

    const buf = await from_mnemonic(sentence, dict);

    return u.slice_buf_by_rgba(buf);

}





export async function rgba_to_mnemonic (

        arr: ReadonlyArray<readonly number[]>,
        dict = en as ReadonlyArray<string>,

): Promise<ReadonlyArray<string>> {

    const buf = u.emerge_buf_from_rgba(arr);

    const res = await to_mnemonic(buf, dict);

    return res;

}

