import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import {

    to_mnemonic,
    from_mnemonic,
    verify_mnemonic,
    mnemonic_to_seed,
    refine_sentence,
    gen_from_mnemonic_with_checksum,

} from '#src/bip39.ts';

import { en } from '#src/words-list/index.ts';

import * as u from '#src/utils.ts';

import vectors from '#fixtures/vectors.json' with { type: 'json' };





describe('mnemonic_to_seed', function () {

    const sample = vectors.english.map(arr => arr.slice(1, 3));

    it('passed off fixtures', async function () {

        for (const [ phrase, hex ] of sample) {

            const raw = phrase?.split(' ');

            ast.assert(raw);

            const sentence = refine_sentence(raw, en);

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

        await ast.assertRejects(() => from_mnemonic([ 'abandon' ]));

    });

    it('throws on invalid element', async function () {

        const sentence = Array.from({ length: 12 }, () => 'lol');

        await ast.assertRejects(
            () => from_mnemonic(sentence),
            Error,
            'invalid element',
        );

    });

    it('accepts shorten but still valid words', async function () {

        const normal = `

            cat     swing   flag     economy   stadium   alone
            churn   speed   unique   patch     report    train

        `.trim().split(/\W+/);

        const cut = `

            cat     swin    flag     economy   stad      alon
            churn   speed   uniq     patc      report    train

        `.trim().split(/\W+/);

        await Promise.all([

            from_mnemonic(normal),
            from_mnemonic(cut),

        ]).then(([ a, b ]) => ast.assertEquals(a, b));

    });

});





describe('gen_from_mnemonic_with_checksum', function () {

    it('throws on invalid entropy size', async function () {

        const fn = gen_from_mnemonic_with_checksum({

            valid_entropy: () => false,

        });

        const sentence = Array.from({ length: 12 }, () => 'zoo');

        await ast.assertRejects(
            () => fn(sentence),
            Error,
            'invalid entropy size',
        );

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

