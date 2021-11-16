'use strict'

require('chai').should()
require('dotenv').config()

const { promisify } = require('util')
const createErc20 = require('erc-20-lib')
const ganache = require('ganache-core')
const Web3 = require('web3')

const createPaymentStreams = require('..')
const pTap = require('p-tap')

// Some useful token addresses
const vspAddr = '0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421' // VSP:1

// Receipt check helper
const checkSuccess = function (objWithStatus) {
  objWithStatus.should.have.property('status').that.is.true
  return objWithStatus
}

describe('Payment Streams', function () {
  this.timeout(0)

  let web3
  let acc
  let ps

  before(function () {
    if (!process.env.E2E) {
      this.skip()
      return null
    }

    let provider

    /* eslint-disable camelcase */
    const setProvider = function () {
      // @ts-ignore ts(2351)
      const _web3 = new Web3(process.env.BASE_NODE_URL)
      return _web3.eth.getChainId().then(function (chainId) {
        // @ts-ignore ts(2339)
        provider = ganache.provider({
          _chainIdRpc: chainId,
          fork: process.env.BASE_NODE_URL,
          logger: console,
          mnemonic: process.env.MNEMONIC,
          verbose: false // Log RPC calls and responses
        })
      })
    }
    /* eslint-enable camelcase */

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

    return setProvider().then(setWeb3).then(setTestAccounts).then(setLibs)
  })

  it('should create a stream', function () {
    const from = acc[0]
    const usdAmount = '100000000000000000000' // 100 USD
    const endTime = Math.round(Date.now() / 1000) + 3600 // Now + 1h

    return ps
      .createStream(acc[1], usdAmount, vspAddr, endTime, { from })
      .promise.then(checkSuccess)
      .then(function ({ result }) {
        result.should.have.a
          .property('id')
          .that.is.a('string')
          .and.matches(/^\d+$/)
        result.should.have.a
          .property('stream')
          .that.is.a('string')
          .and.matches(/^0x[0-9a-fA-F]{40}$/)
      })
  })

  it('shoud list created streams', function () {
    const usdAmount = '100000000000000000000' // 100 USD
    const endTime = Math.round(Date.now() / 1000) + 3600 // Now + 1h

    return Promise.all([
      ps.createStream(acc[3], usdAmount, vspAddr, endTime, { from: acc[2] })
        .promise,
      ps.createStream(acc[4], usdAmount, vspAddr, endTime, { from: acc[3] })
        .promise
    ])
      .then(ops => ops.map(checkSuccess))
      .then(() => web3.eth.getBlockNumber())
      .then(fromBlock => ps.getStreams(acc[2], fromBlock - 10))
      .then(function (streams) {
        streams.outgoing.length.should.equal(1)
      })
      .then(() => web3.eth.getBlockNumber())
      .then(fromBlock => ps.getStreams(acc[3], fromBlock - 10))
      .then(function (streams) {
        streams.incoming.length.should.equal(1)
        streams.outgoing.length.should.equal(1)
      })
      .then(() => web3.eth.getBlockNumber())
      .then(fromBlock => ps.getStreams(acc[4], fromBlock - 10))
      .then(function (streams) {
        streams.incoming.length.should.equal(1)
      })
  })

  it('should claim tokens from a stream', function () {
    const alice = acc[0]
    const bob = acc[1]
    const ethAmount = '10000000000000000' // 0.01 ETH
    const usdAmount = '100000000000000000000' // 100 USD
    const endTime = Math.round(Date.now() / 1000) + 300 // Now + 5m

    return createErc20(web3, vspAddr, { from: alice })
      .swapEther(ethAmount)
      .then(checkSuccess)
      .then(
        () =>
          ps.createStream(bob, usdAmount, vspAddr, endTime, {
            from: alice
          }).promise
      )
      .then(checkSuccess)
      .then(
        pTap(() =>
          promisify(web3.currentProvider.sendAsync)({
            id: 'test',
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [30]
          })
        )
      )
      .then(({ result }) => ps.claim(result.id, { from: bob }).promise)
      .then(checkSuccess)
      .then(function ({ result }) {
        result.should.have
          .property('usdAmount')
          .that.is.a('string')
          .and.matches(/^\d+$/)
        Number.parseFloat(`${result.usdAmount}e-18`).should.be.within(9.5, 10.5)
        result.should.have
          .property('tokenAmount')
          .that.is.a('string')
          .and.matches(/^\d+$/)
      })
  })
})
