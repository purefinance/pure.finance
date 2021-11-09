'use strict'

const abi = require('erc-20-abi')
const debug = require('debug')('erc-20-lib')

const tokenAddress = require('./token-address')
const uniswap = require('./uniswap')
const weth = require('./weth')

const createErc20 = function (web3, address, options = {}) {
  const { from, gasFactor = 2, gasPrice } = options

  debug('Creating %s ERC-20 helper library for %s', address, from || '(none)')

  const contract = new web3.eth.Contract(abi, address)

  const safeGas = gas => Math.ceil(gas * gasFactor)

  const estimateGasAndSend = (method, transactionOptions) =>
    Promise.resolve(
      transactionOptions.gas ||
        method.estimateGas(transactionOptions).then(safeGas)
    ).then(gas => method.send({ ...transactionOptions, gas }))

  const approve = (spender, value) =>
    estimateGasAndSend(contract.methods.approve(spender, value), {
      from,
      gasPrice
    })

  const totalSupply = () => contract.methods.totalSupply().call()

  return {
    getInfo: () =>
      Promise.all([
        contract.methods.symbol().call(),
        contract.methods.name().call(),
        contract.methods.decimals().call(),
        totalSupply()
      ]).then(([symbol, name, decimals, totalSupply]) => ({
        address: contract.options.address,
        symbol,
        name,
        decimals,
        totalSupply
      })),

    balanceOf: address => contract.methods.balanceOf(address || from).call(),

    allowance: (owner, spender) =>
      contract.methods.allowance(owner, spender).call(),

    transfer: (to, value) =>
      estimateGasAndSend(contract.methods.transfer(to, value), {
        from,
        gasPrice
      }),

    approve(spender, value) {
      debug('Approving %s %s to %s', value, address, spender)
      return approve(spender, value)
    },

    revoke(spender) {
      debug('Revoking allowance for %s to %s', address, spender)
      return approve(spender, '0')
    },

    symbol: () => contract.methods.symbol().call(),

    decimals: () => contract.methods.decimals().call(),

    totalSupply,

    wrapEther: value =>
      estimateGasAndSend(weth.getContract(web3).methods.deposit(), {
        from,
        gasPrice,
        value
      }),

    unwrapEther: value =>
      estimateGasAndSend(weth.getContract(web3).methods.withdraw(value), {
        from,
        gasPrice
      }),

    wrappedEtherBalanceOf: address =>
      weth
        .getContract(web3)
        .methods.balanceOf(address || from)
        .call(),

    swapEther: value =>
      estimateGasAndSend(
        uniswap
          .getRouterContract(web3)
          .methods.swapExactETHForTokens(
            '1',
            [tokenAddress('WETH'), address],
            from,
            Math.round(Date.now() / 1000) + 60
          ),
        {
          from,
          gas: safeGas(100000),
          gasPrice,
          value: value.toString()
        }
      )
  }
}

createErc20.util = { tokenAddress }

module.exports = createErc20
