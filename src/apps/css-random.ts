import { decode_rgba, to_mnemonic } from '../index.ts';





$('root', root =>
$('palette', palette =>
$('rgba', rgba =>
$('sentence', async sentence => {

    try {

        const { backgroundImage } = getComputedStyle(palette);

        const buf = decode_rgba(backgroundImage);
        const arr = await to_mnemonic(buf);

        root.removeAttribute('hidden');

        const cmd = 'deno run npm:bip39-recast gen';
        rgba.innerText = `${ cmd } --rgba='${ backgroundImage }'`;

        sentence.innerText = arr.join(' ');

    } catch {

        console.error('not working');

    }

}))));





function $ <T> (id: string, f: (a: HTMLElement) => T) {

    const elm = document.getElementById(id);

    if (elm != null) {
        return f(elm);
    }

    return void 0;

}

