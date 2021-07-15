# Pure Finance website monorepo

## Development

```sh
npm install
npx lerna run --stream dev
```

Then open the browser at http://localhost:3000.

### Addind a new mini-app

1. Add the new page component at `site/pages`.
1. Add it to the `Utilities` component so it appears in the home page.
1. Go from there!

## End-to-end tests

Create a `.env` file at `packages/merkle-box-lib` or set the following environment variables: `NODE_URL`, `NODE_BASE_URL`, `MNEMONIC`.
Then start the fork and run the tests:

```sh
npx lerna run --stream fork:start &
npx lerna run --stream test:e2e
```
