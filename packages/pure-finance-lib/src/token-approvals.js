'use strict'

const createErc20 = require('erc-20-lib')
const debug = require('debug')('purefi:token-approvals')

const tryParseEvmError = require('../lib/parse-evm-error')

const createTokenApprovals = function (web3, options) {
  const { from } = options

  debug('Creating Token Approvals for %s', from || 'read-only')

  const allowance = function (tokenAddress, owner, spender) {
    debug('Getting %s allowance of %s for %s', tokenAddress, owner, spender)
    const erc20 = createErc20(web3, tokenAddress)
    return erc20.allowance(owner, spender)
  }

  const approve = function (tokenAddress, spender, amount) {
    debug('Approving %s of %s for %s', amount, tokenAddress, spender)
    const erc20 = createErc20(web3, tokenAddress, { from })
    return erc20
      .allowance(from, spender)
      .then(function (currentAllowance) {
        if (amount === currentAllowance) {
          throw new Error('Allowance already set')
        }
        return erc20.approve(spender, amount)
      })
      .catch(tryParseEvmError)
  }

  const approveInfinite = function (tokenAddress, spender) {
    debug('Approving infinite...')
    return approve(tokenAddress, spender, (2n ** 256n - 1n).toString()) // 2 ^ 256 - 1
  }

  return {
    allowance,
    approve,
    approveInfinite
  }
}

module.exports = createTokenApprovals
