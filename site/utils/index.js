const Big = require('big.js').default

export const fromUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e-${decimals}`).toFixed()

export const toUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e+${decimals}`).toFixed(0)

export const toFixed = (number, decimals) => Big(number).toFixed(decimals)
