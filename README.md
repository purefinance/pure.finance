# Pure Finance website monorepo

## Development

```sh
npm install
npx lerna run --stream dev
```

Then open the browser at http://localhost:3000.

### Adding a new mini-app

1. Add the new page component at `site/pages`.
1. Add it to the `Utilities` component so it appears in the home page.
1. Go from there!

## End-to-end tests

Set the following environment variables: `BASE_NODE_URL`, `MNEMONIC`.
Then run the tests:

```sh
npm run test:e2e
```
