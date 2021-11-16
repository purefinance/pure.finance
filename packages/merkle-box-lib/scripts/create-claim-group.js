/**
 * Usage:
 *
 *   NODE_URL=http://node.url MNEMONIC="12 words..." node \
 *     scripts/create-claim-group.js \
 *     USDC http://dataset.url/file.json 2021-12-31
 */

'use strict'

require('dotenv').config()

const createErc20 = require('erc-20-lib')
const fetch = require('node-fetch')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const createMerkleBox = require('..')

const [token, datasetUrl, unlock] = process.argv.slice(2)

const provider = new HDWalletProvider({
  addressIndex: Number.parseInt(process.env.ACCOUNT) || 0,
  mnemonic: process.env.MNEMONIC,
  numberOfAddresses: 1,
  providerOrUrl: process.env.NODE_URL
})
const from = provider.getAddress(0)
const web3 = new Web3(provider)
const merkleBoxAddress = createMerkleBox.addresses.mainnet
const merkleBox = createMerkleBox(web3, merkleBoxAddress, { from })

const tokenAddress = token.startsWith('0x')
  ? token
  : createErc20.util.tokenAddress(token)

const memo = `datasetUri=${datasetUrl}`

const toTimestamp = str =>
  /^[0-9]+$/.test(str)
    ? Number.parseInt(str)
    : Math.round(new Date(str).getTime() / 1000)

return fetch(datasetUrl)
  .then(res => res.json())
  .then(function (recipients) {
    const total = recipients
      .reduce((sum, recipient) => sum + BigInt(recipient.amount), BigInt(0))
      .toString()
    const root = createMerkleBox.util.bufferToHex(
      createMerkleBox.util.calcMerkleTree(recipients).getRoot()
    )
    return Promise.all([
      total,
      root,
      createErc20(web3, tokenAddress, { from }).approve(merkleBoxAddress, total)
    ])
  })
  .then(([total, root]) =>
    merkleBox.newClaimsGroup(
      tokenAddress,
      total,
      root,
      toTimestamp(unlock),
      memo
    )
  )
  .then(function (receipt) {
    console.log(receipt.events.NewMerkle.returnValues)
  })
  .catch(console.error)
  .finally(function () {
    provider.engine.stop()
  })
