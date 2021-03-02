'use-strict'

require('chai').should()
require('dotenv').config()

const lib = require('..')

describe('End-to-end', function () {
  it('should pass the test', function () {
    lib.should.exist
  })
})
