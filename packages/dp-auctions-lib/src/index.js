'use strict'

const { getRouterContract } = require('erc-20-lib/src/uniswap')
const createExecutor = require('eth-exec-txs')
const debug = require('debug')('dpa')
const erc20Abi = require('erc-20-abi')
const pTap = require('p-tap').default

const { findToken } = require('./token-list')
const dpaAbi = require('./abi.json')

const DPA_ADDRESS = '0x164D41ceB60489D2e054394Fc05ED1894Db3898a' // Chain ID 1
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const UNLIMITED = (2n ** 256n - 1n).toString()

const createDPAuctionsLib = function (web3, options = {}) {
  const { gasFactor = 2 } = options

  debug('Creating Descending Price Auction helper library')

  const dpa = new web3.eth.Contract(dpaAbi, DPA_ADDRESS)
  const router = getRouterContract(web3) // This only works for chainId 1

  const execTransactions = createExecutor({ web3, overestimation: gasFactor })

  // Add value information to a token contained in the auction. The value is
  // measured in the payment token.
  const addTokenValue = paymentToken => token =>
    router.methods
      .getAmountsOut(token.amount, [token.address, paymentToken])
      .call()
      .then(amounts => ({
        ...token,
        value: amounts.slice(-1)[0]
      }))

  // Using the `tokens` and `tokenAmounts` information, build a more useful
  // array containing details of the tokens.
  const getAuctionTokensData = auction =>
    Promise.all(
      auction.tokens
        .map((token, i) => ({
          amount: auction.tokenAmounts[i],
          ...findToken(token) // TODO specify the chainId
        }))
        .map(addTokenValue(auction.paymentToken))
    )

  // If the auction is stopped, get the stopping price and stopping block. To do
  // so, look for the `AuctionStopped` event, get the block number and get the
  // current price at that block.
  const getStoppingData = auction =>
    auction.stopped && auction.winner === ZERO_ADDRESS
      ? dpa
          .getPastEvents('AuctionStopped', {
            fromBlock: auction.startBlock,
            filter: {
              id: auction.id
            }
          })
          .then(
            ([auctionStoppedEvent]) =>
              auctionStoppedEvent
                ? {
                    stoppingBlock: auctionStoppedEvent.blockNumber,
                    stoppingPrice: auctionStoppedEvent.returnValues.price
                  }
                : {} // The auction floored (ended).
          )
      : {} // The auction is running or won.

  // Calculate the high-level status of the auction based on the base data, the
  // current price and current block.
  const getAuctionStatus = (auction, currentPrice) =>
    auction.winner !== ZERO_ADDRESS
      ? 'won'
      : auction.stopped
      ? 'stopped'
      : currentPrice === auction.floor
      ? 'floored'
      : 'running'

  // Add useful information to the auction object such as details on the tokens
  // contained, the payment token, the current price, etc.
  const augmentAuctionData = auction =>
    Promise.all([
      getAuctionTokensData(auction),
      dpa.methods.getCurrentPrice(auction.id).call(),
      web3.eth.getBlockNumber(),
      getStoppingData(auction)
    ]).then(([tokensData, currentPrice, currentBlock, stoppingData]) => ({
      ...auction,
      tokens: tokensData,
      tokenAmounts: null,
      paymentToken: findToken(auction.paymentToken), // TODO specify the chainId
      currentValue: tokensData
        .reduce((sum, token) => sum + BigInt(token.value), BigInt(0))
        .toString(),
      currentPrice,
      currentBlock,
      ...stoppingData,
      status: getAuctionStatus(auction, currentPrice)
    }))

  // Gets the auction data given the auction ID. If required, additional data
  // will be added.
  const getAuction = (auctionId, moreData) =>
    dpa.methods
      .getAuction(auctionId)
      .call()
      .then(auction =>
        moreData ? augmentAuctionData(auction) : { ...auction }
      )
      .catch(function (err) {
        if (err.message.includes('no-such-auction-id')) {
          return null
        }
        throw err
      })

  // Get the list of auctions of a collection. In addition to the data returned
  // by the contract, additional data is added for easier display in the UI.
  //
  // TODO this function could be memoized. If the total number of auctions did
  // not change or the collection length did not change, it is safe to return
  // a cached list.
  const getCollectionAuctions = function (collectionId) {
    debug('Getting all auctions of collection %s', collectionId)
    return dpa.methods
      .collectionLength(collectionId)
      .call()
      .then(function (length) {
        debug('Collection has %s auctions', length)
        return Promise.all(
          new Array(Number.parseInt(length))
            .fill(null)
            .map((_, i) =>
              dpa.methods.auctionOfCollByIndex(collectionId, i).call()
            )
        )
      })
      .then(auctionIds =>
        Promise.all(auctionIds.map(auctionId => getAuction(auctionId, true)))
      )
  }

  // Get the total number of collections. The contract returns the amount
  // ignoring collection ID 0, which always exist. And even when the result is
  // a uint256, just parse it to a number here. Are we going to have more than
  // 2^53 collections in the near future?
  const getTotalCollections = function () {
    debug('Getting total collections')
    return dpa.methods
      .totalCollections()
      .call()
      .then(count => Number.parseInt(count) + 1)
      .then(
        pTap(function (count) {
          debug('There are %s collection%s', count, count === 1 ? '' : 's')
        })
      )
  }

  // Checks if the auction is still running and if the account has enough
  // balance to bid for the auction at the current auction price. Token
  // allowance is not checked.
  const canBidAuction = function (account, auctionId) {
    debug('Checking if %s can bid on auction %s', account, auctionId)
    return Promise.all([
      dpa.methods.getAuction(auctionId).call(),
      dpa.methods.getCurrentPrice(auctionId).call()
    ])
      .then(function ([auction, currentPrice]) {
        if (auction.stopped) {
          return false
        }
        const token = new web3.eth.Contract(erc20Abi, auction.paymentToken)
        return token.methods
          .balanceOf(account)
          .call()
          .then(balance => BigInt(balance) >= BigInt(currentPrice))
      })
      .then(
        pTap(function (canBid) {
          debug(
            'Account %s %s bid on auction %s',
            account,
            canBid ? 'can' : 'cannot',
            auctionId
          )
        })
      )
  }

  // Create a new auction. For each token, approve if needed. Then create the
  // auction. The function returns an event emitter and a promise that will
  // resolve to the `AuctionCreated` event logged.
  const createAuction = function (auction, transactionOptions) {
    debug('Creating a new auction in collection %s', auction.collectionId)

    const { from } = transactionOptions

    const transactionsPromise = Promise.all(
      auction.tokens.map(function (address, i) {
        const amount = auction.tokenAmounts[i]
        const erc20 = new web3.eth.Contract(erc20Abi, address)
        debug('Checking allowance for %s %s', amount, address)
        return erc20.methods
          .allowance(from, DPA_ADDRESS)
          .call()
          .then(function (allowance) {
            if (BigInt(allowance) >= BigInt(amount)) {
              debug('Allowance %s is enough', allowance)
              return null
            }
            debug('Allowance %s is not enough', allowance)
            return {
              method: erc20.methods.approve(DPA_ADDRESS, amount),
              suffix: 'approve',
              gas: 50000
            }
          })
      })
    ).then(function (txs) {
      txs.push({
        method: dpa.methods.createAuction(auction),
        suffix: 'create-auction',
        gas: 600000
      })
      return txs.filter(tx => !!tx)
    })

    const parseResults = function (transactionsData) {
      const [{ receipt }] = transactionsData.slice(-1)
      debug('Auction created')
      return receipt.events.AuctionCreated.returnValues
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Bid for an auction. If the allowance to pay for the auction price is not
  // enough, it will set unlimited allowance for the DPAuctions contract to
  // spend user's payment tokens. The function returns an event emitter and a
  // promise that will resolve to the `AuctionWon` event logged.
  const bidAuction = function (auctionId, transactionOptions) {
    debug('Bidding for auction %s', auctionId)

    const { from } = transactionOptions

    const transactionsPromise = Promise.all([
      dpa.methods.getAuction(auctionId).call(),
      dpa.methods.getCurrentPrice(auctionId).call()
    ])
      .then(function ([auction, currentPrice]) {
        const token = new web3.eth.Contract(erc20Abi, auction.paymentToken)
        return token.methods
          .allowance(from, DPA_ADDRESS)
          .call()
          .then(function (allowance) {
            const approvalNeeded = BigInt(allowance) < BigInt(currentPrice)
            debug('Approval %s needed', approvalNeeded ? 'is' : 'is not')
            return approvalNeeded
              ? [
                  {
                    // Approve unlimited (2^256 - 1)
                    method: token.methods.approve(DPA_ADDRESS, UNLIMITED),
                    suffix: 'approve',
                    gas: 50000
                  }
                ]
              : []
          })
      })
      .then(function (txs) {
        // Bid for the auction
        txs.push({
          method: dpa.methods.bid(auctionId),
          suffix: 'bid',
          gas: 600000
        })
        return txs
      })

    const parseResults = function (transactionsData) {
      const [{ receipt }] = transactionsData.slice(-1)
      debug('Auction %s won', auctionId)
      return receipt.events.AuctionWon.returnValues
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  // Stop a running auction. Only the auction creator can stop an auction.
  const stopAuction = function (auctionId, transactionOptions) {
    debug('Stopping auction %s', auctionId)

    const transactionsPromise = Promise.resolve([
      {
        method: dpa.methods.stopAuction(auctionId),
        suffix: 'stop-auction',
        gas: 80000
      }
    ])

    const parseResults = function (transactionsData) {
      const [{ receipt }] = transactionsData
      debug('Auction %s stopped', auctionId)
      return receipt.events.AuctionStopped.returnValues
    }

    return execTransactions(
      transactionsPromise,
      parseResults,
      transactionOptions
    )
  }

  return {
    bidAuction,
    canBidAuction,
    createAuction,
    getAuction,
    getCollectionAuctions,
    getTotalCollections,
    stopAuction
  }
}

module.exports = createDPAuctionsLib
