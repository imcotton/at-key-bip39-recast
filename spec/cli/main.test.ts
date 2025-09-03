import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import * as help from '#src/cli/help.ts';

import * as u from '#src/utils.ts';
import { parse } from '#src/cli/parse.ts';
import { main } from '#src/cli/main.ts';

import vectors from '#fixtures/vectors.json' with { type: 'json' };





describe('cli', function () {

    {

        const args = [
            [          ],
            [  'help'  ],
            [  '-h'    ],
            [ '--help' ],
        ];

        for (const x of args) {

            it(`print help summary for ${ x }`, async function () {

                ast.assertStrictEquals(await main(parse(x)), help.summary);

            });

        }

    }

    it('rejects on invalid command', async function () {

        await ast.assertRejects(
            async () => main(parse([ 'wat' ])),
            'invalid type',
        );

    });

    it('extract on gen', async function () {

        const buf = u.webcrypto.getRandomValues(new Uint8Array(42));
        const hex = u.encode_hex(buf);

        const xs = await main(parse([ 'gen', '--size', '15', '--hex', hex ]))

            .then(function (str) {

                ast.assert(typeof str === 'string');
                return str.split(' ');

            })

            .then(async function (xs) {

                const raw = await main(parse([ 'extract', '--raw', ...xs ]));

                ast.assertInstanceOf(raw, Uint8Array);
                ast.assertEquals(raw, buf.subarray(-raw.byteLength));

                return xs;

            })

        ;

        const args = [
            'bin',
            'dec',
            'hex',
            'base58',
            'base64',
        ];

        await Promise.all(args.map(async function (enc) {

            const fst = await main(parse([ 'extract', `--${ enc }`, ...xs ]));

            ast.assert(typeof fst === 'string');

            const snd = await main(parse([ 'gen', `--${ enc }`, fst ]));

            ast.assert(typeof snd === 'string');
            ast.assertEquals(snd.split(' '), xs);

        }));

    });

    it('extract and gen via --rgba', async function () {

        const sample = vectors.english.slice(1).map(([ _, snd = '' ]) => [
            snd,
            snd.split(' '),
        ] as const);

        for (const [ raw, sentence ] of sample) {

            const colors = await main(parse([
                'extract', '--rgba', ...sentence,
            ]));

            ast.assert(typeof colors === 'string');

            const res = await main(parse([
                'gen', '--rgba', colors,
            ]));

            ast.assert(typeof res === 'string');

            ast.assertStrictEquals(res, raw);

        }

    });

});





describe('cli / gen', function () {

    const cmd = 'gen';

    describe('helps', function () {

        const args = [
            [  '-h'    ],
            [ '--help' ],
        ];

        for (const x of args) {

            const s = Array.of(cmd).concat(x);

            it(`print help message for ${ s }`, async function () {

                const res = await main(parse(s));

                ast.assertStrictEquals(res, help.gen);

            });

        }

    });

    describe('lang - en', function () {

        const sample = vectors.english.map(([ fst = '', snd = '' ]) => [
            fst,
            snd.split(' '),
        ] as const);

        for (const [ hex, sentence ] of sample) {

            it(`${ sentence.slice(0, 5).join(' ') }`, async function () {

                const args = [ cmd, '--hex', hex ];
                const res = await main(parse(args));

                ast.assertStrictEquals(res, sentence.join(' '));

            });

        }

    });

    describe('misc.', function () {

        it('reads --size and returns sentence in same', async function () {

            const res = await main(parse([ cmd, '--size', '21' ]));

            ast.assert(typeof res === 'string');
            ast.assertStrictEquals(res.split(' ').length, 21);

        });

        it('errors on --wat', async function () {

            const res = await main(parse([ cmd, '--wat' ]));

            ast.assert(typeof res !== 'string'
                && (res instanceof Uint8Array) === false
            );

            const { err: { message }, note } = res;

            ast.assertStringIncludes(message, `Unknown option '--wat'`);
            ast.assertEquals(note, help.gen);

        });

    });

});





describe('cli / extract', function () {

    const cmd = 'extract';

    describe('helps', function () {

        const args = [
            [  '-h'    ],
            [ '--help' ],
        ];

        for (const x of args) {

            const s = Array.of(cmd).concat(x);

            it(`print help message for ${ s }`, async function () {

                const res = await main(parse(s));

                ast.assertStrictEquals(res, help.extract);

            });

        }

    });

    describe('lang - en', function () {

        const sample = vectors.english.map(([ fst = '', snd = '' ]) => [
            fst,
            snd.split(' '),
        ] as const);

        for (const [ hex, sentence ] of sample) {

            it(`${ sentence.slice(0, 5).join(' ') }`, async function () {

                const args = [ cmd, ...sentence ];
                const res = await main(parse(args));

                ast.assertStrictEquals(res, hex);

            });

        }

    });

    describe('misc.', function () {

        it('errors on --wat', async function () {

            const res = await main(parse([ cmd, '--wat' ]));

            ast.assert(typeof res !== 'string'
                && (res instanceof Uint8Array) === false
            );

            const { err: { message }, note } = res;

            ast.assertStringIncludes(message, `Unknown option '--wat'`);
            ast.assertEquals(note, help.extract);

        });

    });

});

