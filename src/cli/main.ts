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

        const { entropy, checksum, indices }
        = await bip39.all_from_mnemonic(sentence);

        if (info.indices ?? info.indices_join) {

            return info.indices_join
                ? u.join_array_from(indices, u.padding_decimal_by_4)
                : u.join_array_from(indices, u.id, u.join_space)
            ;

        }

        if (bin_cs_only) {
            return show(checksum);
        }

        if (bin_with_cs) {
            return show(u.flat(entropy, checksum));
        }

        return show(entropy);

    }

    throw new Error('invalid type');

}

