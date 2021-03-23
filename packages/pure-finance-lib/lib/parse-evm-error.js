'use strict'

const capitalize = require('./capitalize')

const tryParseEvmError = function (err) {
  const matches =
    err.message.match(/: revert (.*)"/) ||
    err.message.match(/"reason": "(.*)"/) ||
    err.message.match(/reverted: (.*)"/) ||
    err.message.match(/reverted: (.*)/)
  if (matches) {
    throw new Error(capitalize(matches[1]))
  }
  throw err
}

module.exports = tryParseEvmError
