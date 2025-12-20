import {

    to_mnemonic, from_mnemonic, assert_sentence,

} from '../index.ts';

import {

    nmap, chunk, encode_hex, decode_rgba, to_error, encode,

} from '../utils.ts';

const {

    crypto: webcrypto,
    prompt, alert,
    document, navigator, getComputedStyle,

} = globalThis;





byId('tpl', tpl =>
byId('form', form =>
byId('submit', submit =>
byId('extract', extract =>
byId('output', output => {

    ____assert(tpl instanceof HTMLTemplateElement);
    ____assert(form instanceof HTMLFormElement);

    const prepend = mount(tpl, output, 7);

    submit.removeAttribute('disabled');

    form.addEventListener('submit', async function (event) {

        event.preventDefault();

        const data = new FormData(form);

        const size = data.get('size');

        ____assert(typeof size === 'string' && /^\d+$/.test(size));

        const entropy = rand(Number(size) * 4 / 3);

        await prepend(entropy).catch(alert_message);

    });

    extract.addEventListener('click', async function () {

        const input = prompt('Mnemonic Sentence:');

        const sentence = input?.trim().split(/\s+/);

        if (sentence != null) {

            try {

                assert_sentence(sentence);

                const entropy = await from_mnemonic(sentence);

                await prepend(entropy);

            } catch (err) {

                alert_message(err);

            }

        }

    });

    output.addEventListener('click', async function ({ target }) {

        ____assert(target instanceof Element);

        if (   target instanceof HTMLButtonElement
            && target.closest('pre.code')
        ) {

            const code = target.previousSibling ?? target.nextSibling;

            if (code instanceof HTMLElement) {
                await navigator.clipboard.writeText(code.textContent);
            }

        }

    });

})))));





async function create (

        tpl: HTMLTemplateElement,
        entropy: Uint8Array<ArrayBuffer>,

) {

    const node = tpl.content.cloneNode(true);

    ____assert(node instanceof DocumentFragment);

    const item = node.querySelector('[x-item]');

    ____assert(item);

    const query = query_selector(item);
    const update = text_content(item);

    const select_format = query('select[name="format"]');

    ____assert(select_format instanceof HTMLSelectElement);

    const checkbox_cli = query('input[type="checkbox"][name="CLI"]');

    ____assert(checkbox_cli instanceof HTMLInputElement);

    await to_mnemonic(entropy).then(sentence => {

        update('[x-sentence]', sentence.join(' '));

    });

    const hex = encode_hex(entropy);

    update('[x-title]', hex.slice(0, 2).concat('..', hex.slice(-2)));

    const direction = odd(entropy) ? 'left' : 'right';
    const colors = Array.from(chunk(8, hex), h => `#${ h }`).join(', ');
    const gradient = `linear-gradient(to ${ direction }, ${ colors })`;

    item.setAttribute('style', `--gradient: ${ gradient }`);

    const calc = function () {

        const style = nmap(getComputedStyle, query('[x-bg]'));

        ____assert(style);

        const { backgroundImage } = style;

        ____assert(arr_equals(entropy, decode_rgba(backgroundImage)));

        const reprint = compute({

            entropy,

            rgba: backgroundImage.replace(/, (?=\d)/g, ','),

            snapshot: () => ({
                cli: checkbox_cli.checked,
                format: select_format.value,
            }),

            flush (seed) {
                update('[x-seed]', seed);
            },

        });

        select_format.addEventListener('change', reprint);

        checkbox_cli.addEventListener('change', reprint);

        reprint();

    };

    return [ node, calc ] as const;

}





function compute ({ entropy, rgba, snapshot, flush }: {

        entropy: Uint8Array<ArrayBuffer>,
        rgba: string,
        snapshot: () => { cli: boolean, format: string },
        flush: (_: string) => void,

}) {

    return function () {

        const { cli, format } = snapshot();

        const show = encode({ [format]: true });

        const seed = format === 'rgba' ? rgba : show(entropy);

        ____assert(typeof seed === 'string');

        const upper = format === 'hex' ? seed.toUpperCase() : seed;

        const gen = 'deno run npm:bip39-recast gen';

        flush(cli ? `${ gen } --${ format } '${ upper }'` : upper);

    };

}





function mount (tpl: HTMLTemplateElement, output: Element, max: number) {

    return async function (entropy: Uint8Array<ArrayBuffer>) {

        const [ node, calc ] = await create(tpl, entropy);

        output.prepend(node);

        if (output.childElementCount > max && output.lastElementChild) {
            output.removeChild(output.lastElementChild);
        }

        calc();

    };

}





function byId <T> (id: string, f: (a: HTMLElement) => T) {

    return nmap(f, document.getElementById(id));

}





function query_selector (target: ParentNode) {

    return function (queries: string) {

        return target.querySelector(queries);

    };

}





function text_content (target: ParentNode) {

    return function (queries: string, content: string) {

        nmap(function (elm) {

            elm.textContent = content;

        }, target.querySelector(queries));

    };

}





function rand (n: number) {

    return webcrypto.getRandomValues(new Uint8Array(n));

}





function odd (arr: ArrayLike<number>) {

    return 1 === Array.from(arr).reduce((a, b) => a ^ b) % 2;

}





function arr_equals <T> (fst: ArrayLike<T>, snd: ArrayLike<T>) {

    if (fst.length !== snd.length) {
        return false;
    }

    const fst_arr = Array.from(fst);
    const snd_arr = Array.from(snd);

    return fst_arr.reduce((x, s, i) => x && s === snd_arr.at(i), true);

}





function alert_message (err: unknown) {

    const { message } = to_error(err);

    alert(message);

}





function ____assert (expr: unknown, msg = 'fail assertion'): asserts expr {

    if (!expr) {
        throw new Error(msg);
    }

}

