import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import * as u from '#src/utils.ts';

import {

    mnemonic_to_rgba,
    rgba_to_mnemonic,

} from '#src/rgba.ts';

import vectors from '#fixtures/vectors.json' with { type: 'json' };





describe('rgba_to_mnemonic & mnemonic_to_rgba', function () {

    it('converts mnemonic to rgba then mnemonic', async function () {

        const sample = vectors.english.map(([ _, snd = '' ]) => [
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

