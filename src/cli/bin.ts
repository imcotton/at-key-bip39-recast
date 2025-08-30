#!/usr/bin/env node

import { argv, stdout, stderr } from 'node:process';
import { styleText } from 'node:util';
import { main } from './main.ts';
import { parse } from './parse.ts';





main(parse(argv.slice(2))).then(function (result) {

    if (typeof result === 'string') {
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

