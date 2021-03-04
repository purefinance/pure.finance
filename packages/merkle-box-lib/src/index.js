'use strict'

const abi = require('./abi.json')

const createMerkleBox = function (web3, address, options) {
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

  const newClaimsGroup = function (erc20, amount, root, unlock, memo, txOps) {
    return estimateGasAndSend(
      merkleBox.methods.newClaimsGroup(erc20, amount, root, unlock, memo),
      { from, ...txOps }
    )
  }

  const claim = function (claimGroupId, amount, proof, txOps) {
    return estimateGasAndSend(
      merkleBox.methods.claim(claimGroupId, from, amount, proof),
      { from, ...txOps }
    )
  }

  return {
    getHolding,
    isClaimable,
    newClaimsGroup,
    claim
  }
}

module.exports = createMerkleBox
