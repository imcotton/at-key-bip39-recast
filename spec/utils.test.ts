import * as ast from '@std/assert';
import { describe, it } from '@std/testing/bdd';

import {

    encode_rgba,
    decode_rgba,
    modify,
    mk_Uint8Array,
    it_to_rgba,
    decode_bin,
    decode_hex,
    search_value,
    assert_sentence,
    to_error,
    decode_dec,
    encode_text,
    decode_text,

} from '#src/utils.ts';





describe('decode_text', function () {

    it('decode back to txt', function () {

        const txt = 'hello, world';
        const buf = encode_text(txt);
        const res = decode_text(buf);

        ast.assertStrictEquals(res, txt);

    });

});





describe('encode_rgba', function () {

    it('throws on invalid entropy length', function () {

        ast.assertThrows(() => encode_rgba(Uint8Array.of(1, 2, 3)));

    });

});





describe('decode_rgba', function () {

    const css = `linear-gradient(to left,
        rgb (  22, 34, 7  ),
        rgba(213, 49, 195, 0.396),
        rgba(6, 8, 6),
        rgba(220, 139, 140, 0.15),
        rgba(107, 148, 233, 0.408),
        rgba(82, 83, 8, 0.46),
        rgba(110, 189, 100, 0.576),
        rgba(136, 86, 22, 0.137) 1 / 2px 0
    `;

    it('reads optional alpha', function () {

        const buf = decode_rgba(css);

        ast.assertInstanceOf(buf, Uint8Array);

        ast.assertStrictEquals(buf.at( 3), 0xFF);
        ast.assertStrictEquals(buf.at(11), 0xFF);

    });

});





describe('modify', function () {

    it('in bounds', function () {

        const i = 1;
        const arr = [ 4, 5, 6 ];
        const fn = modify(i, (n: number) => n * 10);

        ast.assertEquals(fn(arr), arr.with(i, 50));

    });

    it('out of bounds', function () {

        const arr = [ 4, 5, 6 ];
        const fn = modify(999, (n: number) => n * 10);

        ast.assertStrictEquals(fn(arr), arr);

    });

});





describe('mk_Uint8Array', function () {

    it('returns back original buf', function () {

        const buf = Uint8Array.of(1, 2, 3);
        const res = mk_Uint8Array(buf);

        ast.assertStrictEquals(res, buf);

    });

    it('returns equally Uint8Array', function () {

        const buf = Uint8Array.of(1, 2, 3);
        const res = mk_Uint8Array(buf.buffer);

        ast.assertEquals(res, buf);

    });

});





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

