'use-strict'

require('chai').should()
require('dotenv').config()

const { MerkleTree } = require('merkletreejs')
const createErc20 = require('erc-20-lib')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const createMerkleBox = require('..')

const checkTxSuccess = function (receipt) {
  receipt.should.have.property('status').that.is.true
  return receipt
}

describe('End-to-end', function () {
  const tokenAddress = createErc20.util.tokenAddress('WETH')

  let from
  let acc1, acc2
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

    // Create a web3 instance with two accounts
    const provider = new HDWalletProvider({
      addressIndex: 0,
      mnemonic: process.env.MNEMONIC,
      numberOfAddresses: 3,
      providerOrUrl: process.env.NODE_URL
    })
    from = Web3.utils.toChecksumAddress(provider.getAddress(0))
    acc1 = Web3.utils.toChecksumAddress(provider.getAddress(1))
    acc2 = Web3.utils.toChecksumAddress(provider.getAddress(2))
    web3 = new Web3(provider)
  })

  it('should create a claim group', function () {
    this.timeout(0)

    // Create a WETH helper
    const params = { from, gasFactor: 2 }
    const erc20 = createErc20(web3, tokenAddress, params)

    // Create a MerkleBox helper
    const merkleBoxAddress = createMerkleBox.addresses.mainnet
    merkleBox = createMerkleBox(web3, merkleBoxAddress, { from })

    const wrapEther = function () {
      const amount = '500000000000000000' // 0.5 ETH
      return erc20.wrapEther(amount)
    }

    const approveWeth = function () {
      const amount = '500000000000000000' // 0.5 ETH
      return erc20.approve(merkleBoxAddress, amount)
    }

    const hexToBuffer = (hex) => Buffer.from(hex.substr(2), 'hex')
    const bufferToHex = (buffer) => `0x${buffer.toString('hex')}`

    const hashRecipient = ({ account, amount }) =>
      Web3.utils.soliditySha3(
        { t: 'address', v: account },
        { t: 'uint256', v: amount }
      )

    const keccak256 = (buffer) =>
      hexToBuffer(Web3.utils.keccak256(bufferToHex(buffer)))

    const getMerkleTree = function (recipients) {
      const leaves = recipients.map(hashRecipient).map(hexToBuffer)
      return new MerkleTree(leaves, keccak256)
    }

    const addMerkleProofs = (tree) =>
      function (recipient) {
        const proof = tree
          .getProof(hashRecipient(recipient))
          .map(({ data }) => bufferToHex(data))
        return { ...recipient, proof }
      }

    const createClaimGroup = function () {
      const recipients = [
        { account: acc1, amount: '300000000000' }, // 0.0000003 WETH
        { account: acc2, amount: '500000000000' } //  0.0000005 WETH
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
      Web3.utils.checkAddressChecksum(info.erc20).should.be.true
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
