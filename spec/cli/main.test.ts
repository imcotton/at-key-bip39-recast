import { resolve } from 'node:path';

import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import * as help from '#src/cli/help.ts';

import * as u from '#src/utils.ts';
import { parse } from '#src/cli/parse.ts';
import { main } from '#src/cli/main.ts';
import { from_mnemonic, assert_sentence } from '#src/index.ts';

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
            'rgba',
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

        const sample = vectors.english.map(([ _, snd = '' ]) => [
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

    it('pins on [gen --rgba] for void-come-effort', async function () {

        const raw = vectors.english.at(-1)?.at(1);
        const sentence = raw?.split(' ');

        u.assert_sentence(sentence);

        const extract = await main(parse([
            'extract', '--rgba', ...sentence,
        ]));

        ast.assert(typeof extract === 'string');

        const css = refine(`
            rgba(245, 133, 193, 0.101),
            rgba(236,  82,  13, 0.709),
            rgba(125, 211,  83, 0.776),
            rgba(149,  84, 178, 0.101),
            rgba(137, 178,  15, 0.69),
            rgba(101,   9, 102, 0.98),
            rgba( 10, 157, 111, 0.454),
            rgba(253, 152, 157, 0.56)
        `);

        ast.assertStrictEquals(refine(extract), css);

        const gen = await main(parse([
            'gen', '--rgba', css,
        ]));

        ast.assertStrictEquals(gen, raw);

        function refine (str: string) {

            return str.trim().replaceAll(' ', '').replaceAll('\n', '');

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

        it('throws on invalid --rgba', async function () {

            const res = await main(parse([
                'gen', '--rgba', 'rgba(1,2,3,4), rgba(1, 2, 3)',
            ]));

            ast.assert(typeof res !== 'string');
            ast.assert(res instanceof Uint8Array === false);

            const { err: { message }, note } = res;

            ast.assertStringIncludes(message, 'invalid entropy bytes: ');
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





describe('cli / reveal', function () {

    const cmd = 'reveal';

    it('reveals every conditions', async function () {

        const mnemonic = `

            void      come      effort   suffer    camp      survey
            warrior   heavy     shoot    primary   clutch    crush
            open      amazing   screen   patrol    group     space
            point     ten       exist    slush     involve   unfold

        `.trim().split(/\W+/);

        assert_sentence(mnemonic);

        const sentence = mnemonic.join(' ');
        const entropy = await from_mnemonic(mnemonic);
        const hex = u.encode_hex(entropy);

        const DIST = './tmp/homepage';
        const index_html = resolve(DIST, 'index.html');

        const command = new Deno.Command('bash', {
            env: { DIST },
            args: [
                './tools/wwwroot.sh',
                `--size=${ mnemonic.length }`,
                `--hex=${ hex }`,
            ],
        });

        const { success, code } = await command.output();

        ast.assert(success, `${ code }`);

        const task = (path = index_html) => main({ cmd, info: { path } });

        const verify = (path?: string) => task(path).then(res => {
            ast.assertStrictEquals(res, sentence);
        });

        await verify();

        const full = await Deno.readTextFile(index_html);

        const cut = (txt: string) => full.slice(full.indexOf(txt));

        const update = async (txt: string) => {
            return void await Deno.writeTextFile(index_html, cut(txt));
        };

        await update(`<link rel="icon"`).then(verify);
        await update(`<link rel="stylesheet"`).then(verify);
        await update(`<body`).then(verify);

        const ctrl = new AbortController();
        const { signal } = ctrl;

        await using server = Deno.serve({ signal, port: 0 }, function (req) {

            if (url === req.url) {
                return new Response(cut(`<link rel="icon"`));
            }

            return new Response('404', { status: 404 });

        });

        const url = `http://localhost:${ server.addr.port }/`;

        await verify(url);

        ctrl.abort();

        await Deno.remove(DIST, { recursive: true });

    });

    it('errors without path', async function () {

        const res = await main(parse([ cmd ]));

        ast.assert(typeof res !== 'string'
            && (res instanceof Uint8Array) === false
        );

        const { err: { message } } = res;

        ast.assertStringIncludes(message, 'no path');

    });

});

