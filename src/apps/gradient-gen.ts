import {
    to_mnemonic, from_mnemonic, assert_sentence, decode_rgba,
} from '../index.ts';

import {
    nmap, chunk, encode_hex,
} from '../utils.ts';





byId('tpl', tpl =>
byId('form', form =>
byId('submit', submit =>
byId('extract', extract =>
byId('output', output => {

    ____assert(tpl instanceof HTMLTemplateElement);
    ____assert(form instanceof HTMLFormElement);

    const prepend = mount(tpl, output, 7);

    submit.removeAttribute('disabled');

    form.addEventListener('submit', function (event) {

        event.preventDefault();

        const data = new FormData(form);

        const size = data.get('size');

        ____assert(typeof size === 'string' && /^\d+$/.test(size));

        const entropy = rand(Number(size) * 4 / 3);

        prepend(entropy);

    });

    extract.addEventListener('click', async function () {

        const input = globalThis.prompt('Mnemonic Phrase');

        const sentence = input?.trim()?.split(/\s+/);

        if (sentence != null) {

            try {

                assert_sentence(sentence);

                const entropy = await from_mnemonic(sentence);

                prepend(entropy);

            } catch (err) {

                globalThis.alert(err instanceof Error
                    ? err.message
                    : 'something wrong'
                );

            }

        }

    });

})))));





function create (tpl: HTMLTemplateElement, entropy: Uint8Array<ArrayBuffer>) {

    const node = tpl.content.cloneNode(true);

    ____assert(node instanceof DocumentFragment);

    const item = node.querySelector('[x-item]');

    ____assert(item);

    const query = query_selector(item);
    const update = text_content(item);

    const hex = encode_hex(entropy);

    update('[x-title]', hex.slice(0, 2).concat('..', hex.slice(-2)));

    const direction = odd(entropy) ? 'left' : 'right';
    const colors = Array.from(chunk(8, hex), h => `#${ h }`).join(', ');
    const gradient = `linear-gradient(to ${ direction }, ${ colors })`;

    item.setAttribute('style', `--gradient: ${ gradient }`);

    const calc = function () {

        const bg = query('[x-bg]');

        ____assert(bg);

        const { backgroundImage } = globalThis.getComputedStyle(bg);

        const rgba = backgroundImage.replace(/, (?=\d)/g, ',');

        query('[x-copy-colors]')?.addEventListener('click', function () {

            globalThis.navigator.clipboard.writeText(backgroundImage);

        });

        const cli = `deno run npm:bip39-recast gen --rgba '${ rgba }'`;

        update('[x-cli]', cli);

        query('[x-copy-cli]')?.addEventListener('click', function () {

            globalThis.navigator.clipboard.writeText(cli);

        });

        query('[x-run]')?.addEventListener('click', async function (event) {

            const sentence = await to_mnemonic(decode_rgba(rgba));

            update('[x-sentence]', sentence.join(' '));

            ____assert(event.target instanceof Element);

            event.target.setAttribute('disabled', '1');

            item.scrollIntoView({ behavior: 'smooth' });

        }, { once: true });

    };

    return [ node, calc ] as const;

}





function mount (tpl: HTMLTemplateElement, output: Element, max: number) {

    return function (entropy: Uint8Array<ArrayBuffer>) {

        const [ node, calc ] = create(tpl, entropy);

        output.prepend(node);

        if (output.childElementCount > max && output.lastElementChild) {
            output.removeChild(output.lastElementChild);
        }

        calc();

    };

}





function byId <T> (id: string, f: (a: HTMLElement) => T) {

    return nmap(f, globalThis.document.getElementById(id));

}





function query_selector (target: ParentNode) {

    return function (queries: string) {

        return target.querySelector(queries);

    };

}





function text_content (target: ParentNode) {

    return function (queries: string, content: string) {

        return nmap(function (elm) {

            elm.textContent = content;

        }, target.querySelector(queries));

    };

}





function rand (n: number) {

    return globalThis.crypto.getRandomValues(new Uint8Array(n));

}





function odd (arr: ArrayLike<number>) {

    return 1 === Array.from(arr).reduce((a, b) => a ^ b) % 2;

}





function ____assert (expr: unknown, msg = 'fail assertion'): asserts expr {

    if (!expr) {
        throw new Error(msg);
    }

}

