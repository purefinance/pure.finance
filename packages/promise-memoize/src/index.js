'use strict'

const debug = require('debug')('promise-memoize')

/**
 * Memoizes a promise-returning function.
 *
 * This function replaces p-memoize as that library does not properly handle
 * multiple calls in parallel.
 *
 * @param {Function} fn The function to memoize.
 * @param {object} [options] The options.
 * @param {Map} [options.cache] The storage. Must implement the `Map` interface.
 * @param {boolean} [options.lazy] If timeout counts after fn settles.
 * @param {number} [options.maxAge] The max time to hold a memoized call in ms.
 * @param {Function} [options.resolver] The key resolver function.
 * @returns {(...args: Array) => Promise} The memoized function.
 */
function pMemoize(fn, options = {}) {
  const {
    cache = new Map(),
    lazy = true,
    maxAge = Infinity,
    resolver = (args) => args[0]
  } = options

  return function (...args) {
    debug('Called')

    const key = resolver(args)

    if (cache.has(key)) {
      const cached = cache.get(key)

      if (cached.expires > Date.now()) {
        debug('Returning cached result')
        return cached.data
      }

      cache.delete(key)
    }

    debug('Calling fn')
    const data = Promise.resolve(fn(...args))
    const expires = lazy ? Infinity : Date.now() + maxAge
    cache.set(key, { data, expires })

    data
      .then(function () {
        debug('Got data')
        if (lazy && cache.has(key)) {
          cache.set(key, { data, expires: Date.now() + maxAge })
        }
      })
      .catch(function () {
        debug('Got a rejection')
        cache.delete(key)
      })

    debug('Returning result')
    return data
  }
}

module.exports = pMemoize
