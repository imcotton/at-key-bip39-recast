import type { Result } from './parse.ts';
import * as help from './help.ts';

import { to_mnemonic, from_mnemonic_with_checksum } from '../bip39.ts';

import { join_by, flat } from '../utils.ts';





export async function main ({ cmd, info }: Result) {

    if (cmd === 'help') {
        return help.summary;
    }

    if (cmd === 'gen') {

        const { type, err, entropy } = info;

        if (type === 'help') {
            return help.gen;
        }

        if (type === 'error') {
            return { err, note: help.gen };
        }

        return to_mnemonic(entropy).then(join_by(' '));

    }

    if (cmd === 'extract') {

        const { type, err, show, sentence, bin_with_cs, bin_cs_only } = info;

        if (type === 'help') {
            return help.extract;
        }

        if (type === 'error') {
            return { err, note: help.extract };
        }

        const [ entropy, cs ] = await from_mnemonic_with_checksum(sentence);

        if (bin_cs_only) {
            return show(cs);
        }

        if (bin_with_cs) {
            return show(flat(entropy, cs));
        }

        return show(entropy);

    }

    throw new Error('invalid type');

}

