'use strict'

require('dotenv').config()

// const Web3 = require('web3')

// const createSablier = require('..')

describe('Sablier', function () {
  this.timeout(0)

  before(function () {
    if (!process.env.E2E) {
      this.skip()
      return
    }
  })
})
