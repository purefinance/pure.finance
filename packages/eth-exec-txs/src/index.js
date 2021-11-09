'use strict'

const { EventEmitter } = require('events')
const Big = require('big.js').default
const debug = require('debug')('eth-exec-txs')
const pSeries = require('p-series')
const pTap = require('p-tap').default

const fromUnit = (number, decimals = 18) =>
  new Big(`${number}e-${decimals}`).toFixed()

const calculateFee = ({ transaction, receipt }) =>
  new Big(transaction.gasPrice).times(receipt.gasUsed).toFixed()

const calculateTotalFee = transactionsData =>
  transactionsData
    .map(calculateFee)
    .reduce((total, fee) => new Big(total).plus(fee), new Big(0))
    .toFixed()

const createEstimateGasAndSend = (web3, emitter, overestimation = 1.25) =>
  function (method, transactionOptions, suffix) {
    const suffixed = event => `${event}${suffix ? `-${suffix}` : ''}`

    let hash
    let transactionPromise

    const estimateGas = function () {
      debug('Estimating gas')

      const estimationPromise = method
        .estimateGas(transactionOptions)
        .then(
          pTap(function (gas) {
            debug('Gas needed is %d (x%s)', gas, overestimation.toFixed(2))
          })
        )
        .then(gas => Math.ceil(gas * overestimation))
        .then(function (gas) {
          // Emit the result
          emitter.emit(suffixed('estimatedGas'), gas)
          return gas
        })

      estimationPromise.catch(function (err) {
        debug('Gas estimation failed: %s', err.message)
        if (!emitter.listenerCount('error')) {
          return
        }
        emitter.emit('error', err)
      })

      return estimationPromise
    }

    const getTransaction = function () {
      if (!transactionPromise) {
        debug('Getting transaction %s', hash)
        transactionPromise = web3.eth.getTransaction(hash)
      }
      return transactionPromise
    }

    // Estimate the gas if not provided and add safety factor
    return Promise.resolve(transactionOptions.gas || estimateGas()).then(
      function (gas) {
        // Send the transaction
        debug(
          'Sending transaction to %s',
          transactionOptions.to || method._parent.options.address
        )
        const promiEvent = method.send({ ...transactionOptions, gas })

        // Listen for transaction events
        promiEvent.on('transactionHash', function (_hash) {
          hash = _hash
          debug('Transaction hash is %s', _hash)
          emitter.emit(suffixed('transactionHash'), _hash)
        })
        promiEvent.on('receipt', function (receipt) {
          debug('Transaction %s %s', receipt.status ? 'mined' : 'failed', hash)
          getTransaction()
            .then(function (transaction) {
              emitter.emit(suffixed('receipt'), { transaction, receipt })
            })
            .catch(function (err) {
              promiEvent.emit('error', err)
            })
        })
        promiEvent.on('error', function (err) {
          debug('Transaction failed %s: %s', hash || '?', err.message)
          if (!emitter.listenerCount('error')) {
            return
          }
          emitter.emit('error', err)
        })

        // Return the Web3 PromiEvent that will be casted to Promise
        return promiEvent.then(receipt =>
          getTransaction().then(transaction => ({ transaction, receipt }))
        )
      }
    )
  }

/**
 * Factory function to create transaction executors. These executors receive an
 * array of method calls and a function to parse the results. Then execute the
 * calls sequentially.
 *
 * @param {object} params Executor parameters.
 * @param {object} [params.from] The default account to call the methods from.
 * @param {object} params.web3 An instance of Web3.js.
 * @param {object} [params.overestimation] The gas overestimation factor.
 * @returns {function} The transaction executor.
 */
const createExecutor = ({ from, web3, overestimation }) =>
  function (transactionsPromise, parseResults, transactionOptions = {}) {
    const _from = transactionOptions.from || from

    const emitter = new EventEmitter()
    const estimateGasAndSend = createEstimateGasAndSend(
      web3,
      emitter,
      overestimation
    )

    const addGasPrice = txs =>
      web3.eth.getGasPrice().then(gasPrice => ({ txs, gasPrice }))

    const sendTransactions = function ({ txs, gasPrice }) {
      const expectedGas = txs.reduce((sum, { gas }) => sum + gas, 0)
      const expectedFee = new Big(gasPrice).times(expectedGas).toFixed()
      debug(
        'Expected fee in %d transaction(s) is %s ETH',
        txs.length,
        fromUnit(expectedFee)
      )

      emitter.emit('transactions', {
        expectedFee,
        suffixes: txs.map(({ suffix }) => suffix)
      })

      debug(
        'Sending %s transaction(s): %s',
        txs.length,
        txs.map(({ suffix }) => suffix).join(', ')
      )

      return web3.eth.getTransactionCount(_from, 'pending').then(count =>
        pSeries(
          txs.map(
            ({ method, suffix, value }, i) =>
              () =>
                estimateGasAndSend(
                  method,
                  { from, ...transactionOptions, value, nonce: count + i },
                  suffix
                )
          )
        )
      )
    }

    const getResult = transactionsData =>
      Promise.resolve(parseResults(transactionsData)).then(function (parsed) {
        const result = {
          ...parsed,
          fees: calculateTotalFee(transactionsData),
          raw: transactionsData,
          status: transactionsData[transactionsData.length - 1].receipt.status
        }

        debug('Total transaction fees paid %s ETH', fromUnit(result.fees))

        emitter.emit('result', result)
        return result
      })

    const promise = transactionsPromise
      .then(addGasPrice)
      .catch(function (err) {
        debug('Failed building transactions queue: %s', err.message)
        throw err
      })
      .then(sendTransactions)
      .then(getResult)

    promise.catch(function (err) {
      if (!emitter.listenerCount('error')) {
        throw err
      }
    })

    return {
      emitter,
      promise
    }
  }

module.exports = createExecutor
