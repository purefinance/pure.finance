# pure-finance-lib

## Merkle Claims

This claims are based on [`sol-mass-payouts`](https://github.com/bloq/sol-mass-payouts).

To be able to claim using this library, the claim groups have to be created with an special-formatted `memo` field:

The `memo` will be parsed as `key1=value1;key2=value2;...` much similar to how cookies are encoded.
Then the `datasetUri` key will contain the URI of the data required to execute the claims in JSON format.
The JSON shall contain all the accounts within the group and their related token amount and Merkle proof data as follows:

```json
[
  {
    "account": "0x1234...5678",
    "amount": "10000000000000000000",
    "proof": ["0xabcd...ef01"]
  },
  {
    "account": "0x2345...6789",
    "amount": "15000000000000000000",
    "proof": ["0xbcde...f012"]
  }
]
```
