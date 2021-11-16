'use strict'

const { MerkleTree } = require('merkletreejs')
const utils = require('web3-utils')

const hexToBuffer = hex => Buffer.from(hex.substr(2), 'hex')
const bufferToHex = buffer => `0x${buffer.toString('hex')}`

const keccak256 = buffer => hexToBuffer(utils.keccak256(bufferToHex(buffer)))

const hashRecipient = ({ account, amount }) =>
  utils.soliditySha3({ t: 'address', v: account }, { t: 'uint256', v: amount })

const addMerkleProofs = tree =>
  function (recipient) {
    const proof = tree
      .getProof(hashRecipient(recipient))
      .map(({ data }) => bufferToHex(data))
    return { ...recipient, proof }
  }

const calcMerkleTree = function (recipients) {
  const leaves = recipients.map(hashRecipient).map(hexToBuffer)
  return new MerkleTree(leaves, keccak256, { sort: true })
}

const calcDataset = recipients =>
  recipients.map(addMerkleProofs(calcMerkleTree(recipients)))

module.exports = {
  bufferToHex,
  calcDataset,
  calcMerkleTree,
  hexToBuffer
}
