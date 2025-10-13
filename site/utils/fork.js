/* eslint strict:off,no-console:off */

'use strict'

require('dotenv').config({ path: '.env.fork.local' })

const ganache = require('ganache-core')
const { promisify } = require('util')
const Web3 = require('web3')

const port = process.env.PORT

/* eslint-disable camelcase */
const getServer = function () {
  // @ts-ignore ts(2351)
  const _web3 = new Web3(process.env.BASE_NODE_URL)
  return _web3.eth.getChainId().then(chainId =>
    // @ts-ignore ts(2339)
    ganache.server({
      _chainIdRpc: chainId,
      blockTime: 13,
      fork: process.env.BASE_NODE_URL,
      logger: console,
      mnemonic: process.env.MNEMONIC,
      verbose: false // Set to log RPC calls and responses
    })
  )
}
/* eslint-enable camelcase */

console.log('Initializing fork...')
// eslint-disable-next-line promise/catch-or-return
getServer()
  .then(function (server) {
    const provider = server.provider
    // @ts-ignore ts(2351)
    const web3 = new Web3(provider)

    const serverListenAsync = promisify(server.listen)

    return Promise.all([web3.eth.getChainId(), serverListenAsync(port)])
  })
  .then(function ([chainId]) {
    console.log("Provider's chain id is", chainId)
    console.log('RPC server listening in port', port)
  })
