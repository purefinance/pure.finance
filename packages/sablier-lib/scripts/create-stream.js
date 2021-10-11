/**
 * Usage:
 *
 *   NODE_URL=http://node.url MNEMONIC="12 words..." node \
 *     scripts/create-stream.js \
 *     0x1234...5678 \
 *     1000000 USDC \
 *     2021-03-08T19:49 2021-03-09
 */

'use strict'

require('dotenv').config()

const createErc20 = require('erc-20-lib')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const createSablier = require('..')

const [recipient, amount, token, start, stop] = process.argv.slice(2)

const provider = new HDWalletProvider({
  addressIndex: Number.parseInt(process.env.ACCOUNT) || 0,
  mnemonic: process.env.MNEMONIC,
  numberOfAddresses: 1,
  providerOrUrl: process.env.NODE_URL
})
const from = provider.getAddress(0)
const web3 = new Web3(provider)
const sablier = createSablier(web3, { from })

const toTimestamp = str =>
  /^[0-9]+$/.test(str)
    ? Number.parseInt(str)
    : Math.round(new Date(str).getTime() / 1000)

const startTime = toTimestamp(start)
const stopTime = toTimestamp(stop)

const deposit = sablier.calcDeposit(startTime, stopTime, amount)

const tokenAddress = token.startsWith('0x')
  ? token
  : createErc20.util.tokenAddress(token)

return createErc20(web3, tokenAddress, { from })
  .approve(sablier.getAddress(), deposit)
  .then(() =>
    sablier.createStream(recipient, deposit, tokenAddress, startTime, stopTime)
  )
  .then(function (receipt) {
    console.log(receipt.events.CreateStream.returnValues)
  })
  .catch(console.error)
  .finally(function () {
    provider.engine.stop()
  })
