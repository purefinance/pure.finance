'use-strict'

require('chai').should()
require('dotenv').config()

const { MerkleTree } = require('merkletreejs')
const createErc20 = require('erc-20-lib')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const createMerkleBox = require('..')

describe('End-to-end', function () {
  before(function () {
    this.timeout(0)

    if (!process.env.E2E) {
      this.skip()
      return
    }

    // Create a web3 instance with two accounts
    const provider = new HDWalletProvider({
      addressIndex: 0,
      mnemonic: process.env.MNEMONIC,
      numberOfAddresses: 2,
      providerOrUrl: process.env.NODE_URL
    })
    const acc0 = Web3.utils.toChecksumAddress(provider.getAddress(0))
    const acc1 = Web3.utils.toChecksumAddress(provider.getAddress(1))
    const web3 = new Web3(provider)

    // Create a WETH helper
    const tokenAddress = createErc20.util.tokenAddress('WETH')
    const params = { from: acc0, gasFactor: 2, token: tokenAddress, web3 }
    const erc20 = createErc20(params)

    // Create a MerkleBox helper
    const merkleBoxAddress = createMerkleBox.addresses.mainnet
    const merkleBox = createMerkleBox(web3, merkleBoxAddress, { from: acc0 })

    const checkTxSuccess = function (receipt) {
      receipt.status.should.be.true
      return receipt
    }

    const wrapEther = function () {
      const amount = '200000000000000000' // 0.2 ETH
      return erc20.wrapEther(amount)
    }

    const approveWeth = function () {
      const amount = '200000000000000000' // 0.2 ETH
      return erc20.approve(merkleBoxAddress, amount)
    }

    const hexToBuffer = (hex) => Buffer.from(hex.substr(2), 'hex')
    const bufferToHex = (buffer) => `0x${buffer.toString('hex')}`

    const hashRecipient = ({ account, amount }) =>
      web3.utils.soliditySha3(
        { t: 'address', v: account },
        { t: 'uint256', v: amount }
      )

    const getRoot = function () {
      const amount = '100000000000000000' // 0.1 WETH
      const recipients = [
        { account: acc0, amount },
        { account: acc1, amount }
      ]
      const leaves = recipients.map(hashRecipient).map(hexToBuffer)
      const keccak256 = (str) => hexToBuffer(web3.utils.keccak256(str))
      return bufferToHex(new MerkleTree(leaves, keccak256).getRoot())
    }

    const createClaimGroup = function () {
      const amount = '200000000000000000' // 0.2 WETH
      const unlock = Math.floor(Date.now() / 1000) + 2678400 // now + 31d
      // TODO Add memo param
      // const memo = 'datasetUri=http://localhost:3001/merkle-claims/groups/test.json'
      return merkleBox.newClaimsGroup(tokenAddress, amount, getRoot(), unlock)
    }

    const getClaimGroupId = function (receipt) {
      const { claimGroupId } = receipt.events.NewMerkle.returnValues
      claimGroupId.should.be.a('string').that.match(/^[0-9]+$/)
    }

    return wrapEther()
      .then(checkTxSuccess)
      .then(approveWeth)
      .then(checkTxSuccess)
      .then(createClaimGroup)
      .then(checkTxSuccess)
      .then(getClaimGroupId)
  })

  it('should get info about a claim group')

  it('should check if a grant is claimable')

  it('should claim a grant')
})
