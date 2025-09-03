import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import {

    it_to_rgba,
    decode_bin,
    decode_hex,
    search_value,
    assert_sentence,
    to_error,
    decode_dec,

} from '#src/utils.ts';





describe('it_to_rgba', function () {

    it('throws on non 32-byte Iterable', function () {

        ast.assertThrows(
            () => it_to_rgba([ 1, 2, 3 ]),
            Error,
            'invalid 32-byte Iterable',
        );

    });

});





describe('decode_bin', function () {

    const sample = [

        [             '1100',   '0C' ],
        [            '01100',   '0C' ],
        [           '001100',   '0C' ],
        [        '100000000', '0100' ],
        [ '1111101000100001', 'FA21' ],

    ] as const;

    for (const [ bin, hex ] of sample) {

        it(`decode_bin ${ bin }`, function () {

            ast.assertEquals(decode_bin(bin), decode_hex(hex));

        });

    }

});





describe('search_value', function () {

    it('throws on missing value', function () {

        const query = search_value([]);
        const res = query([ 1 ]);

        ast.assertThrows(() => Array.from(res), Error, 'missing');

    });

});





describe('assert_sentence', function () {

    it('throws on invalid mnemonic sentence', function () {

        ast.assertThrows(() => assert_sentence([       ]), Error, 'invalid');
        ast.assertThrows(() => assert_sentence([ 'foo' ]), Error, 'mnemonic');
        ast.assertThrows(() => assert_sentence([ 'bar' ]), Error, 'sentence');

    });

});





describe('to_error', function () {

    it('returns unknown error', function () {

        const error = to_error(42);

        ast.assertInstanceOf(error, Error);
        ast.assertEquals(error.message, 'unknown');

    });

    it('returns wat error', function () {

        const error = to_error(42, 'wat');

        ast.assertInstanceOf(error, Error);
        ast.assertEquals(error.message, 'wat');

    });

    it('returns original error', function () {

        const err = new Error();
        const error = to_error(err);

        ast.assertStrictEquals(error, err);

    });

});





describe('decode_dec', function () {

    const sample = [

        [      '1', Uint8Array.of(1) ],
        [    '256', Uint8Array.of(1, 0) ],
        [    '255', Uint8Array.of(255) ],
        [ '574896', Uint8Array.of(0b1000, 0b1100_0101, 0b1011_0000) ],

    ] as const;

    for (const [ bin, buf ] of sample) {

        it(`decode_dec ${ bin }`, async function () {

            ast.assertEquals(decode_dec(bin), buf);

        });

    }

});

