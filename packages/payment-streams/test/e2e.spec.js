'use strict'

require('chai').should()
require('dotenv').config()

const { promisify } = require('util')
const ganache = require('ganache-core')
const Web3 = require('web3')

const createPaymentStreams = require('..')

// Some useful token addresses
const usdcAddr = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' // USDC:1
const wethAddr = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH:1
const vspAddr = '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421' // VSP:1

// Receipt check helper
const checkTxSuccess = function (receipt) {
  receipt.should.have.property('status').that.is.true
  return receipt
}

describe('Payment Streams', function () {
  this.timeout(120000) // 2m

  let web3
  let acc
  let ps

  before(function () {
    if (!process.env.E2E) {
      this.skip()
      return
    }

    // Data needed to unlock the deployer/owner and add streaming tokens.
    const paymentStreamAddress = '0x49599EB7E3b4A69B802333c773692240204f3755'
    const paymentStreamBirthblock = 12877534
    const paymentStreamDeployer = '0xC2a8814258F0bb54F9CC1Ec6ACb7a6886097b994'

    let provider

    const setProvider = function () {
      // @ts-ignore ts(2351)
      const _web3 = new Web3(process.env.BASE_NODE_URL)
      return _web3.eth.getChainId().then(function (chainId) {
        /* eslint-disable camelcase */
        // @ts-ignore ts(2339)
        provider = ganache.provider({
          _chainIdRpc: chainId,
          fork: process.env.BASE_NODE_URL,
          fork_block_number: paymentStreamBirthblock + 21, // Deployment + 5m
          logger: console,
          mnemonic: process.env.MNEMONIC,
          unlocked_accounts: [paymentStreamDeployer],
          verbose: false // Log RPC calls and responses
        })
        /* eslint-enable camelcase */
      })
    }

    const setWeb3 = function () {
      // @ts-ignore ts(2351)
      web3 = new Web3(provider)
      return web3.eth.getChainId().then(function (chainId) {
        console.log('  Using fork with chain id %s', chainId)
      })
    }

    const setTestAccounts = function () {
      const listAccountsAsync = promisify(
        provider.manager.personal_listAccounts.bind(provider.manager)
      )
      return listAccountsAsync().then(function (accounts) {
        acc = accounts.map(web3.utils.toChecksumAddress)
      })
    }

    const setLibs = function () {
      ps = createPaymentStreams(web3)
    }

    const transferOwnership = function () {
      return ps.getContract().then(function (contract) {
        if (contract.options.address !== paymentStreamAddress) {
          throw new Error('Outdated PaymentStream address')
        }
        return contract.methods
          .transferOwnership(acc[0])
          .send({ from: paymentStreamDeployer })
      })
    }

    return setProvider()
      .then(setWeb3)
      .then(setTestAccounts)
      .then(setLibs)
      .then(transferOwnership)
  })

  it('should get the list of supported tokens', function () {
    return ps
      .addToken(vspAddr, 0, [usdcAddr, wethAddr, vspAddr], { from: acc[0] })
      .promise.then(checkTxSuccess)
      .then(ps.getTokens)
      .then(function (tokens) {
        tokens.should.be.an('array').that.has.lengthOf(1)
        tokens.should.deep.equal([vspAddr])
      })
  })

  it('should create a stream', function () {
    const usdAmount = '100000000000000000000' // 100 USD
    const endTime = Math.round(Date.now() / 1000) + 3600 // Now + 1h

    return ps
      .addToken(vspAddr, 0, [usdcAddr, wethAddr, vspAddr], { from: acc[0] })
      .promise.then(checkTxSuccess)
      .then(
        () =>
          ps.createStream(acc[1], usdAmount, vspAddr, endTime, { from: acc[0] })
            .promise
      )
      .then(checkTxSuccess)
  })

  it('shoud list created streams', function () {
    const usdAmount = '100000000000000000000' // 100 USD
    const endTime = Math.round(Date.now() / 1000) + 3600 // Now + 1h

    return ps
      .addToken(vspAddr, 0, [usdcAddr, wethAddr, vspAddr], { from: acc[0] })
      .promise.then(checkTxSuccess)
      .then(() =>
        Promise.all([
          ps.createStream(acc[3], usdAmount, vspAddr, endTime, { from: acc[2] })
            .promise,
          ps.createStream(acc[4], usdAmount, vspAddr, endTime, { from: acc[3] })
            .promise
        ])
      )
      .then(function (receipts) {
        return receipts.map(checkTxSuccess)
      })
      .then(() => ps.getStreams(acc[2]))
      .then(function (streams) {
        streams.length.should.equal(1)
      })
      .then(() => ps.getStreams(acc[3]))
      .then(function (streams) {
        streams.length.should.equal(2)
      })
      .then(() => ps.getStreams(acc[4]))
      .then(function (streams) {
        streams.length.should.equal(1)
      })
  })
})
