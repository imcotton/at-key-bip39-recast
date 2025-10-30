import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cwd } from 'node:process';
import { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { arrayBuffer, text } from 'node:stream/consumers';

import { to_mnemonic } from '../bip39.ts';
import * as u from '../utils.ts';





export async function reveal (file: string) {

    const base = new URL(
        is_http(file) ? file : pathToFileURL(join(cwd(), file))
    );

    const info = await read_lines(base).then(scrape);

    const tasks = collect(info, loading(base));

    const entropy = await Promise.race(Array.from(tasks));

    return to_mnemonic(entropy);

}





function * collect (

        { hash, icon, css, svg }: Scrape,
        read: (url: string) => Promise<Readable>,

) {

    if (hash) {
        yield Promise.try(find_unsafe_hashes, hash);
    }

    if (icon) {
        yield read(icon).then(find_favicon);
    }

    if (css) {
        yield read(css).then(find_style);
    }

    if (svg) {
        yield read(svg).then(find_svg);
    }

    const puzzle = stitch({ icon, css, svg });

    if (puzzle) {
        yield Promise.try(u.decodeBase58, puzzle);
    }

}





function stitch ({ icon, css, svg }: Omit<Scrape, 'hash'>) {

    if (icon && css && svg) {

        return [ icon, css, svg ].map(function (str) {

            const index = str.indexOf('-') + 1;

            return str.slice(index, str.indexOf('.', index));

        }).join('');

    }

    return void 0;

}





async function find_style (readable: Readable) {

    const str = await text(readable);

    return u.decode_rgba(str)

}





async function find_favicon (readable: Readable) {

    const buf = await arrayBuffer(readable);

    return new Uint8Array(buf);

}





async function find_svg (readable: Readable) {

    const str = await text(readable);

    const index = str.indexOf('points="{');
    const points = str.slice(index, str.indexOf('}', index)) ;
    const decimal = points.match(/\d+/g)?.join('');

    if (decimal != null) {
        return u.decode_dec(decimal);
    }

    throw new Error('no svg');

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





function find_unsafe_hashes (hash: string) {

    const reversed = Array.from(hash).toReversed().join('');

    const index = reversed.lastIndexOf('=') + 1;

    const refine = reversed.slice(index).concat(
        reversed.slice(0, index)
    );

    return u.decode_base64(refine);

}





async function read_lines (url: URL) {

    const input = await load_or_read(url);

    return Array.fromAsync(createInterface({ input }));

}





function is_http (str: string) {

    return /^https?:\/\//.test(str);

}





async function load_or_read (url: URL) {

    if (is_http(url.href)) {
        // @ts-ignore settle down between tsc and Deno
        return await load(url).then(Readable.from);
    }

    return createReadStream(url);

}





async function load (url: string | URL) {

    const res = await fetch(url);

    if (res.ok && res.body) {
        return res.body;
    }

    await res.body?.cancel();

    throw new Error('empty body');

}





function loading (base: URL) {

    return function (url: string) {

        return load_or_read(new URL(url, base));

    };

}

