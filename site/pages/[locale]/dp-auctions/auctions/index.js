import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter } from 'victory'
import watchAsset from 'wallet-watch-asset'

import Button from '../../../../components/Button'
import TransactionsContext from '../../../../components/context/Transactions'
import { DPAuctionsContext } from '../../../../components/DPAuctionsContext'
import DPAuctionsLayout from '../../../../components/DPAuctionsLayout'
import { ExplorerLink } from '../../../../components/ExplorerLink'
import TokenAmount from '../../../../components/TokenAmount'
import Transactions from '../../../../components/Transactions'
import { fromUnit } from '../../../../utils'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

const numberFromUnit = (number, decimals) =>
  Number.parseFloat(fromUnit(number, decimals))

// The price chart shows the evolution of the price and the current or ending
// point of the auction, depending on the state.
//
// There are 6 possible states:
//
//   [running, won, stopped] x [descending, floored]
//
// When still descending, the chart looks like this:
//
//   \
//    .
//     \
//
// When floored, the chart looks like this:
//
//   \_.
//
// In addition, when running, the current state is shown as a circle while when
// stopped or won is shown as a full disc.
const DPAuctionPriceChart = function ({ auction }) {
  const t = useTranslations()

  const startPoint = {
    block: auction.startBlock,
    price: auction.ceiling
  }
  const endPoint = {
    block: auction.endBlock,
    price: auction.floor
  }
  const currentPoint = {
    block: auction.currentBlock,
    price: auction.currentPrice
  }
  const winningPoint = {
    block: auction.winningBlock,
    price: auction.winningPrice
  }
  const stoppingPoint = {
    block: auction.stoppingBlock,
    price: auction.stoppingPrice
  }

  const basePlotData =
    auction.status === 'running'
      ? [startPoint, currentPoint, endPoint]
      : auction.status === 'stopped'
      ? [startPoint, stoppingPoint, endPoint]
      : auction.status === 'won'
      ? [startPoint, winningPoint, endPoint]
      : [startPoint, currentPoint, endPoint]

  const plotData = basePlotData
    .map(({ block, price }) => ({
      block: Number.parseInt(block),
      price: numberFromUnit(price, auction.paymentToken.decimals)
    }))
    .sort((a, b) => a.block - b.block)

  // Calculating the x-axis ticks manually prevents x-labels to overlap, to
  // repeat or to show decimal block numbers. And since the auctions can be live
  // for many blocks or just a few, black math magic is required.
  //
  // First, start by defining the start, end blocks and the domain length.
  const xStart = plotData[0].block
  const xEnd = plotData[2].block
  const xLen = xEnd - xStart
  // Then split the domain length in 3 to have at most 4 ticks. Since the chart
  // is relatively small and the block numbers are large, having just a few
  // ticks is ok.
  // Finally force the steps to be a whole number and force it to be at least 1.
  const xStep = Math.max(Math.floor(xLen / 3), 1)
  // Once the steps are defined, calculate how many ticks fit in the domain. Sum
  // one to add the "ending" tick. Otherwise only the start and "inner" ticks
  // will be shown.
  const xTicks = Math.floor(xLen / xStep) + 1
  // Finally create an array of that length whose values will be one step
  // appart. To get a better look, start from the end, subtract one step at a
  // time and then revert the array. That way the end tick will always match the
  // end block.
  const xTickValues = new Array(Math.max(xTicks, 1))
    .fill(null)
    .map((_, i) => xEnd - xStep * i)
    .reverse()

  return (
    <div>
      <VictoryChart
        minDomain={{ y: 0 }}
        padding={{ bottom: 55, left: 90, right: 30, top: 10 }}
        width={450}
      >
        <VictoryAxis
          label={t('block-number')}
          style={{
            axisLabel: { padding: 40 },
            ticks: { size: 5, stroke: 'black' }
          }}
          tickFormat={tick => tick.toString()}
          tickValues={xTickValues}
        />
        <VictoryAxis
          dependentAxis
          label={auction.paymentToken.symbol}
          style={{
            axisLabel: { padding: 75 },
            ticks: { size: 5, stroke: 'black' }
          }}
        />
        <VictoryLine
          data={plotData.slice(0, 2)}
          style={{
            data: { strokeWidth: 2 }
          }}
          x="block"
          y="price"
        />
        <VictoryLine
          data={plotData.slice(1)}
          style={{
            data:
              auction.status === 'floored' ||
              auction.winningPrice === auction.floor ||
              auction.stoppingPrice === auction.floor
                ? { strokeWidth: 3 }
                : { strokeDasharray: '10,10', strokeWidth: 1 }
          }}
          x="block"
          y="price"
        />
        <VictoryScatter
          data={[
            plotData[
              auction.status === 'floored' ||
              auction.winningPrice === auction.floor ||
              auction.stoppingPrice === auction.floor
                ? 2
                : 1
            ]
          ]}
          size={8}
          style={{
            data: {
              fill: auction.stopped ? 'black' : 'white',
              stroke: 'black',
              strokeWidth: 1
            }
          }}
          x="block"
          y="price"
        />
      </VictoryChart>
    </div>
  )
}

const DPAuctionContentsRow = ({ paymentToken, token }) => (
  <tr>
    <td className="border-2">
      <TokenAmount {...token} />
    </td>
    <td className="border-2">
      <TokenAmount {...paymentToken} amount={token.value} />
    </td>
  </tr>
)

const DPAuctionTokens = function ({ auction }) {
  const t = useTranslations()

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="font-bold bg-gray-200">
          <td className="border-2">{t('token')}</td>
          <td className="border-2">{t('value')}</td>
        </tr>
      </thead>
      <tbody>
        {auction.tokens.map(token => (
          <DPAuctionContentsRow
            key={token.address}
            paymentToken={auction.paymentToken}
            token={token}
          />
        ))}
      </tbody>
      <tfoot>
        <tr className="bg-gray-200">
          <td className="border-2">{t('total')}</td>
          <td className="border-2">
            <TokenAmount
              {...auction.paymentToken}
              amount={auction.currentValue}
            />
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

const DPAuctionBuyControl = function ({ auction }) {
  const t = useTranslations()
  const { account, active } = useWeb3React()
  const { addTransactionStatus } = useContext(TransactionsContext)
  const dpa = useContext(DPAuctionsContext)

  const [canBid, setCanBid] = useState(false)
  useEffect(
    function () {
      if (!active || !dpa || account === auction.payee) {
        setCanBid(false)
        return
      }
      // eslint-disable-next-line promise/catch-or-return
      dpa
        .canBidAuction(account, auction.id)
        .catch(function () {
          console.warn('Could not check if user can bid')
          return false
        })
        .then(setCanBid)
    },
    [account, auction, active, dpa]
  )

  const handleBuyAuctionClick = function () {
    const opId = Date.now()

    const { emitter } = dpa.bidAuction(auction.id, { from: account })

    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'bid',
          opId,
          received: auction.tokens.map(token => ({
            symbol: token.symbol,
            value: fromUnit(token.amount, token.decilams)
          })),
          sent: fromUnit(auction.currentPrice, auction.paymentToken.decimals),
          sentSymbol: auction.paymentToken.symbol,
          suffixes: transactions.suffixes,
          transactionStatus: 'created'
        })
        transactions.suffixes.forEach(function (suffix, i) {
          emitter.on(`transactionHash-${suffix}`, function (transactionHash) {
            addTransactionStatus({
              opId,
              transactionStatus: 'in-progress',
              [`transactionHash-${i}`]: transactionHash,
              [`transactionStatus-${i}`]: 'waiting-to-be-mined'
            })
          })
          emitter.on(`receipt-${suffix}`, function ({ receipt }) {
            addTransactionStatus({
              currentTransaction: i + 1,
              opId,
              [`transactionHash-${i}`]: receipt.transactionHash,
              [`transactionStatus-${i}`]: receipt.status
                ? 'confirmed'
                : 'canceled'
            })
          })
        })
      })
      .on('result', function ({ fees, status, price }) {
        addTransactionStatus({
          actualFee: fromUnit(fees),
          opId,
          sent: fromUnit(price, auction.paymentToken.decimals),
          transactionStatus: status ? 'confirmed' : 'canceled'
        })
        auction.tokens.forEach(function (token) {
          watchAsset({ account, token })
        })
      })
      .on('error', function (err) {
        addTransactionStatus({
          message: err.message,
          opId,
          transactionStatus: 'error'
        })
      })
  }

  return (
    <div className="text-xl">
      {!auction.stopped ? (
        <>
          <div className="w-full">
            <div>{t('current-price')}:</div>
            <div className="font-bold">
              <TokenAmount
                amount={auction.currentPrice}
                {...auction.paymentToken}
              />
            </div>
            <div className="text-sm">
              (
              {(
                (100n * BigInt(auction.currentPrice)) /
                BigInt(auction.currentValue)
              ).toString()}
              % {t('of-value')})
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button disabled={!canBid} onClick={handleBuyAuctionClick}>
              {t('buy-auction')}
            </Button>
          </div>
        </>
      ) : (
        <span>{t('auction-ended')}</span>
      )}
    </div>
  )
}

// This component shows the end status of the auction.
const DPAuctionEndStatus = function ({ auction }) {
  const { chainId } = useWeb3React()
  const t = useTranslations()

  return auction.status === 'won' ? (
    <>
      <div>
        {t('won-by')}:{' '}
        <ExplorerLink address={auction.winner} chainId={chainId} />
      </div>
      <div>
        {t('winning-price')}:{' '}
        <TokenAmount {...auction.paymentToken} amount={auction.winningPrice} />
      </div>
    </>
  ) : auction.status === 'stopped' ? (
    <div>{t('auction-stopped')}</div>
  ) : null
}

// This component renders the details view of an auction.
const DPAuction = function ({ auction }) {
  const { chainId } = useWeb3React()
  const t = useTranslations()

  if (!auction) {
    return null
  }
  return (
    <>
      <div className="flex">
        <div className="mr-4 w-1/2">
          <DPAuctionPriceChart auction={auction} />
        </div>
        <div className="ml-4 w-1/2">
          <div className="mb-2">
            {t('seller')}:{' '}
            <ExplorerLink address={auction.payee} chainId={chainId} />
          </div>
          <DPAuctionTokens auction={auction} />
        </div>
      </div>
      <div className="flex mt-8">
        <div className="mr-4 w-1/2">
          <DPAuctionBuyControl auction={auction} />
        </div>
        <div className="mr-4 w-1/2">
          <DPAuctionEndStatus auction={auction} />
        </div>
      </div>
    </>
  )
}

// This is the main app component. It holds all the views like the auctions
// list, the auction detail, etc.
export default function DPAuctionsDetails({ initialData, error }) {
  const t = useTranslations()
  const {
    query: { id: auctionId = 0 }
  } = useRouter()
  const dpa = useContext(DPAuctionsContext)

  const { data: auction } = useSWR(
    `dp-auctions-${auctionId}`,
    () =>
      dpa.getAuction(auctionId, true).catch(function (err) {
        console.warn('Could not get auction', auctionId, err.message)
        return null
      }),
    { fallbackData: initialData, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  return (
    <DPAuctionsLayout>
      <div className="mt-10 w-full">
        <div className="mb-1.5 text-gray-600 font-bold">
          {t('auction')} {auctionId}
        </div>
        {auction ? (
          <DPAuction auction={auction} />
        ) : (
          <>
            <div>{t('error-getting-auction')}:</div>
            <div>{error}</div>
          </>
        )}
      </div>
      <Transactions />
    </DPAuctionsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../../utils/staticProps'
