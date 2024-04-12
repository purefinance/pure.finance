/**
 * Usage:
 *
 *   NODE_URL=http://node.url MNEMONIC="12 words..." node \
 *     scripts/create-claim-group.js \
 *     USDC http://dataset.url/file.json 2021-12-31
 */

/* eslint-disable no-console */

'use strict'

require('dotenv').config()

const createErc20 = require('erc-20-lib')
const fetch = require('node-fetch')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const createMerkleBox = require('..')

const { ACCOUNT = '0', MNEMONIC = '', NODE_URL, PRIVATE_KEYS } = process.env

const [token, datasetUrl, unlock] = process.argv.slice(2)

const getContractObjects = () =>
  // @ts-ignore ts(2351)
  new Web3(NODE_URL).eth.getChainId().then(function (chainId) {
    const provider = new HDWalletProvider({
      addressIndex: Number.parseInt(ACCOUNT),
      chainId,
      numberOfAddresses: 1,
      providerOrUrl: NODE_URL,
      ...(PRIVATE_KEYS
        ? { privateKeys: PRIVATE_KEYS.split(',') }
        : { mnemonic: MNEMONIC })
    })
    const from = provider.getAddress(0)
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider)
    const tokenAddress = token.startsWith('0x')
      ? token
      : createErc20.util.tokenAddress(token, chainId)
    const erc20 = createErc20(web3, tokenAddress, { from })
    const merkleBoxAddress = createMerkleBox.addresses[chainId]
    const merkleBox = createMerkleBox(web3, merkleBoxAddress, { from })
    return { erc20, merkleBox, provider }
  })

const parseDataSet = () =>
  fetch(datasetUrl)
    .then(res => res.json())
    .then(function (recipients) {
      const root = createMerkleBox.util.bufferToHex(
        createMerkleBox.util.calcMerkleTree(recipients).getRoot()
      )
      const total = recipients
        .reduce((sum, recipient) => sum + BigInt(recipient.amount), BigInt(0))
        .toString()
      return {
        root,
        total
      }
    })

const toTimestamp = str =>
  /^[0-9]+$/.test(str)
    ? Number.parseInt(str)
    : Math.round(new Date(str).getTime() / 1000)

Promise.all([getContractObjects(), parseDataSet()])
  .then(([{ erc20, merkleBox, provider }, { root, total }]) =>
    erc20
      .approve(merkleBox.getAddress(), total)
      .then(() =>
        merkleBox.newClaimsGroup(
          erc20.getAddress(),
          total,
          root,
          toTimestamp(unlock),
          `datasetUri=${datasetUrl}`
        )
      )
      .finally(function () {
        provider.engine.stop()
      })
  )
  .then(function (receipt) {
    console.log(receipt.events.NewMerkle.returnValues)
  })
  .catch(console.error)
