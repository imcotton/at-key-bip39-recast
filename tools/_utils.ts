import * as v from 'jsr:@valibot/valibot@1';

import { main as shasum, type Algorithm } from 'jsr:@imcotton/sri@0.9/main';





export function parse_pico (str: string) {

    const [ url, folder, version, name ] = v.parse(v.tuple([

        v.pipe(v.string(), v.url()),
        v.string(),
        v.string(),
        v.string(),

    ]), str.match(/href="(https:\/\/raw.esm.sh\/@(.*)\/pico@(.*)\/css\/(pico.min.css))"/)?.slice(1));

    const integrity = v.parse(v.object({

        algorithm: v.picklist([ '256', '384', '512' ]),
        checksum: v.pipe(v.string(), v.base64()),

    }), str.match(/integrity="sha(?<algorithm>\d+)-(?<checksum>.*)"/)?.groups);

    return { url, folder, version, name, ...integrity };

}





export function parse_scripts (

        html: string,
        dist: (_: string) => string,

) {

    const scripts = v.parse(
        v.array(v.tuple([ v.string(), v.string() ])),
        Array.from(html.matchAll(/<script src="([^"]+)/g)),
    );

    return Promise.all(scripts.map(async function ([ script, src ]) {

        const source = dist(src);

        const { checksum, integrity } = await Deno.open(source).then(
            calculate({ algorithm: '256', size: 8 })
        );

        const version = alter('-', checksum, '.js');

        return ({
            source,
            integrity,
            script,
            target: version(src),
        });

    }));

}





export function tail (target: string) {

    return target.replace(/^[^/]+\//, './');

}





export function calculate ({ size, algorithm }: {

        size: number,
        algorithm: Algorithm,

}) {

    return async function (file: Pick<Deno.FsFile, 'readable'>) {

        const [ one, two ] = file.readable.tee();

        const [ integrity, checksum ] = await Promise.all([

            shasum({

                algorithm,
                format: 'base64',
                task: to_array_buffer(one),
                prefix: true,

            }),

            shasum({

                algorithm,
                format: 'hex',
                task: to_array_buffer(two),

            }).then(str => str.slice(0, size)),

        ]);

        return { integrity, checksum };

    };

}





export async function load_and_verify ({ url, checksum, algorithm }: {

        url: string,
        checksum: string,
        algorithm: Algorithm,

}) {

    const res = await fetch(url);

    v.assert(v.object({
        ok: v.literal(true),
        body: v.instance(ReadableStream),
    }), res);

    const [ one, two ] = res.body.tee();

    await shasum({
        checksum,
        algorithm,
        task: to_array_buffer(one),
    });

    return two;

}





export function write_file (path: string | URL, opts?: Deno.WriteFileOptions) {

    return function (data: Uint8Array | ReadableStream<Uint8Array>) {

        return Deno.writeFile(path, data, opts);

    };

}





export function write_text_file (path: string | URL, opts?: Deno.WriteFileOptions) {

    return function (data: string | ReadableStream<string>) {

        return Deno.writeTextFile(path, data, opts);

    };

}





function to_array_buffer (stream: ReadableStream<Uint8Array>) {

    return () => new Response(stream).arrayBuffer();

}





export function replace (

        older: RegExp | string,
        newer: string,

) {

    return (origin: string) => origin.replace(older, newer);

}





export function alter (

        open: string,
        data: string | ((_: string) => string),
        close: string,
        by = '',

) {

    const slice = mark(open, close);

    return function (origin: string) {

        const { up, middle, down } = slice(origin);

        return Array.of(

            origin.slice(0, up),
            typeof data === 'function' ? data(middle) : data,
            origin.slice(down),

        ).join(by);

    };

}





export function mark (

        open: string,
        close: string,

) {

    return function (origin: string) {

        const i = origin.indexOf(open);
        const up = i + open.length;
        const down = origin.indexOf(close, up);
        const middle = origin.slice(up, down);

        return { i, up, middle, down };

    };

}

