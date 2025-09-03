import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import * as u from '#src/utils.ts';
import { parse } from '#src/cli/parse.ts';
import { main } from '#src/cli/main.ts';

import {

    mnemonic_to_rgba,
    rgba_to_mnemonic,

} from '#src/rgba.ts';

import vectors from '#fixtures/vectors.json' with { type: 'json' };





describe('mnemonic_to_rgba', function () {

    it('align with gen --rgba', async function () {

        const sample = vectors.english.slice(1).map(([ _, snd = '' ]) => [
            snd,
            snd.split(' '),
        ] as const);

        for (const [ raw, sentence ] of sample) {

            u.assert_sentence(sentence);

            const colors = await mnemonic_to_rgba(sentence);
            const rgba = colors.map(rgba => `rgba(${ rgba.join(', ') })`);

            const res = await main(parse([
                'gen', '--rgba', rgba.join(', '),
            ]));

            ast.assert(typeof res === 'string');

            ast.assertStrictEquals(res, raw);

        }

    });


});





describe('rgba_to_mnemonic', function () {

    it('converts mnemonic to rgba then mnemonic', async function () {

        const sample = vectors.english.slice(1).map(([ _, snd = '' ]) => [
            snd.split(' '),
        ] as const);

        for (const [ sentence ] of sample) {

            u.assert_sentence(sentence);

            const color = await mnemonic_to_rgba(sentence);
            const res = await rgba_to_mnemonic(color);

            ast.assertEquals(res, sentence);

        }

    });


});

