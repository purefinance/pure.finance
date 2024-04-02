import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'

import Button from '../../components/Button'
import WithTooltip from '../../components/WithTooltip'
import { useStreams } from '../../hooks/useStreams'
import { Link, useRouter } from '../../navigation'
import { bigToCrypto, fromUnit } from '../../utils'
import { updateStreamInfo } from '../../utils/streams'
import TransactionsContext from '../context/Transactions'
import { EtherscanLink } from '../EtherscanLink'
import SvgContainer from '../svg/SvgContainer'
import Tabs from '../Tabs'

import { PaymentStreamsLibContext } from './PaymentStreamsLib'

const StreamsTable = function () {
  const { active, account } = useWeb3React()
  const t = useTranslations('payment-streams-util')
  const router = useRouter()
  const connected = !!(active && account)
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const { addTransactionStatus, currentTransactions } =
    useContext(TransactionsContext)
  const [streamsView, setStreamsView] = useState('incoming')
  const [claimingId, setClaimingId] = useState(undefined)
  const {
    streams = { incoming: [], outgoing: [] },
    futureStreamValues,
    isLoading,
    mutate
  } = useStreams()

  const futureStreamClaimable = futureStreamValues?.[streamsView]?.find(
    futureStream => futureStream.id === claimingId
  )?.tokenClaimable
  const claimingStream = streams[streamsView].find(s => s.id === claimingId)

  // This effect runs only while the tx modal is shown when claiming. It will update the
  // estimation of tokens to be received once per second.
  useEffect(
    function () {
      const lastTransactionStatus =
        currentTransactions[currentTransactions.length - 1]
      if (!claimingStream || !lastTransactionStatus) {
        return
      }
      const newClaimableValue = bigToCrypto(
        fromUnit(futureStreamClaimable, claimingStream.token.decimals)
      )
      // assumption here: You can only stream one token
      if (
        Big(newClaimableValue).eq(Big(lastTransactionStatus.received[0].value))
      ) {
        return
      }
      // take the last transaction status, and clone it, but using the new updated estimation.
      addTransactionStatus({
        ...lastTransactionStatus,
        received: [
          {
            symbol: claimingStream.token.symbol,
            value: newClaimableValue
          }
        ]
      })
    },
    [
      claimingStream,
      addTransactionStatus,
      currentTransactions,
      futureStreamClaimable
    ]
  )

  if (!connected) {
    return <p>{t('connect-your-wallet')}</p>
  }

  if (isLoading) {
    return <p>{t('loading-streams')}</p>
  }

  const totalStreams = streams.incoming.length + streams.outgoing.length
  if (totalStreams.length === 0) {
    return <p>{t('no-streams')}</p>
  }

  const isIncomingDisabled = streamsView === 'incoming'
  const isOutgoingDisabled = streamsView === 'outgoing'

  const streamsList = streams[streamsView]

  const pause = function (id) {
    const { emitter } = paymentStreamsLib.pauseStream(id)
    const now = Math.floor(new Date().getTime() / 1000)
    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'pause-stream',
          opId: now,
          suffixes: transactions.suffixes,
          transactionStatus: 'created'
        })
        transactions.suffixes.forEach(function (suffix, i) {
          emitter.on(`transactionHash-${suffix}`, function (transactionHash) {
            addTransactionStatus({
              opId: now,
              transactionStatus: 'in-progress',
              [`transactionHash-${i}`]: transactionHash,
              [`transactionStatus-${i}`]: 'waiting-to-be-mined'
            })
          })
          emitter.on(`receipt-${suffix}`, function ({ receipt }) {
            addTransactionStatus({
              currentTransaction: i + 1,
              opId: now,
              [`transactionHash-${i}`]: receipt.transactionHash,
              [`transactionStatus-${i}`]: receipt.status
                ? 'confirmed'
                : 'canceled'
            })
          })
        })
      })
      .on('result', function ({ fees, status }) {
        addTransactionStatus({
          actualFee: fromUnit(fees),
          opId: now,
          transactionStatus: status ? 'confirmed' : 'canceled'
        })
        // eslint-disable-next-line promise/catch-or-return
        updateStreamInfo({
          account,
          id,
          lib: paymentStreamsLib,
          streamsView
        }).then(() => mutate())
      })
      .on('error', function (err) {
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
  }

  const resume = function (id) {
    const now = Math.floor(new Date().getTime() / 1000)
    const { emitter } = paymentStreamsLib.resumeStream(id)
    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'unpause-stream',
          opId: now,
          suffixes: transactions.suffixes,
          transactionStatus: 'created'
        })
        transactions.suffixes.forEach(function (suffix, i) {
          emitter.on(`transactionHash-${suffix}`, function (transactionHash) {
            addTransactionStatus({
              opId: now,
              transactionStatus: 'in-progress',
              [`transactionHash-${i}`]: transactionHash,
              [`transactionStatus-${i}`]: 'waiting-to-be-mined'
            })
          })
          emitter.on(`receipt-${suffix}`, function ({ receipt }) {
            addTransactionStatus({
              currentTransaction: i + 1,
              opId: now,
              [`transactionHash-${i}`]: receipt.transactionHash,
              [`transactionStatus-${i}`]: receipt.status
                ? 'confirmed'
                : 'canceled'
            })
          })
        })
      })
      .on('result', function ({ fees, status }) {
        addTransactionStatus({
          actualFee: fromUnit(fees),
          opId: now,
          transactionStatus: status ? 'confirmed' : 'canceled'
        })
        // eslint-disable-next-line promise/catch-or-return
        updateStreamInfo({
          account,
          id,
          lib: paymentStreamsLib,
          streamsView
        }).then(() => mutate())
      })
      .on('error', function (err) {
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
  }

  const claim = function (id) {
    const stream = streamsList.find(s => s.id === id)
    if (stream.paused) {
      return
    }
    const now = Math.floor(new Date().getTime() / 1000)
    const { emitter } = paymentStreamsLib.claim(id)

    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'claim',
          opId: now,
          received: [
            {
              symbol: stream.token.symbol,
              value: bigToCrypto(
                fromUnit(stream.tokenClaimable, stream.token.decimals)
              )
            }
          ],
          suffixes: transactions.suffixes,
          transactionStatus: 'created'
        })
        transactions.suffixes.forEach(function (suffix, i) {
          emitter.on(`transactionHash-${suffix}`, function (transactionHash) {
            addTransactionStatus({
              opId: now,
              transactionStatus: 'in-progress',
              [`transactionHash-${i}`]: transactionHash,
              [`transactionStatus-${i}`]: 'waiting-to-be-mined'
            })
          })
          emitter.on(`receipt-${suffix}`, function ({ receipt }) {
            addTransactionStatus({
              currentTransaction: i + 1,
              opId: now,
              [`transactionHash-${i}`]: receipt.transactionHash,
              [`transactionStatus-${i}`]: receipt.status
                ? 'confirmed'
                : 'canceled'
            })
          })
        })
      })
      .on('result', function ({ result, fees, status }) {
        setClaimingId(undefined)
        addTransactionStatus({
          actualFee: fromUnit(fees),
          opId: now,
          received: status
            ? [
                {
                  symbol: stream.token.symbol,
                  value: bigToCrypto(
                    fromUnit(result.tokenAmount, stream.token.decimals)
                  )
                }
              ]
            : [],
          transactionStatus: status ? 'confirmed' : 'canceled'
        })
        // eslint-disable-next-line promise/catch-or-return
        updateStreamInfo({
          account,
          id,
          lib: paymentStreamsLib,
          streamsView
        }).then(() => mutate())
      })
      .on('error', function (err) {
        setClaimingId(undefined)
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
    setClaimingId(id)
  }

  const canClaim = function (id) {
    const stream = streamsList.find(s => s.id === id)
    return (
      !stream.paused &&
      Big(stream.tokenBalance).gt(stream.tokenClaimable) &&
      Big(stream.tokenAllowance).gt(stream.tokenClaimable)
    )
  }

  const getClaimTip = function (id) {
    const stream = streamsList.find(s => s.id === id)
    if (stream.paused) {
      return t('stream-is-paused')
    }
    if (Big(stream.tokenClaimable).gt(Big(stream.tokenBalance))) {
      return t('not-enough-funds-in-stream')
    }
    return t('not-enough-allowance-in-stream')
  }

  return (
    <section>
      <Button
        disabled={!connected}
        onClick={function () {
          router.push('/payment-streams/new')
        }}
      >
        {t('create-stream')}
      </Button>
      <Tabs
        className="mb-6 w-2/3"
        items={[
          {
            label: t('incoming-streams'),
            onClick: () => setStreamsView('incoming'),
            selected: isIncomingDisabled
          },
          {
            label: t('outgoing-streams'),
            onClick: () => setStreamsView('outgoing'),
            selected: isOutgoingDisabled
          }
        ]}
      />
      {streamsList.length === 0 && <p>{t('no-streams')}</p>}
      {streamsList.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="capitalize-first w-24">{t('status')}</th>
              <th className="capitalize-first">
                {t(streamsView === 'incoming' ? 'payer' : 'payee')}
              </th>
              {streamsView === 'outgoing' && (
                <th className="capitalize-first">{t('funding-address')}</th>
              )}
              {/* <th className="capitalize-first">{t('start-date')}</th> */}
              <th className="capitalize-first">{t('end-date')}</th>
              <th className="capitalize-first">{t('token')}</th>
              <th className="capitalize-first w-28">{t('usd-amount')}</th>
              <th className="capitalize-first">{t('claimed')}</th>
              <th className="capitalize-first">{t('claimable')}</th>
              <th className="capitalize-first">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {streamsList.map(function ({
              id,
              payee,
              payer,
              fundingAddress,
              startTime,
              secs,
              token,
              claimed,
              claimable,
              usdAmount,
              paused
            }) {
              const endDate = new Date(
                (parseInt(startTime, 10) + parseInt(secs, 10)) * 1000
              )
              const now = new Date().getTime()
              const dateFormatter = new Intl.DateTimeFormat('default', {
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                month: 'numeric',
                year: 'numeric'
              })
              const futureValue = futureStreamValues?.[streamsView]?.find(
                futureStream => futureStream.id === id
              )
              const isFinished = endDate.getTime() < now
              const status = isFinished
                ? t('finished')
                : paused
                ? t('paused')
                : t('streaming')
              return (
                <tr key={id}>
                  <th className="capitalize-first w-24">
                    <span>{status}</span>
                  </th>
                  <td>
                    <EtherscanLink
                      address={streamsView === 'incoming' ? payer : payee}
                    />
                  </td>
                  {streamsView === 'outgoing' && (
                    <td>
                      <EtherscanLink address={fundingAddress} />
                    </td>
                  )}
                  {/* <td>{dateFormatter.format(startDate)}</td> */}
                  <td>{dateFormatter.format(endDate)}</td>
                  <td>{token.symbol}</td>
                  <td className="w-28 text-right tabular-nums">
                    $ {fromUnit(usdAmount ?? 0, 18, 4)}
                  </td>
                  <td className="text-right tabular-nums">
                    $ {fromUnit(claimed ?? 0, 18, 4)}
                  </td>
                  <td className="text-right tabular-nums">
                    ${' '}
                    {fromUnit(
                      isFinished ? claimable : futureValue?.claimable ?? 0,
                      18,
                      4
                    )}
                  </td>
                  <td className="flex justify-center">
                    {streamsView === 'outgoing' && (
                      <>
                        {paused && (
                          <Button
                            className="m-1"
                            disabled={isFinished}
                            onClick={() => resume(id)}
                            width="w-28"
                          >
                            {t('resume')}
                          </Button>
                        )}
                        {!paused && (
                          <Button
                            className="m-1"
                            disabled={isFinished}
                            onClick={() => pause(id)}
                            width="w-28"
                          >
                            {t('pause')}
                          </Button>
                        )}
                        <Link href={`/payment-streams/edit?id=${id}`}>
                          <Button
                            className="m-1"
                            disabled={isFinished}
                            width="w-28"
                          >
                            {t('edit')}
                          </Button>
                        </Link>
                      </>
                    )}
                    {streamsView === 'incoming' && (
                      <WithTooltip tip={canClaim(id) ? false : getClaimTip(id)}>
                        <Button
                          className="flex items-center justify-center m-1"
                          disabled={!canClaim(id)}
                          onClick={() => claim(id)}
                          width="w-28"
                        >
                          <span className="mr-2">{t('claim')}</span>
                          {canClaim(id) ? null : (
                            <SvgContainer fill="white" name="questionmark" />
                          )}
                        </Button>
                      </WithTooltip>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default StreamsTable
