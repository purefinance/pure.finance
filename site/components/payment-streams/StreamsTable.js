import Link from 'next/link'
import Big from 'big.js'
import { useWeb3React } from '@web3-react/core'
import useTranslation from 'next-translate/useTranslation'
import { useContext, useEffect, useState } from 'react'
import { useStreams } from '../../hooks/useStreams'
import { bigToCrypto, fromUnit } from '../../utils'
import { updateStreamInfo } from '../../utils/streams'
import Button from '../../components/Button'
import WithTooltip from '../../components/WithTooltip'
import { EtherscanLink } from '../../components/EtherscanLink'
import SvgContainer from '../svg/SvgContainer'
import PaymentStreamsLibContext from './PaymentStreamsLib'
import TransactionsContext from '../context/Transactions'

const StreamsTable = function () {
  const { active, account } = useWeb3React()
  const { t } = useTranslation('payment-streams')
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
            value: newClaimableValue,
            symbol: claimingStream.token.symbol
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
          id,
          lib: paymentStreamsLib,
          account,
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
          id,
          lib: paymentStreamsLib,
          account,
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
              value: bigToCrypto(
                fromUnit(stream.tokenClaimable, stream.token.decimals)
              ),
              symbol: stream.token.symbol
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
          transactionStatus: status ? 'confirmed' : 'canceled',
          received: status
            ? [
                {
                  value: bigToCrypto(
                    fromUnit(result.tokenAmount, stream.token.decimals)
                  ),
                  symbol: stream.token.symbol
                }
              ]
            : []
        })
        // eslint-disable-next-line promise/catch-or-return
        updateStreamInfo({
          id,
          lib: paymentStreamsLib,
          account,
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
      <Link
        as="/payment-streams/new"
        disabled={!connected}
        href="/payment-streams?view=create"
      >
        <a>
          <Button disabled={!connected}>{t('create-stream')}</Button>
        </a>
      </Link>
      <div className="flex justify-center my-7 w-full">
        <button
          className={`w-full capitalize h-10 border-b ${
            isIncomingDisabled
              ? 'bg-gray-800 text-white cursor-not-allowed'
              : 'hover:bg-gray-200 hover:text-white'
          }`}
          disabled={isIncomingDisabled}
          onClick={() => setStreamsView('incoming')}
        >
          {t('incoming-streams')}
        </button>
        <button
          className={`w-full capitalize h-10 border-b ${
            isOutgoingDisabled
              ? 'bg-gray-800 text-white cursor-not-allowed'
              : 'hover:bg-gray-200 hover:text-white'
          }`}
          disabled={isOutgoingDisabled}
          onClick={() => setStreamsView('outgoing')}
        >
          {t('outgoing-streams')}
        </button>
      </div>
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
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
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
                        <Link
                          as={`/payment-streams/edit/${id}`}
                          href={`/payment-streams?view=edit&streamId=${id}`}
                        >
                          <a>
                            <Button
                              className="m-1"
                              disabled={isFinished}
                              width="w-28"
                            >
                              {t('edit')}
                            </Button>
                          </a>
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
