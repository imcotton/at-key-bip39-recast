import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';
import { encodeBase58 } from '@std/encoding/base58';

import * as u from '#src/utils.ts';
import { parse } from '#src/cli/parse.ts';





describe('parse [reveal]', function () {

    const cmd = 'reveal' as const;

    it('parses path', function () {

        const path = 'index.html';

        const res = parse([ cmd, path ]);
        const info = { path };

        ast.assertObjectMatch(res, { cmd, info });

    });

    it('errors on invalid path', function () {

        const res = parse([ cmd ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);

        ast.assertStringIncludes(res.info.err.message,
            'no path',
        );

    });

});





describe('parse [extract]', function () {

    const cmd = 'extract' as const;

    it('errors on invalid entropy bytes', function () {

        const res = parse([ cmd, '--wat' ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);

        ast.assertStringIncludes(res.info.err.message,
            'Unknown option',
        );

    });

});





describe('parse [gen]', function () {

    const cmd = 'gen' as const;

    for (const args of [ '-h', '--help' ]) {

        it(`returns help for ${ args }`, function () {

            ast.assertEquals(parse([ cmd, args ]), {
                cmd, info: { type: 'help' },
            });

        });

    }

    it('ignores extra positionals', function () {

        const type = 'normal';
        const buf = u.webcrypto.getRandomValues(new Uint8Array(42));
        const hex = u.encode_hex(buf);

        const res = parse([ cmd, '--size=12', '--hex', hex, '-', 'wat' ]);

        const entropy = buf.subarray(-16);

        ast.assertEquals(res, { cmd, info: { type, entropy } });

    });

    it('default to --hex input', function () {

        const buf = Uint8Array.from({ length: 42 }, (_, i) => i);
        const hex = u.encode_hex(buf);

        const    with_hex = parse([ cmd, '--size=12', '--hex', hex ]);
        const without_hex = parse([ cmd, '--size=12',          hex ]);

        ast.assertEquals(with_hex, without_hex);

    });

    it('errors while no --size nor entropy', function () {

        const res = parse([ cmd ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);
        ast.assertEquals(res.info.err.message,
            'no entropy to proceed',
        );

    });

    it('errors on invalid entropy bytes', function () {

        const res = parse([ cmd, '--hex', 'ff' ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);
        ast.assertStringIncludes(res.info.err.message,
            'invalid entropy bytes',
        );

    });

    it('errors on invalid --size', function () {

        const res = parse([ cmd, '--size', '9' ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);
        ast.assertStringIncludes(res.info.err.message,
            'invalid sentence size',
        );

    });

    it('errors on valid --size but inadequate entropy', function () {

        const res = parse([ cmd, '--size', '12', '--hex', 'ff' ]);
        const info = { type: 'error' };

        ast.assertObjectMatch(res, { cmd, info });
        ast.assertInstanceOf(res.info?.err, Error);
        ast.assertStringIncludes(res.info.err.message,
            'inadequate entropy of size',
        );

    });

    it('reads --size and --{enc}', function () {

        const type = 'normal';

        const sample = {
            bin: [    16, 12, u.encode_bin ],
            dec: [    20, 15, u.encode_dec ],
            hex: [    24, 18, u.encode_hex ],
            base58: [ 28, 21, encodeBase58 ],
            base64: [ 32, 24, u.encode_base64 ],
        } as const;

        const buf = u.webcrypto.getRandomValues(new Uint8Array(48));

        for (const [ enc, config ] of Object.entries(sample)) {

            const [ bytes, size, encode ] = config;

            const res = parse([ cmd,
                `--${ enc }`, encode(buf),
                '--size', size.toString(),
            ]);

            const entropy = buf.subarray(-bytes);

            ast.assertEquals(res, { cmd, info: { type, entropy } });

        }

    });

});





describe('parse', function () {

    const sample = [
        [          ],
        [  'help'  ],
        [  '-h'    ],
        [ '--help' ],
    ];

    for (const args of sample) {

        it(`returns help for ${ args }`, function () {

            ast.assertEquals(parse(args), { cmd: 'help' });

        });

    }

    it('returns unknown cmd', function () {

        ast.assertObjectMatch(parse([ 'wat' ]), { unknown: 'wat' });

    });

});

