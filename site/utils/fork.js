'use strict'

require('dotenv').config({ path: '.env.fork.local' })

const { promisify } = require('util')
const createPaymentStreams = require('pf-payment-streams')
const ganache = require('ganache-core')
const Web3 = require('web3')

const port = process.env.PORT

// Data needed to unlock the deployer/owner and add streaming tokens.
const paymentStreamAddress = '0x49599EB7E3b4A69B802333c773692240204f3755'
const paymentStreamBirthblock = 12877534
const paymentStreamDeployer = '0xC2a8814258F0bb54F9CC1Ec6ACb7a6886097b994'

const getServer = function () {
  // @ts-ignore ts(2351)
  const _web3 = new Web3(process.env.BASE_NODE_URL)
  return _web3.eth.getChainId().then(function (chainId) {
    /* eslint-disable camelcase */
    // @ts-ignore ts(2339)
    return ganache.server({
      _chainIdRpc: chainId,
      blockTime: 13,
      fork: process.env.BASE_NODE_URL,
      fork_block_number: paymentStreamBirthblock + 21,
      logger: console,
      mnemonic: process.env.MNEMONIC,
      unlocked_accounts: [paymentStreamDeployer],
      verbose: false // Set to log RPC calls and responses
    })
    /* eslint-enable camelcase */
  })
}

const transferOwnership = function (provider, ps) {
  const listAccountsAsync = promisify(
    provider.manager.personal_listAccounts.bind(provider.manager)
  )
  return Promise.all([ps.getContract(), listAccountsAsync()])
    .then(function ([contract, acc]) {
      if (contract.options.address !== paymentStreamAddress) {
        throw new Error('Outdated PaymentStream address')
      }
      return contract.methods
        .transferOwnership(acc[0])
        .send({ from: paymentStreamDeployer })
    })
    .then(
      (receipt) => receipt.events.OwnershipTransferred.returnValues.newOwner
    )
}

console.log('Initializing fork...')
// eslint-disable-next-line promise/catch-or-return
getServer()
  .then(function (server) {
    const provider = server.provider
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider)
    const ps = createPaymentStreams(web3)

    const serverListenAsync = promisify(server.listen)

    return Promise.all([
      web3.eth.getChainId(),
      transferOwnership(provider, ps),
      serverListenAsync(port)
    ])
  })
  .then(function ([chainId, owner]) {
    console.log("Provider's chain id is", chainId)
    console.log('Fork started at block', paymentStreamBirthblock)
    console.log("PaymentStreams' ownership transferred to", owner)
    console.log('RPC server listening in port', port)
  })
