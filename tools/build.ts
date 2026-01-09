#!/usr/bin/env -S deno run -N=raw.esm.sh:443 -R=./dist -W=./dist

import * as fs from 'jsr:@std/fs@1';
import * as path from 'jsr:@std/path@1';

import * as csp from './_csp.ts';
import * as u from './_utils.ts';





async function main (output = './dist') {

    const dist = (...xs: string[]) => path.join(output, ...xs);

    const dist_assets = dist('assets');

    await fs.ensureDir(dist_assets);

    const dist_index_html = dist('index.html');

    await Deno.readTextFile(dist_index_html)

        .then(async function (html) {

            const arr = await u.parse_scripts(html, dist).then(function (xs) {

                return xs.map(({ target, ...rest }) => ({
                    ...rest,
                    dest: path.join(dist_assets, target),
                }));

            });

            await Promise.all(arr.map(function ({ source, dest }) {
                return fs.move(source, dest, { overwrite: true });
            }));

            return arr.reduce(function (str, { script, dest, integrity }) {

                return str.replace(script.concat('"'), `

                    <script src="${ u.tail(dest) }" integrity="${ integrity }"

                `.trim());

            }, html);

        })

        .then(async function (html) {

            const { folder, version, name, ...remote } = u.parse_pico(html);

            const target = path.join(dist_assets, folder, version, name);

            await fs.ensureDir(path.parse(target).dir);

            await u.load_and_verify(remote).then(u.write_file(target));

            return html.replace(remote.url, u.tail(target));

        })

        .then(html => csp.hashes(html)

            .then(csp.content)

            .then(async function (content) {

                const dist_headers = dist('_headers');

                await Deno.readTextFile(dist_headers)

                    .then(u.alter(`Content-Security-Policy: `,

                        content,

                    `;`))

                    .then(u.write_text_file(dist_headers))

                ;

                return u.alter(`http-equiv="Content-Security-Policy" content="`,

                    content,

                `" />`);

            })

            .then(update => update(html))

        )

        .then(u.write_text_file(

            dist_index_html,

        ))

    ;

}





if (import.meta.main) {

    main();

}

