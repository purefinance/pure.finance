import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'

import { useStreams } from '../../hooks/useStreams'
import { useRouter } from '../../navigation'
import { bigToCrypto, fromUnit } from '../../utils'
import { updateStreamInfo } from '../../utils/streams'
import Button from '../Button'
import CallToAction from '../CallToAction'
import { PaymentStreamsLibContext } from '../context/PaymentStreamsLib'
import TransactionsContext from '../context/Transactions'
import { ExplorerLink } from '../ExplorerLink'
import Tabs from '../Tabs'
import WithTooltip from '../WithTooltip'

const dateFormatter = new Intl.DateTimeFormat('default', {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'numeric',
  year: 'numeric'
})

function TableHeaders({ streamsView }) {
  const t = useTranslations('payment-streams-util')

  return (
    <tr>
      <th className="capitalize-first">{t('status')}</th>
      <th className="capitalize-first">
        {t(streamsView === 'incoming' ? 'payer' : 'payee')}
      </th>
      {streamsView === 'outgoing' && (
        <th className="capitalize-first">{t('funding-address')}</th>
      )}
      {/* <th className="capitalize-first">{t('start-date')}</th> */}
      <th className="capitalize-first">{t('end-date')}</th>
      <th className="capitalize-first">{t('token')}</th>
      <th className="capitalize-first">{t('usd-amount')}</th>
      <th className="capitalize-first">{t('claimed')}</th>
      <th className="capitalize-first">{t('claimable')}</th>
      <th className="capitalize-first">{t('actions')}</th>
    </tr>
  )
}

const ActionButton = ({ children, disabled, onClick }) => (
  <Button className="m-1" disabled={disabled} onClick={onClick} width="w-20">
    {children}
  </Button>
)

const UsdAmount = ({ amount }) => (
  <div className="text-right tabular-nums">
    $ {fromUnit(amount ?? 0, 18, 2)}
  </div>
)

function TableRow({
  futureValue,
  onClaim,
  onPause,
  onResume,
  stream,
  streamsView
}) {
  const { chainId } = useWeb3React()
  const router = useRouter()
  const t = useTranslations('payment-streams-util')

  const {
    claimable,
    claimed,
    fundingAddress,
    id,
    paused,
    payee,
    payer,
    secs,
    startTime,
    token,
    tokenAllowance,
    tokenBalance,
    tokenClaimable,
    usdAmount
  } = stream

  const endDate = new Date((parseInt(startTime) + parseInt(secs)) * 1000)
  const isFinished = endDate.getTime() < new Date().getTime()
  const status = isFinished
    ? t('finished')
    : paused
      ? t('paused')
      : t('streaming')
  const claimTip = stream.paused
    ? t('stream-is-paused')
    : Big(stream.tokenClaimable).gt(Big(stream.tokenBalance))
      ? t('not-enough-funds-in-stream')
      : t('not-enough-allowance-in-stream')
  const canClaim =
    !paused &&
    Big(tokenBalance).gt(tokenClaimable) &&
    Big(tokenAllowance).gt(tokenClaimable)

  function onEditButtonClick() {
    router.push(`/payment-streams/edit?id=${id}`)
  }

  return (
    <tr>
      <td className="capitalize-first w-24">{status}</td>
      <td>
        <ExplorerLink
          address={streamsView === 'incoming' ? payer : payee}
          chainId={chainId}
        />
      </td>
      {streamsView === 'outgoing' && (
        <td>
          <ExplorerLink address={fundingAddress} chainId={chainId} />
        </td>
      )}
      {/* <td>{dateFormatter.format(startDate)}</td> */}
      <td>{dateFormatter.format(endDate)}</td>
      <td>{token.symbol}</td>
      <td>
        <UsdAmount amount={usdAmount} />
      </td>
      <td>
        <UsdAmount amount={claimed} />
      </td>
      <td>
        <UsdAmount amount={isFinished ? claimable : futureValue?.claimable} />
      </td>
      <td className="flex justify-center">
        {streamsView === 'outgoing' && (
          <ActionButton disabled={isFinished} onClick={onEditButtonClick}>
            {t('edit')}
          </ActionButton>
        )}
        {streamsView === 'outgoing' && !paused && (
          <ActionButton disabled={isFinished} onClick={() => onPause(id)}>
            {t('pause')}
          </ActionButton>
        )}
        {streamsView === 'outgoing' && paused && (
          <ActionButton disabled={isFinished} onClick={() => onResume(id)}>
            {t('resume')}
          </ActionButton>
        )}
        {streamsView === 'incoming' && (
          <WithTooltip id={id} tip={canClaim && claimTip}>
            <ActionButton disabled={!canClaim} onClick={() => onClaim(id)}>
              <span className="mr-2">{t('claim')}</span>
            </ActionButton>
          </WithTooltip>
        )}
      </td>
    </tr>
  )
}

const StreamTables = function () {
  const { account, active, chainId } = useWeb3React()
  const { addTransactionStatus, currentTransactions, handleTransactionStatus } =
    useContext(TransactionsContext)
  const {
    futureStreamValues,
    isLoading,
    mutate,
    streams = { incoming: [], outgoing: [] }
  } = useStreams()
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const router = useRouter()
  const t = useTranslations('payment-streams-util')

  const [claimingId, setClaimingId] = useState(undefined)
  const [streamsView, setStreamsView] = useState('incoming')

  const visibleFutureStreams = futureStreamValues?.[streamsView]
  const claimingFutureStream = visibleFutureStreams?.find(
    s => s.id === claimingId
  )
  const futureStreamClaimable = claimingFutureStream?.tokenClaimable

  const visibleStreams = streams[streamsView]
  const claimingStream = visibleStreams.find(s => s.id === claimingId)

  // This effect runs only while the tx modal is shown when claiming. It will
  // update the estimation of tokens to be received once per second.
  useEffect(
    function refreshClaimableValue() {
      const lastTransactionStatus =
        currentTransactions[currentTransactions.length - 1]
      if (!claimingStream || !lastTransactionStatus) {
        return
      }

      const newClaimableValue = bigToCrypto(
        fromUnit(futureStreamClaimable, claimingStream.token.decimals)
      )
      // Assumption: streams have only one token
      if (
        Big(newClaimableValue).eq(Big(lastTransactionStatus.received[0].value))
      ) {
        return
      }

      // Take the last transaction status and clone it, but using the new
      // updated estimation.
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
      addTransactionStatus,
      claimingStream,
      currentTransactions,
      futureStreamClaimable
    ]
  )

  function onCreateStreamButtonClick() {
    router.push('/payment-streams/new')
  }

  const onPause = function (id) {
    const { emitter } = paymentStreamsLib.pauseStream(id)
    handleTransactionStatus({
      emitter,
      onResult({ status }) {
        if (status !== 'confirmed') {
          return
        }

        updateStreamInfo({
          account,
          chainId,
          id,
          lib: paymentStreamsLib,
          streamsView
        })
          .then(() => mutate())
          .catch(Function.prototype)
      },
      operation: 'pause-stream'
    })
  }

  const onResume = function (id) {
    const { emitter } = paymentStreamsLib.resumeStream(id)
    handleTransactionStatus({
      emitter,
      onResult({ status }) {
        if (status !== 'confirmed') {
          return
        }

        updateStreamInfo({
          account,
          chainId,
          id,
          lib: paymentStreamsLib,
          streamsView
        })
          .then(() => mutate())
          .catch(Function.prototype)
      },
      operation: 'unpause-stream'
    })
  }

  const onClaim = function (id) {
    const stream = visibleStreams.find(s => s.id === id)
    if (stream.paused) {
      return
    }

    setClaimingId(id)

    const { emitter } = paymentStreamsLib.claim(id)
    handleTransactionStatus({
      emitter,
      onError() {
        setClaimingId(undefined)
      },
      onResult({ result, status }) {
        setClaimingId(undefined)
        if (status !== 'confirmed') {
          return null
        }

        updateStreamInfo({
          account,
          chainId,
          id,
          lib: paymentStreamsLib,
          streamsView
        })
          .then(() => mutate())
          .catch(Function.prototype)

        return [
          {
            symbol: stream.token.symbol,
            value: bigToCrypto(
              fromUnit(result.tokenAmount, stream.token.decimals)
            )
          }
        ]
      },
      operation: 'claim',
      received: [
        {
          symbol: stream.token.symbol,
          value: bigToCrypto(
            fromUnit(stream.tokenClaimable, stream.token.decimals)
          )
        }
      ]
    })
  }

  return (
    <>
      {active && paymentStreamsLib && (
        <>
          <Tabs
            items={[
              {
                label: t('incoming-streams'),
                onClick: () => setStreamsView('incoming'),
                selected: streamsView === 'incoming'
              },
              {
                label: t('outgoing-streams'),
                onClick: () => setStreamsView('outgoing'),
                selected: streamsView === 'outgoing'
              }
            ]}
          />
          {isLoading ? (
            <p className="text-center">{t('loading-streams')}</p>
          ) : !visibleStreams.length ? (
            <p className="text-center">{t('no-streams')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <TableHeaders streamsView={streamsView} />
              </thead>
              <tbody>
                {visibleStreams.map(function (stream) {
                  const { id } = stream
                  const futureValue = visibleFutureStreams?.find(
                    s => s.id === id
                  )
                  return (
                    <TableRow
                      futureValue={futureValue}
                      key={id}
                      onClaim={onClaim}
                      onPause={onPause}
                      onResume={onResume}
                      stream={stream}
                      streamsView={streamsView}
                    />
                  )
                })}
              </tbody>
            </table>
          )}
        </>
      )}
      <CallToAction className="mt-0" supportedNetwork={!!paymentStreamsLib}>
        <Button onClick={onCreateStreamButtonClick}>
          {t('create-stream')}
        </Button>
      </CallToAction>
    </>
  )
}

export default StreamTables
