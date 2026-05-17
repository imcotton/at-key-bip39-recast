import { parseArgs } from 'node:util';

import * as u from '../utils.ts';





type UnionOmit <T, K extends string | number | symbol>
= T extends unknown ? Omit<T, K> : never;

export type Result = UnionOmit<ReturnType<typeof parse>, 'qr'>;

export function parse (argv: Iterable<string>) {

    const [ cmd, ...args ] = argv;

    if (cmd == null || cmd === '-h' || cmd === '--help' || cmd === 'help') {

        return { cmd: 'help' as const };

    }

    const [ qr, rest ] = scrape_qr(args);

    if (cmd === 'generate' || cmd === 'gen') {

        return { cmd: 'gen' as const, qr, info: gen(rest) };

    }

    if (cmd === 'extract' || cmd === 'ext') {

        return { cmd: 'extract' as const, qr, info: extract(rest) };

    }

    return { unknown: cmd };

}





function partial <T> (arr: ReadonlyArray<T>, a: T): [ boolean, typeof arr ] {

    return arr.includes(a)
        ? [  true, arr.filter(b => b !== a) ]
        : [ false, arr ]
    ;

}





function scrape_qr (s1: ReadonlyArray<string>) {

    const [ qr      , s2 ] = partial(s1, '--qr');
    const [ qr_large, s3 ] = partial(s2, '--qr-large');

    const res = qr_large ? 'term' : qr ? 'ascii' : void 0;

    return [ res, s3 ] as const;

}





function gen (args: Iterable<string>) {

    const type_string = { type: 'string' } as const;

    try {

        const { values, positionals: [ hex ] } = parseArgs({

            args: Array.from(args),

            allowPositionals: true,

            options: {

                bin: type_string,
                dec: type_string,
                hex: type_string,
                base58: type_string,
                base64: type_string,
                rgba: type_string,

                size: type_string,

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

        let entropy = u.decode(hex ? { hex, ...rest } : rest);

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

    const type_boolean = { type: 'boolean' } as const;

    try {

        const { values, positionals } = parseArgs({

            args: Array.from(args),

            allowPositionals: true,

            options: {

                raw: type_boolean,

                'bin': type_boolean,
                'bin-checksum': type_boolean,
                'bin-checksum-only': type_boolean,

                dec: type_boolean,
                hex: type_boolean,
                base58: type_boolean,
                base64: type_boolean,
                rgba: type_boolean,

                help: {
                    short: 'h',
                    type: 'boolean',
                },

            },

        });

        const { help
              , 'bin': bin_
              , 'bin-checksum': bin_with_cs
              , 'bin-checksum-only': bin_cs_only
              , ...format
        } = values;

        if (help) {
            return { type: 'help' as const };
        }

        const sentence: ReadonlyArray<string>
        = positionals.flatMap(str => str.split(/\W+/));

        u.assert_sentence(sentence);

        const bin = bin_ ?? bin_with_cs ?? bin_cs_only;

        const show = u.encode({ ...format, bin: bin === true });

        return { type: 'normal' as const
               , sentence
               , show
               , bin_with_cs
               , bin_cs_only
        };

    } catch (cause) {

        return { type: 'error' as const, err: u.to_error(cause) };

    }

}

