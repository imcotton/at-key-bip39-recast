import type { Result } from './parse.ts';
import * as help from './help.ts';

import { to_mnemonic, from_mnemonic } from '../bip39.ts';

import { join_by } from '../utils.ts';





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
            return err.message.concat('\n\n', help.gen);
        }

        return to_mnemonic(entropy).then(join_by(' '));

    }

    if (cmd === 'extract') {

        const { type, err, show, sentence } = info;

        if (type === 'help') {
            return help.extract;
        }

        if (type === 'error') {
            return err.message.concat('\n\n', help.extract);
        }

        const entropy = await from_mnemonic(sentence);

        return show(entropy);

    }

    throw new Error('invalid type');

}

