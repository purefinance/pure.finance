'use strict'

const Big = require('big.js').default

const watchAsset = require('./wallet-watch-asset')

const fromUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e-${decimals}`).toFixed()

const toUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e+${decimals}`).toFixed(0)

const toFixed = (number, decimals) => Big(number).toFixed(decimals)

module.exports = {
  fromUnit,
  toUnit,
  toFixed,
  watchAsset
}
