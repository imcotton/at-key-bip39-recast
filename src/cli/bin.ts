#!/usr/bin/env node

import { argv, stdout, stderr } from 'node:process';
import { styleText } from 'node:util';
import { main } from './main.ts';
import { parse } from './parse.ts';





const { qr, ...args } = parse(argv.slice(2));

main(args).then(async function (result) {

    if (typeof result === 'string') {

        if (qr) {

            const { encodeQR } = await import('qr');

            return console.log(encodeQR(result, qr, {
                ecc: 'low',
                scale: 1,
                border: 1,
            }));

        }

        return console.log(result);

    }

    if (result instanceof Uint8Array) {
        return stdout.write(result);
    }

    const { note, err: { message } } = result;

    console.error(styleText(
        [ 'red', 'bold', 'underline' ],
        message,
        { stream: stderr },
    ));

    console.log(note);

});

