#!/usr/bin/env bash
set -euo pipefail

DIST="${DIST:-./dist/wwwroot}"

mkdir -p "${DIST}"

if [ $# -eq 0 ]; then

    seed=$(echo 'fib(735) * pi(560) * e(8)' | bc -l \
        | tr '.' '*' | bc -O 16 \
        | xxd -r -p \
        | openssl dgst -sha3-384 \
        | awk '{print $2}'
    )

    set --   --size 24   --hex "${seed}"

fi





mnemonic=$(deno   npm:bip39-recast   gen "$@")

extract="  deno   npm:bip39-recast   extract ${mnemonic}"

decimal=$(   ${extract} --dec      )
base58=$(    ${extract} --base58   )
base64=$(    ${extract} --base64   )
rgba=$(      ${extract} --rgba     )





len=$(( ${#base58} / 3 ))

favicon="favicon-${base58:0:len}.ico"

${extract} --raw > "${DIST}/${favicon}"





style="style-${base58:len:len}.css"

cat << EOF > "${DIST}/${style}"

    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }

    .border {
        border-image: linear-gradient(to left, ${rgba}) 1 / 0.20em 0 0;
    }

EOF





logo="logo-${base58:len*2}.svg"

cat << EOF > "${DIST}/${logo}"
    <svg xmlns="http://www.w3.org/2000/svg">

        <polyline fill="none" points="$(

            echo "${decimal}" \
                | fold -w 5 \
                | sed -E 's/(..)(.*)/\1, \2/' \
                | tr '\n' ' '

        )" />

    </svg>
EOF





cat << EOF > "${DIST}/index.html"
<!DOCTYPE html>
<html>

    <head>

        <meta charset="utf-8" />

        <title>untitled</title>

        <meta   name="viewport"
                content="width=device-width, initial-scale=1"
        />

        <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            img-src 'self';
            style-src 'self';
            script-src 'unsafe-hashes' 'sha256-$(
                echo "${base64}" | rev | sed -E 's/^(=*)(.*)/\2\1/'
            )'
        " />

        <link rel="icon" href="./${favicon}" />

        <link rel="stylesheet" href="./${style}"
            integrity="sha256-$(
                shasum -a256 "${DIST}/${style}" | xxd -r -p | base64
            )"
        />

    </head>

    <body class="border">

        <h1>
            Welcome to nginx!
            <img src="./${logo}" width="42" height="42" />
        </h1>

        <p>
            If you see this page,
            the nginx web server is successfully installed and working.
            Further configuration is required.
        </p>

        <p>
            <em>Thank you for using nginx.</em>
        </p>

    </body>

</html>
EOF





res=$(deno -R="${DIST}" ./src/mod.ts reveal "${DIST}/index.html")

if [ "${res}" != "${mnemonic}" ]; then
    echo "${res}"
    exit 1;
fi

