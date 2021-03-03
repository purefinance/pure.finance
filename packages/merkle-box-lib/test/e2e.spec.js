'use-strict'

require('chai').should()
require('dotenv').config()

const createErc20 = require('erc-20-cli')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

const lib = require('..')

console.log('***', process.env.MNEMONIC, process.env.NODE_URL)

describe('End-to-end', function () {
  let from, to
  let web3

  before(function () {
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
    from = Web3.utils.toChecksumAddress(provider.getAddress(0))
    to = Web3.utils.toChecksumAddress(provider.getAddress(1))
    web3 = new Web3(provider)

    console.log(from, to)

    // Swap ETH for USDC
    const token = createErc20.util.tokenAddress('USDC')
    const params = { from, token, web3 }
    const erc20 = createErc20(params)
    erc20.swapEther('1000000000000000000')

    // create a claim group
    // fund the group
  })

  it('should get info about a claim group')

  it('should check if a grant is claimable')

  it('should claim a grant')
})
