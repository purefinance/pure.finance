'use strict'

const abi = require('erc-20-abi')

const tokenAddress = require('./token-address')
const uniswap = require('./uniswap')
const weth = require('./weth')

const defaults = { gasFactor: 1.5 }

const createErc20 = function (params) {
  const { from, gasFactor, gasPrice, token, web3 } = {
    ...defaults,
    ...params
  }

  const contract = new web3.eth.Contract(abi, token)

  const safeGas = (gas) => Math.ceil(gas * gasFactor)

  const estimateGasAndSend = (method, transactionOptions) =>
    Promise.resolve(
      transactionOptions.gas || method.estimateGas().then(safeGas)
    ).then((gas) => method.send({ gas, ...transactionOptions }))

  return {
    getInfo: () =>
      Promise.all([
        contract.methods.symbol().call(),
        contract.methods.name().call(),
        contract.methods.decimals().call(),
        contract.methods.totalSupply().call()
      ]).then(([symbol, name, decimals, totalSupply]) => ({
        address: contract.options.address,
        symbol,
        name,
        decimals,
        totalSupply
      })),

    balanceOf: (address) => contract.methods.balanceOf(address || from).call(),

    transfer: (to, value) =>
      estimateGasAndSend(contract.methods.transfer(to, value), {
        from: from,
        gasPrice
      }),

    approve: (to, value) =>
      estimateGasAndSend(contract.methods.approve(to, value), {
        from: from,
        gasPrice
      }),

    wrapEther: (value) =>
      estimateGasAndSend(weth.getContract(web3).methods.deposit(), {
        from: from,
        gasPrice,
        value
      }),

    swapEther: (value) =>
      estimateGasAndSend(
        uniswap
          .getRouterContract(web3)
          .methods.swapExactETHForTokens(
            1,
            [tokenAddress('WETH'), token],
            from,
            Math.round(Date.now() / 1000) + 60
          ),
        {
          from: from,
          gas: safeGas(100000),
          gasPrice,
          value: value.toString()
        }
      )
  }
}

createErc20.util = { tokenAddress }

module.exports = createErc20
