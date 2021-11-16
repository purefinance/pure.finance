'use strict'

require('chai').should()
require('dotenv').config()

const { MerkleTree } = require('merkletreejs')
const { promisify } = require('util')
const createErc20 = require('erc-20-lib')
const ganache = require('ganache-core')
const Web3 = require('web3')

const createMerkleBox = require('..')

const checkTxSuccess = function (receipt) {
  receipt.should.have.property('status').that.is.true
  return receipt
}

describe('End-to-end', function () {
  this.timeout(60000) // 1m

  const tokenAddress = createErc20.util.tokenAddress('WETH')

  let acc
  let web3
  let merkleBox
  let claimGroupId
  let balance
  let dataset

  before(function () {
    if (!process.env.E2E) {
      this.skip()
      return
    }

    let provider

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

    const setWeb3 = function () {
      // @ts-ignore ts(2339)
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

    return setProvider().then(setWeb3).then(setTestAccounts)
  })

  it('should create a claim group', function () {
    // Create a WETH helper
    const params = { from: acc[0], gasFactor: 2 }
    const erc20 = createErc20(web3, tokenAddress, params)

    // Create a MerkleBox helper
    const merkleBoxAddress = createMerkleBox.addresses.mainnet
    merkleBox = createMerkleBox(web3, merkleBoxAddress, { from: acc[0] })

    const wrapEther = function () {
      const amount = '500000000000000000' // 0.5 ETH
      return erc20.wrapEther(amount)
    }

    const approveWeth = function () {
      const amount = '500000000000000000' // 0.5 ETH
      return erc20.approve(merkleBoxAddress, amount)
    }

    const hexToBuffer = hex => Buffer.from(hex.substr(2), 'hex')
    const bufferToHex = buffer => `0x${buffer.toString('hex')}`

    const hashRecipient = ({ account, amount }) =>
      web3.utils.soliditySha3(
        { t: 'address', v: account },
        { t: 'uint256', v: amount }
      )

    const keccak256 = buffer =>
      hexToBuffer(web3.utils.keccak256(bufferToHex(buffer)))

    const getMerkleTree = function (recipients) {
      const leaves = recipients.map(hashRecipient).map(hexToBuffer)
      return new MerkleTree(leaves, keccak256)
    }

    const addMerkleProofs = tree =>
      function (recipient) {
        const proof = tree
          .getProof(hashRecipient(recipient))
          .map(({ data }) => bufferToHex(data))
        return { ...recipient, proof }
      }

    const createClaimGroup = function () {
      const recipients = [
        { account: acc[1], amount: '300000000000' }, // 0.0000003 WETH
        { account: acc[2], amount: '500000000000' } //  0.0000005 WETH
      ]
      const total = recipients
        .reduce((sum, recipient) => sum + BigInt(recipient.amount), BigInt(0))
        .toString()
      const merkleTree = getMerkleTree(recipients)
      const root = bufferToHex(merkleTree.getRoot())
      dataset = recipients.map(addMerkleProofs(merkleTree))
      console.log('Test dataset:', JSON.stringify(dataset))
      const unlock = Math.floor(Date.now() / 1000) + 2678400 // now + 31d
      const memo = 'datasetUri=http://localhost:3000/test.json'
      console.log('Test dataset URL:', memo)
      return merkleBox.newClaimsGroup(tokenAddress, total, root, unlock, memo)
    }

    const checkClaimGroupId = function (receipt) {
      receipt.should.have.nested
        .property('events.NewMerkle.returnValues.claimGroupId')
        .that.matches(/^[0-9]+$/)
      claimGroupId = receipt.events.NewMerkle.returnValues.claimGroupId
      balance = receipt.events.NewMerkle.returnValues.amount
      console.log('Test claim group ID:', claimGroupId)
    }

    return wrapEther()
      .then(checkTxSuccess)
      .then(approveWeth)
      .then(checkTxSuccess)
      .then(createClaimGroup)
      .then(checkTxSuccess)
      .then(checkClaimGroupId)
  })

  it('should get info about a claim group', function () {
    // Ensure the create claim group test was executed
    claimGroupId.should.exist

    return merkleBox.getHolding(claimGroupId).then(function (info) {
      info.should.have.property('erc20')
      web3.utils.checkAddressChecksum(info.erc20).should.be.true
      info.should.have.property('balance')
      info.balance.should.equal(balance)
    })
  })

  it('should check if a grant is claimable', function () {
    // Ensure the create claim group test was executed
    claimGroupId.should.exist

    const { account, amount, proof } = dataset[0]
    return merkleBox
      .isClaimable(claimGroupId, account, amount, proof)
      .then(function (claimable) {
        claimable.should.be.true
      })
  })

  it('should claim a grant', function () {
    // Ensure the create claim group test was executed
    claimGroupId.should.exist

    const { account, amount, proof } = dataset[1]
    return merkleBox
      .claim(claimGroupId, account, amount, proof)
      .then(checkTxSuccess)
      .then(function (receipt) {
        receipt.should.have.nested
          .property('events.MerkleClaim.returnValues.account')
          .that.equals(account)
        receipt.should.have.nested
          .property('events.MerkleClaim.returnValues.erc20')
          .that.equals(tokenAddress)
        receipt.should.have.nested
          .property('events.MerkleClaim.returnValues.amount')
          .that.equals(amount)
      })
  })
})
