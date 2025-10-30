import { join } from 'node:path';
import { cwd } from 'node:process';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';

import { to_mnemonic } from '../bip39.ts';
import * as u from '../utils.ts';





export async function reveal (url: string): Promise<u.Sentence> {

    const base = new URL(
        is_http(url) ? url : pathToFileURL(join(cwd(), url))
    );

    const info = await read_lines(base).then(scrape);

    const res = await Promise.allSettled(Array.from(

        collect(info, loading(base)),

        entropy => entropy.then(to_mnemonic),

    )).then(arr => arr.find(p => p.status === 'fulfilled')?.value);

    u.assert_sentence(res);

    return res;

}





function * collect (

        { hash, icon, css, svg }: Scrape,
        read: ReturnType<typeof loading>,

) {

    if (hash) {
        yield Promise.resolve(hash).then(load_reversed_sri);
    }

    if (icon) {
        yield read(icon).then(buf => new Uint8Array(buf));
    }

    if (css) {
        yield read(css).then(u.decode_text).then(u.decode_rgba);
    }

    if (svg) {
        yield read(svg).then(u.decode_text).then(find_dec).then(u.decode_dec);
    }

    const puzzle = stitch(icon, css, svg);

    if (puzzle.length > 0) {
        yield Promise.resolve(puzzle).then(u.join).then(u.decodeBase58);
    }

}





function stitch (...xs: ReadonlyArray<string | undefined>) {

    return xs.filter(str => str != null).map(function (str) {

        const index = str.indexOf('-') + 1;

        return str.slice(index, str.indexOf('.', index));

    });

}





function find_dec (str: string) {

    const index = str.indexOf(`points="`);
    const points = str.slice(index, str.indexOf(`/>`, index));

    return points.replaceAll(/[^0-9]+/g, '');

}





type Scrape = ReturnType<typeof scrape>;

function scrape (arr: ReadonlyArray<string>) {

    const hash = arr.find(str => str.includes(`'unsafe-hashes' 'sha`))
        ?.match(/sha\d+-(.+)'/)?.at(1)
    ;

    const icon = arr.find(str => str.includes(`<link rel="icon"`))
        ?.match(/href="(.+.ico)"/)?.at(1)
    ;

    const css = arr.find(str => str.includes(`<link rel="stylesheet"`))
        ?.match(/href="(.+.css)"/)?.at(1)
    ;

    const svg = arr.find(str => str.includes(`<img src="./logo-`))
        ?.match(/src="(.+.svg)"/)?.at(1)
    ;

    return { hash, icon, css, svg };

}





function load_reversed_sri (hash: string) {

    const reversed = Array.from(hash).toReversed().join('');

    const index = reversed.lastIndexOf('=') + 1;

    const refine = reversed.slice(index).concat(
        reversed.slice(0, index)
    );

    return u.decode_base64(refine);

}





async function read_lines (url: URL) {

    const input = await load_or_read(url)
        .then(Array.of)
        .then(Readable.from)
    ;

    return Array.fromAsync(createInterface({ input }));

}





function is_http (str: string) {

    return /^https?:\/\//.test(str);

}





function load_or_read (url: URL) {

    return is_http(url.href) ? load(url) : readFile(url);

}





async function load (url: URL) {

    const res = await fetch(url);

    if (res.ok && res.body) {
        return res.bytes();
    }

    await res.body?.cancel();

    throw new Error('empty body');

}





function loading (base: URL) {

    return function (url: string) {

        return load_or_read(new URL(url, base));

    };

}

