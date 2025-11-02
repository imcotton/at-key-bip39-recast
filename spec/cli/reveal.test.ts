import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import * as u from '#src/utils.ts';

import {

    collect,
    reversed_sri,

} from '#src/cli/reveal.ts';





describe('collect', function () {

    it('collects hash', async function () {

        const encode = async (str: string) => new TextEncoder().encode(str);

        const buf = crypto.getRandomValues(new Uint8Array(16));
        const b64 = u.encode_base64(buf);
        const hash = reversed_sri(b64);

        const [ res ] = await Array.fromAsync(collect({ hash }, encode));

        ast.assertEquals(res, buf);

    });

});





describe('reversed_sri', function () {

    for (const n of [ 3, 11, 16, 24, 25 ]) {

        const buf = crypto.getRandomValues(new Uint8Array(n));
        const b64 = u.encode_base64(buf);
        const res = reversed_sri(b64);

        it(`rev: ${ b64 } <> ${ res }`, function () {

            ast.assertStrictEquals(reversed_sri(res), b64);

        });

    }

});

