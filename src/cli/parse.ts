import { parseArgs } from 'node:util';

import * as u from '../utils.ts';





export type Result = ReturnType<typeof parse>;

export function parse (argv: Iterable<string>) {

    const [ cmd, ...args ] = argv;

    if (cmd == null || cmd === '-h' || cmd === '--help' || cmd === 'help') {
        return { cmd: 'help' as const };
    }

    if (cmd === 'gen') {

        return { cmd: 'gen' as const, info: gen(args) };

    }

    if (cmd === 'extract') {

        return { cmd: 'extract' as const, info: extract(args) };

    }

    return { unknown: cmd };

}





function gen (args: Iterable<string>) {

    try {

        const { values, positionals: [ hex ] } = parseArgs({

            args: Array.from(args),

            allowPositionals: true,

            options: {

                bin: {    type: 'string' },
                dec: {    type: 'string' },
                hex: {    type: 'string' },
                base58: { type: 'string' },
                base64: { type: 'string' },

                size: { type: 'string' },

                help: {
                    short: 'h',
                    type: 'boolean',
                },

            },

        });

        const { help, size: _size, ...rest } = values;

        if (help) {
            return { type: 'help' as const };
        }

        let entropy = u.decode({ hex, ...rest });

        const size = u.nmap(u.parse_int(10), _size);

        if (size == null) {

            if (entropy == null) {
                throw new Error('no entropy to proceed');
            }

            const bytes = entropy.byteLength;

            if (u.valid_entropy(bytes) !== true) {
                throw new Error(`invalid entropy bytes: ${ bytes }`);
            }

        } else {

            const bytes = size * 4 / 3;

            if (u.valid_entropy(bytes) !== true) {
                throw new Error(`invalid sentence size: ${ size }`);
            }

            entropy ??= u.webcrypto.getRandomValues(new Uint8Array(bytes));

            if (entropy.byteLength < bytes) {
                throw new Error(`inadequate entropy of size: ${ size }`);
            }

            entropy = entropy.subarray(-bytes);

        }

        return { type: 'normal' as const, entropy };

    } catch (cause) {

        return { type: 'error' as const, err: u.to_error(cause) };

    }

}





function extract (args: Iterable<string>) {

    try {

        const { values, positionals } = parseArgs({

            args: Array.from(args),

            allowPositionals: true,

            options: {

                raw: {    type: 'boolean' },
                bin: {    type: 'boolean' },
                dec: {    type: 'boolean' },
                hex: {    type: 'boolean' },
                base58: { type: 'boolean' },
                base64: { type: 'boolean' },

                help: {
                    short: 'h',
                    type: 'boolean',
                },

            },

        });

        const { help, ...format } = values;

        if (help) {
            return { type: 'help' as const };
        }

        const sentence: ReadonlyArray<string>
        = positionals.flatMap(str => str.split(/\W+/));

        u.assert_sentence(sentence);

        const show = u.encode(format);

        return { type: 'normal' as const, sentence, show };

    } catch (cause) {

        return { type: 'error' as const, err: u.to_error(cause) };

    }

}

