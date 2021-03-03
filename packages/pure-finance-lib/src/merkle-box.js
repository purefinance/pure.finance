'use strict'

const abi = require('./abis/merkle-box.json')

const getMerkleBox = function (web3, address, options) {
  const { from, gasFactor } = options

  const merkleBox = new web3.eth.Contract(abi, address)

  const safeGas = (gas) => Math.ceil(gas * gasFactor)

  const estimateGasAndSend = (method, transactionOptions) =>
    Promise.resolve(
      transactionOptions.gas || method.estimateGas().then(safeGas)
    ).then((gas) => method.send({ gas, ...transactionOptions }))

  const getHolding = function (claimGroupId) {
    return merkleBox.methods.holdings(claimGroupId).call()
  }

  const isClaimable = function (claimGroupId, amount, proof) {
    return merkleBox.methods
      .isClaimable(claimGroupId, from, amount, proof)
      .call()
  }

  const claim = function (claimGroupId, amount, proof, transactionOptions) {
    return estimateGasAndSend(
      merkleBox.methods.claim(claimGroupId, from, amount, proof),
      { from, ...transactionOptions }
    )
  }

  return {
    getHolding,
    isClaimable,
    claim,
  }
}

module.exports = getMerkleBox
