# Pure Finance website monorepo

## Development

```sh
npm install
npx lerna run --stream dev
```

Then open the browser at http://localhost:3000.

## End-to-end tests

Create a `.env` file at `packages/pure-finance-lib` or set the following environment variables: `NODE_URL`, `MNEMONIC`.
Then run the tests:

```sh
npx lerna run --stream test:e2e
```
