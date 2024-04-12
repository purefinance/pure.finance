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

## Testing

### Merkle claims

Go to `packages/merkle-box-lib` and create a list of recipients as a JSON file:

```json
[
  {
    "account": "0x0000000000000000000000000000000000000010",
    "amount": "1000000000000000000"
  },
  {
    "account": "0x0000000000000000000000000000000000000020",
    "amount": "2000000000000000000"
  }
]
```

Create the dataset:

```sh
node scripts/create-dataset.js recipients.json > dataset.json
```

And copy the data set file to the development web server at `site/public`.

Set `NODE_URL`, `MNEMONIC` and create the claim group:

```sh
node scripts/create-claim-group.js WETH http://localhost:3000/test20241231.json 2024-12-31
```

## End-to-end tests

Set the following environment variables: `BASE_NODE_URL`, `MNEMONIC`.
Then run the tests:

```sh
npm run test:e2e
```

## Deployment

```sh
npm ci
cd site
BASE_PATH="/pure.finance" npm run build
```

Then upload the folder `site/out` to the hosting server.
