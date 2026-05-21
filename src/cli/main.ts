import type { Result } from './parse.ts';
import * as help from './help.ts';

import * as bip39 from '../bip39.ts';

import * as u from '../utils.ts';





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

        return bip39.to_mnemonic(entropy).then(u.join_space);

    }

    if (cmd === 'extract') {

        const { type, err, show, sentence, bin_with_cs, bin_cs_only } = info;

        if (type === 'help') {
            return help.extract;
        }

        if (type === 'error') {
            return { err, note: help.extract };
        }

        const [ buf, cs ] = await bip39.from_mnemonic_with_checksum(sentence);

        if (bin_cs_only) {
            return show(cs);
        }

        if (bin_with_cs) {
            return show(u.flat(buf, cs));
        }

        return show(buf);

    }

    throw new Error('invalid type');

}

