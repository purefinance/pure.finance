'use strict'

const debug = require('debug')('payment-streams')
const pTap = require('p-tap').default

const contracts = require('./contracts.json')
const createExecutor = require('eth-exec-txs')
const paymentStreamAbi = require('./abis/PaymentStream.json')
const paymentStreamFactoryAbi = require('./abis/PaymentStreamFactory.json')

const createPaymentStreams = function (web3, options = {}) {
  debug('Creating Payment Streams library')

  const { from, gasFactor = 2 } = options
  const execTransactions = createExecutor({
    from,
    overestimation: gasFactor,
    web3
  })

  const psfPromise = web3.eth
    .getChainId()
    // .then((chainId) => (chainId === 1337 ? 1 : chainId)) // Ganache hack
    .then(function (chainId) {
      const contract = contracts.PaymentStreamFactory.find(
        c => (c.chainId = chainId)
      )
      if (!contract) {
        throw new Error(`PaymentStreams not available in chain ${chainId}`)
      }
      const instance = new web3.eth.Contract(
        paymentStreamFactoryAbi,
        contract.address
      )
      instance.options.birthblock = contract.birthblock
      return instance
    })

  // Gets the PaymentStreamFactory contract.
  const getFactoryContract = () => psfPromise

  // Gets all the supported tokens.
  const getTokens = function () {
    debug('Getting the supported tokens')
    return psfPromise
      .then(psf =>
        psf.getPastEvents('TokenAdded', {
          fromBlock: psf.options.birthblock
        })
      )
      .then(events => events.map(e => e.returnValues.tokenAddress))
      .then(
        pTap(function (tokens) {
          // @ts-ignore ts(2339)
          debug('Got %s supported tokens', tokens.length)
        })
      )
  }

  // Gets all the information of the given stream.
  const getStream = function (id) {
    debug('Getting stream %s', id)
    return psfPromise
      .then(psf => psf.methods.getStream(id).call())
      .then(stream => ({ id, ...stream }))
      .then(
        pTap(function () {
          debug('Got stream %s', id)
        })
      )
  }

  // Gets all incoming streams by getting past StreamCreated events where the
  // payee is the given address.
  const getIncomingStreams = function (address) {
    debug('Getting all incoming streams of %s', address)
    return (
      psfPromise
        .then(psf =>
          psf.getPastEvents('StreamCreated', {
            fromBlock: psf.options.birthblock,
            filter: { payee: address }
          })
        )
        // TODO Need to filter the events here until
        // bloqpriv/pf-payment-stream#13 is solved
        .then(events => events.filter(e => e.returnValues.payee === address))
        .then(events =>
          Promise.all(events.map(e => e.returnValues.id).map(getStream))
        )
        .then(
          pTap(function (streams) {
            // @ts-ignore ts(2339)
            debug('Got %s incoming streams', streams.length)
          })
        )
    )
  }

  // Gets all outgoing streams by getting past StreamCreated events where the
  // payer is the given address.
  const getOutgoingStreams = function (address) {
    debug('Getting all outgoing streams of %s', address)
    return psfPromise
      .then(psf =>
        psf.getPastEvents('StreamCreated', {
          fromBlock: psf.options.birthblock,
          filter: { payer: address }
        })
      )
      .then(events =>
        Promise.all(events.map(e => e.returnValues.id).map(getStream))
      )
      .then(
        pTap(function (streams) {
          // @ts-ignore ts(2339)
          debug('Got %s outgoing streams', streams.length)
        })
      )
  }

  // Gets all the streams related to the given address: incoming and outgoing.
  const getStreams = function (address) {
    debug('Getting all streams of %s', address)
    return Promise.all([
      getIncomingStreams(address),
      getOutgoingStreams(address)
    ]).then(([incoming, outgoing]) => ({ incoming, outgoing }))
  }

  // Gets an PaymentStream contract instance
  const getStreamContract = function (id) {
    debug('Getting stream %s', id)
    return psfPromise
      .then(pfs => pfs.methods.getStream(id).call())
      .then(function (address) {
        debug('Stream %s address is %s', id, address)
        return new web3.eth.Contract(paymentStreamAbi, address)
      })
  }

  // Adds a token so it can be used in streams.
  const addToken = function (token, dex, path, transactionOptions) {
    debug('Adding %s to valid tokens list', token)

    const transactionsPromise = psfPromise.then(psf => [
      {
        method: psf.methods.addToken(token, dex, path),
        suffix: 'add-token',
        gas: 900000
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.TokenAdded.returnValues

      debug('Token %s added', result.tokenAddress)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Creates a stream.
  // eslint-disable-next-line max-params
  const createStream = function (
    payee,
    usdAmount,
    token,
    endTime,
    transactionOptions
  ) {
    const _from = transactionOptions.from || from

    debug('Creating stream from %s to %s', _from, payee)

    const transactionsPromise = psfPromise.then(psf => [
      {
        method: psf.methods.createStream(
          payee,
          usdAmount,
          token,
          _from,
          endTime
        ),
        suffix: 'create-stream',
        gas: 300000
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.StreamCreated.returnValues

      debug('Stream %s created', result.id)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Claim tokens available in a streams.
  const claim = function (id, transactionOptions) {
    debug('Claiming tokens from stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.claim(),
        suffix: 'claim',
        gas: 900000 // FIXME
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.Claimed.returnValues

      debug('Token claimed', result.tokenAddress)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  return {
    addToken,
    claim,
    createStream,
    getFactoryContract,
    getStreams,
    getTokens
  }
}

module.exports = createPaymentStreams
