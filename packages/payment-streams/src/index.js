'use strict'

const Big = require('big.js').default
const createErc20 = require('erc-20-lib')
const debug = require('debug')('payment-streams')
const erc20Abi = require('erc-20-abi')
const pTap = require('p-tap').default

const { findToken } = require('./token-list')
const contracts = require('./contracts.json')
const createExecutor = require('eth-exec-txs')
const paymentStreamAbi = require('./abis/PaymentStream.json')
const paymentStreamFactoryAbi = require('./abis/PaymentStreamFactory.json')

const fromUnit = (number, decimals = 18) =>
  new Big(`${number}e-${decimals}`).toFixed()

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
        c => c.chainId === chainId
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

  // Gets an PaymentStream contract instance.
  const getStreamContract = function (id, defaultBlock) {
    debug('Getting stream %s', id)
    return psfPromise
      .then(psf => psf.methods.getStream(id).call({}, defaultBlock))
      .then(function (address) {
        debug('Stream %s address is %s', id, address)
        return new web3.eth.Contract(paymentStreamAbi, address)
      })
  }

  // Get all the data of a Stream contract.
  const getStreamData = (ps, defaultBlock) =>
    Promise.all([
      ps.methods.claimable().call({}, defaultBlock),
      ps.methods.claimed().call({}, defaultBlock),
      ps.methods.fundingAddress().call({}, defaultBlock),
      ps.methods.paused().call({}, defaultBlock),
      ps.methods.payee().call({}, defaultBlock),
      ps.methods.payer().call({}, defaultBlock),
      ps.methods.secs().call({}, defaultBlock),
      ps.methods.startTime().call({}, defaultBlock),
      ps.methods.token().call({}, defaultBlock),
      ps.methods.usdAmount().call({}, defaultBlock),
      ps.methods.usdPerSec().call({}, defaultBlock)
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
  const getStream = function (id, defaultBlock) {
    debug('Getting stream %s information', id)
    return getStreamContract(id)
      .then(ps =>
        Promise.all([
          ps.options.address,
          ps.options.chainId,
          getStreamData(ps, defaultBlock),
          psfPromise
        ])
      )
      .then(function ([address, chainId, stream, psf]) {
        const token = new web3.eth.Contract(erc20Abi, stream.token)
        return Promise.all([
          address,
          stream,
          findToken(stream.token, chainId),
          token.methods
            .allowance(stream.fundingAddress, address)
            .call({}, defaultBlock),
          token.methods.balanceOf(stream.fundingAddress).call({}, defaultBlock),
          psf.methods
            .usdToTokenAmount(stream.token, stream.claimable)
            .call({}, defaultBlock),
          psf.methods
            .usdToTokenAmount(stream.token, stream.claimed)
            .call({}, defaultBlock),
          psf.methods
            .usdToTokenAmount(stream.token, stream.usdAmount)
            .call({}, defaultBlock),
          psf.methods
            .usdToTokenAmount(stream.token, stream.usdPerSec)
            .call({}, defaultBlock)
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
          tokenUsdAmount,
          tokenPerSec
        ]) => ({
          id,
          address,
          ...stream,
          token,
          tokenAllowance,
          tokenBalance,
          tokenClaimable,
          tokenClaimed,
          tokenUsdAmount,
          tokenPerSec
        })
      )
      .then(
        pTap(function (stream) {
          // @ts-ignore ts(2339)
          debug('Got information of stream %s at %s', id, stream.address)
        })
      )
  }

  // Helper to split the eth_getLogs calls into chunks and prevent timeouts if
  // the node takes too long to respond.
  const getPastEventsInChunks = function (contract, event, pastEventOptions) {
    const {
      fromBlock = contract.options.birthblock,
      toBlock: _toBlock,
      ...restOfPastEventOptions
    } = pastEventOptions

    return Promise.resolve(_toBlock || web3.eth.getBlockNumber()).then(
      function (toBlock) {
        debug('Getting past %s events in chunks', event)

        // Create an array containing all the chunk's from and to blocks along
        // with the rest of the filter options.
        const chunkSize = 5760 // 1 day of blocks
        const chunksCount = Math.floor((toBlock - fromBlock) / chunkSize) + 1
        const chunks = new Array(chunksCount).fill().map(function (_, i) {
          const _fromBlock = fromBlock + chunkSize * i
          return {
            ...restOfPastEventOptions,
            fromBlock: _fromBlock,
            toBlock: Math.min(toBlock, _fromBlock + chunkSize - 1)
          }
        })

        // Then iterate over the chunks sending one logs query at a time to
        // allow the nodes to handle even large queries in time.
        return chunks.reduce(
          (promiseChain, chunk) =>
            promiseChain.then(function (events) {
              debug(
                'Getting chunk from %s to %s',
                chunk.fromBlock,
                chunk.toBlock
              )
              return contract
                .getPastEvents(event, chunk)
                .then(
                  pTap(function (/** @type {Array} */ newEvents) {
                    debug('Got %s events', newEvents.length)
                  })
                )
                .then(newEvents => events.concat(newEvents))
            }),
          Promise.resolve([])
        )
      }
    )
  }

  // Gets all incoming streams by getting past StreamCreated events where the
  // payee is the given address.
  const getIncomingStreams = function (address, fromBlock) {
    debug('Getting all incoming streams of %s', address)
    return psfPromise
      .then(psf =>
        getPastEventsInChunks(psf, 'StreamCreated', {
          fromBlock: fromBlock || psf.options.birthblock,
          filter: { payee: address }
        })
      )
      .then(events =>
        Promise.all(
          events
            .filter(e => !e.removed)
            .map(e => e.returnValues.id)
            .map(id => getStream(id))
        )
      )
      .then(
        pTap(function (streams) {
          // @ts-ignore ts(2339)
          debug('Got %s incoming streams', streams.length)
        })
      )
  }

  // Gets all outgoing streams by getting past StreamCreated events where the
  // payer is the given address.
  const getOutgoingStreams = function (address, fromBlock) {
    debug('Getting all outgoing streams of %s', address)
    return psfPromise
      .then(psf =>
        getPastEventsInChunks(psf, 'StreamCreated', {
          fromBlock: fromBlock || psf.options.birthblock,
          filter: { payer: address }
        })
      )
      .then(events =>
        Promise.all(
          events
            .filter(e => !e.removed)
            .map(e => e.returnValues.id)
            .map(id => getStream(id))
        )
      )
      .then(
        pTap(function (streams) {
          // @ts-ignore ts(2339)
          debug('Got %s outgoing streams', streams.length)
        })
      )
  }

  // Gets all the streams related to the given address: incoming and outgoing.
  const getStreams = function (address, fromBlock) {
    debug('Getting all streams of %s', address)
    return Promise.all([
      getIncomingStreams(address, fromBlock),
      getOutgoingStreams(address, fromBlock)
    ]).then(([incoming, outgoing]) => ({ incoming, outgoing }))
  }

  // Creates a stream.
  // eslint-disable-next-line max-params
  const createStream = function (
    payee,
    usdAmount,
    token,
    endTime,
    transactionOptions = {}
  ) {
    const _from = transactionOptions.from || from

    debug('Creating stream from %s to %s', _from, payee)

    const transactionsPromise = psfPromise
      .then(psf =>
        Promise.all([
          psf,
          psf.methods.usdToTokenAmount(token, usdAmount).call(),
          createErc20(web3, token).getInfo()
        ])
      )
      .then(function ([psf, tokenAmount, { decimals, symbol }]) {
        debug(
          'Stream token amount is %s %s',
          fromUnit(tokenAmount, decimals),
          symbol
        )

        // Prepare a spied contract method to call createStream and capture the
        // id of the stream. Then use the id to then get the stream address.
        // Finally, store this address promise in a variable so it can later be
        // used to dynamically generate the next approval transaction.
        let streamAddressPromise
        const createStreamMethod = psf.methods.createStream(
          payee,
          usdAmount,
          token,
          _from,
          endTime
        )
        const spiedCreateContractMethod = {
          estimateGas: createStreamMethod.estimateGas,
          send(...args) {
            const promiEvent = createStreamMethod.send(...args)
            streamAddressPromise = promiEvent.then(
              receipt => receipt.events.StreamCreated.returnValues.stream
            )
            return promiEvent
          }
        }

        // The stream address is needed to set spender in the approval call but
        // it can only be known after the stream is created. Therefore, a
        // contract call that can get the stream address from the promise
        // obtained in the previous transaction is required.
        // When executing the gas estimation, the stream address promise is
        // resolved and the address stored to allow the send() call to be
        // executed synchronously (and don't break the PromiEvent interface).
        let streamAddress
        const tokenContract = new web3.eth.Contract(erc20Abi, token)
        const approveMethodBuilder = address =>
          tokenContract.methods.approve(address, tokenAmount)
        const dynamicApproveMethod = {
          estimateGas: (...args) =>
            streamAddressPromise.then(function (address) {
              streamAddress = address
              return approveMethodBuilder(streamAddress).estimateGas(...args)
            }),
          send: (...args) => approveMethodBuilder(streamAddress).send(...args)
        }

        return [
          {
            method: spiedCreateContractMethod,
            suffix: 'create-stream',
            gas: 170000
          },
          {
            method: dynamicApproveMethod,
            suffix: 'approve',
            gas: 45000
          }
        ]
      })

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.StreamCreated.returnValues

      debug('Stream %s created at %s', result.id, result.stream)

      return { result }
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Claims tokens available in a streams.
  const claim = function (id, transactionOptions) {
    debug('Claiming tokens from stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.claim(),
        suffix: 'claim',
        gas: 200000
      }
    ])

    const parseResults = function ([{ receipt }]) {
      const result = receipt.events.Claimed.returnValues

      return getStreamContract(id)
        .then(ps => ps.methods.token().call())
        .then(address => createErc20(web3, address).getInfo())
        .then(function ({ address, decimals, symbol }) {
          debug(
            'Tokens claimed were %s %s',
            fromUnit(result.tokenAmount, decimals),
            symbol
          )
          debug('That was equivalent to %s USD', fromUnit(result.usdAmount))

          return { result: { token: address, ...result } }
        })
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Pauses a stream.
  const pauseStream = function (id, transactionOptions) {
    debug('Pausing stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.pauseStream(),
        suffix: 'pause-stream',
        gas: 48000
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

  // Resumes a stream.
  const resumeStream = function (id, transactionOptions) {
    debug('Resuming stream %s', id)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.unpauseStream(),
        suffix: 'unpause-stream',
        gas: 25000
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

  // Updates the funding address.
  const updateFundingAddress = function (id, address, transactionOptions) {
    debug('Updating funding address of %s to %s', id, address)

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.updateFundingAddress(address),
        suffix: 'update-funding-address',
        gas: 220000
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

  // Updates the funding rate.
  const updateFundingRate = function (
    id,
    usdAmount,
    endTime,
    transactionOptions
  ) {
    debug(
      'Updating funding rate of %s to %s USD/sec ending at %s',
      id,
      fromUnit(usdAmount),
      new Date(endTime * 1000).toISOString()
    )

    const transactionsPromise = getStreamContract(id).then(ps => [
      {
        method: ps.methods.updateFundingRate(usdAmount, endTime),
        suffix: 'update-funding-rate',
        gas: 31000
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
    claim,
    createStream,
    getStream,
    getStreams,
    pauseStream,
    resumeStream,
    updateFundingAddress,
    updateFundingRate
  }
}

module.exports = createPaymentStreams
