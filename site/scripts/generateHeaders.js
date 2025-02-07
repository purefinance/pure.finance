const { writeFile } = require('fs/promises')
const path = require('path')

const fontsSrc = ['fonts.gstatic.com']

// The sha256 values represents the hashing of the
// Tailwind CSS files after the build and can be obtained
// by running the application with [npm run serve] and
// checking the error messages in the web browser console
// more details in https://github.com/hemilabs/pure.finance/pull/65
const styleSrc = [
  'fonts.googleapis.com',
  `'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='`,
  `'sha256-PlRfgfltn3VMXM8qgB4ESajyldRqslkTW9V28Xe7rQ0='`
]

const serveJson = {
  headers: [
    {
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Download-Options',
          value: 'noopen'
        },
        {
          key: 'Expect-CT',
          value: 'max-age=86400, enforce'
        },
        {
          key: 'Referrer-Policy',
          value: 'no-referrer-when-downgrade'
        },
        {
          key: 'Permissions-Policy',
          value: 'geolocation=(), microphone=()'
        },
        {
          key: 'Content-Security-Policy',
          value: `default-src 'self'; font-src 'self' ${fontsSrc.join(
            ' '
          )};style-src 'self' ${styleSrc.join(' ')}; `
        }
      ],
      source: '**/*.*'
    }
  ]
}

const toHtAccess = config =>
  `<IfModule mod_headers.c>
    ${config.headers
      .flatMap(({ headers }) => headers)
      .map(header => `Header always set ${header.key} "${header.value}"`)
      .join('\n')}
  </IfModule>`

// eslint-disable-next-line promise/catch-or-return
Promise.all([
  // needed for serving with serve, useful to test headers locally
  writeFile(
    path.resolve(__dirname, '../out/serve.json'),
    JSON.stringify(serveJson, null, 2)
  ),
  // needed for serving with hostinger
  writeFile(path.resolve(__dirname, '../out/.htaccess'), toHtAccess(serveJson))
]).then(() =>
  // eslint-disable-next-line no-console
  console.info('Headers generated successfully')
)
