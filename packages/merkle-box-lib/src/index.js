'use strict'

const abi = require('./abi.json')
const addresses = require('./addresses')

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

  // TODO Add memo param
  const newClaimsGroup = function (erc20, amount, root, unlock, txOps) {
    return estimateGasAndSend(
      merkleBox.methods.newClaimsGroup(erc20, amount, root, unlock),
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

createMerkleBox.addresses = addresses

module.exports = createMerkleBox
