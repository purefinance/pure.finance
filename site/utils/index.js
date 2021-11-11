import Big from 'big.js'

const bigToNumber = (number, roundDecimals, roundTo) =>
  roundDecimals >= 0
    ? Big(number).round(roundDecimals, roundTo).toNumber()
    : Big(number).toNumber()

export const bigToCrypto = number => bigToNumber(number, 4, 0)

export const fromUnit = (number, decimals = 18, outputDecimals) =>
  Big(`${Big(number).toFixed()}e-${decimals}`).toFixed(outputDecimals)

export const toUnit = (number, decimals = 18) =>
  Big(`${Big(number).toFixed()}e+${decimals}`).toFixed(0)

export const toFixed = (number, decimals) => Big(number).toFixed(decimals)

export const sweepDust = (input, balance, limit = 0.999) =>
  Big(input).div(balance).toNumber() > limit ? balance : input
