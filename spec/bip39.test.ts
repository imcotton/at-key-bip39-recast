import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import {

    to_mnemonic,
    from_mnemonic,
    verify_mnemonic,
    mnemonic_to_seed,

} from '#src/bip39.ts';

import * as u from '#src/utils.ts';

import vectors from '#fixtures/vectors.json' with { type: 'json' };





describe('mnemonic_to_seed', function () {

    const sample = vectors.english.map(arr => arr.slice(1, 3));

    it('passed off fixtures', async function () {

        for (const [ phrase, hex ] of sample) {

            const sentence = phrase?.split(' ');

            u.assert_sentence(sentence);

            const res = await mnemonic_to_seed(sentence, 'TREZOR');

            ast.assertStrictEquals(
                u.encode_hex(res),
                hex,
                sentence.slice(0, 5).join(' '),
            );

        }

    });

});





describe('to_mnemonic', function () {

    it('rejects on wrong dict', async function () {

        await ast.assertRejects(() => to_mnemonic(Uint8Array.of(), [ 'wat' ]));

    });

    it('rejects on wrong buf', async function () {

        await ast.assertRejects(() => to_mnemonic(Uint8Array.of(1, 2, 3)));

    });

});





describe('from_mnemonic', function () {

    it('rejects on invalid sentence', async function () {

        // @ts-expect-error for test mock
        await ast.assertRejects(() => from_mnemonic([ 'abandon' ]));

    });

});





describe('verify_mnemonic', function () {

    const sentence = `
        abandon abandon abandon abandon abandon abandon
        abandon abandon abandon abandon abandon
        about
    `.trim().split(/\W+/);

    it('true', async function () {
        ast.assert(await verify_mnemonic(sentence));
    });

    it('false on invalid checksum', async function () {
        ast.assertFalse(await verify_mnemonic(sentence.with(-1, 'abandon')));
    });

    it('false on invalid checksum word', async function () {
        ast.assertFalse(await verify_mnemonic(sentence.with(-1, 'wat')));
    });

});

