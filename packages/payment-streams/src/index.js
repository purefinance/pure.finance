'use strict'

const debug = require('debug')('payment-streams')
const pTap = require('p-tap').default
const erc20Abi = require('erc-20-abi')

const { findToken } = require('./token-list')
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
      instance.options.chainId = chainId
      return instance
    })

  // Gets the PaymentStreamFactory contract.
  // const getFactoryContract = () => psfPromise

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

  // Get all the data of a Stream contract.
  const getStreamData = ps =>
    Promise.all([
      ps.methods.claimable().call(),
      ps.methods.claimed().call(),
      ps.methods.fundingAddress().call(),
      ps.methods.paused().call(),
      ps.methods.payee().call(),
      ps.methods.payer().call(),
      ps.methods.secs().call(),
      ps.methods.startTime().call(),
      ps.methods.token().call(),
      ps.methods.usdAmount().call(),
      ps.methods.usdPerSec().call()
    ]).then(
      ([
        claimable,
        claimed,
        fundingAddress,
        paused,
        payee,
        payer,
        secs,
        startTime,
        token,
        usdAmount,
        usdPerSec
      ]) => ({
        claimable,
        claimed,
        fundingAddress,
        paused,
        payee,
        payer,
        secs,
        startTime,
        token,
        usdAmount,
        usdPerSec
      })
    )

  // Gets all the information of the given stream.
  const getStream = function (id) {
    debug('Getting stream %s information', id)
    return getStreamContract(id)
      .then(ps =>
        Promise.all([
          ps.options.address,
          ps.options.chainId,
          getStreamData(ps),
          psfPromise
        ])
      )
      .then(function ([address, chainId, stream, psf]) {
        const token = new web3.eth.Contract(erc20Abi, stream.token)
        return Promise.all([
          address,
          stream,
          findToken(stream.token, chainId),
          token.methods.allowance(stream.fundingAddress, address).call(),
          token.methods.balanceOf(stream.fundingAddress).call(),
          psf.methods.usdToTokenAmount(stream.token, stream.claimable).call(),
          psf.methods.usdToTokenAmount(stream.token, stream.claimed).call(),
          psf.methods.usdToTokenAmount(stream.token, stream.usdAmount).call()
        ])
      })
      .then(
        ([
          address,
          stream,
          token,
          tokenAllowance,
          tokenBalance,
          tokenClaimable,
          tokenClaimed,
          tokenUsdAmount
        ]) => ({
          id,
          address,
          ...stream,
          token,
          tokenAllowance,
          tokenBalance,
          tokenClaimable,
          tokenClaimed,
          tokenUsdAmount
        })
      )
      .then(
        pTap(function (stream) {
          debug('Got information of stream %s', id)
          debug('Stream %s: %j', id, stream)
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

      debug('USD claimed was %s', result.usdAmount)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Pause a stream.
  const pauseStream = function (id, transactionOptions) {
    debug('Pausing stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.pauseStream(),
        suffix: 'pause-stream',
        gas: 900000 // FIXME
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.StreamPaused.returnValues

      debug('Stream %s is paused', id)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Resume a stream.
  const resumeStream = function (id, transactionOptions) {
    debug('Resuming stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.unpauseStream(),
        suffix: 'unpause-stream',
        gas: 900000 // FIXME
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.StreamUnpaused.returnValues

      debug('Stream %s is running', id)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Update the funding address
  const updateFundingAddress = function (id, address, transactionOptions) {
    debug('Updating funding address of %s to %s', id, address)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.updateFundingAddress(address),
        suffix: 'update-funding-address',
        gas: 900000 // FIXME
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.FundingAddressUpdated.returnValues

      debug('Funding address of %s updated to %s', id, address)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Update the funding rate
  const updateFundingRate = function (
    id,
    usdAmound,
    endTime,
    transactionOptions
  ) {
    debug('Updating funding rate of %s to %s %s', usdAmound, endTime)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.updateFundingRate(usdAmound, endTime),
        suffix: 'update-funding-rate',
        gas: 900000 // FIXME
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.StreamUpdated.returnValues

      debug('Funding rate of %s was updated', id)

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
    // getFactoryContract,
    getStreams,
    getTokens,
    pauseStream,
    resumeStream,
    updateFundingAddress,
    updateFundingRate
  }
}

module.exports = createPaymentStreams
