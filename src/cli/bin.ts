#!/usr/bin/env node

import { argv, stdout } from 'node:process';
import { main } from './main.ts';
import { parse } from './parse.ts';




main(parse(argv.slice(2))).then(function (data: string | Uint8Array) {

    if (typeof data === 'string') {
        return console.log(data);
    }

    stdout.write(data);

});

