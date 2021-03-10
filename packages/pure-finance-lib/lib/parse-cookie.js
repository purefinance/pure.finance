'use strict'

const parseCookieString = function (str) {
  return str
    .split(';')
    .map((pair) => pair.split('='))
    .map(([key, value]) => ({ [key.trim()]: value.trim() }))
    .reduce((all, val) => ({ ...all, ...val }), {})
}

module.exports = parseCookieString
