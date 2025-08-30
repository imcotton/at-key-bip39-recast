import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import {

    to_mnemonic,
    from_mnemonic,
    verify_mnemonic,

} from '#src/bip39.ts';





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

