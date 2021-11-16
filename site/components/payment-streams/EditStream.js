import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import { useStreams } from '../../hooks/useStreams'
import Input from '../Input'
import Button from '../Button'
import { fromUnit, toUnit } from '../../utils'
import { updateStreamInfo } from '../../utils/streams'
import * as timeUtils from '../../utils/time'
import PaymentStreamsLibContext from './PaymentStreamsLib'
import EndTime from './EndTime'
import { useWeb3React } from '@web3-react/core'
import { isAddress } from 'web3-utils'
import TransactionsContext from '../context/Transactions'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const EditRate = function ({ stream }) {
  const { active, account } = useWeb3React()
  const router = useRouter()
  const { t } = useTranslation('payment-streams')
  const { t: tCommon } = useTranslation('common')

  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const { addTransactionStatus } = useContext(TransactionsContext)

  const { streamId } = router.query
  const { mutate } = useStreams()
  const [newUsdAmount, setNewUsdAmount] = useState('')
  const [years, setYears] = useState(0)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)

  const originalUsdAmount = stream?.usdAmount
  const streamingTime =
    timeUtils.yearsToSeconds(years) +
    timeUtils.daysToSeconds(days) +
    timeUtils.hoursToSeconds(hours)

  useEffect(
    function () {
      if (newUsdAmount || !originalUsdAmount) {
        return
      }
      setNewUsdAmount(fromUnit(originalUsdAmount, 18))
    },
    [newUsdAmount, setNewUsdAmount, originalUsdAmount]
  )

  const canSubmit =
    active &&
    newUsdAmount.length > 0 &&
    !isNaN(newUsdAmount) &&
    Big(newUsdAmount).gt('0') &&
    streamingTime > 0

  const updateFundRate = function (e) {
    e.preventDefault()
    const now = Math.floor(new Date().getTime() / 1000)
    const newEndTime = now + streamingTime
    const { emitter } = paymentStreamsLib.updateFundingRate(
      streamId,
      Big(toUnit(newUsdAmount, 18)).toFixed(0),
      newEndTime
    )

    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'update-funding-rate',
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
        updateStreamInfo({
          id: streamId,
          lib: paymentStreamsLib,
          account,
          streamsView: 'outgoing'
        })
          .then(() => mutate())
          .catch(console.error)
        router.push('/payment-streams')
      })
      .on('error', function (err) {
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
  }

  return (
    <form
      className="flex flex-col items-center mx-auto w-full max-w-lg"
      onSubmit={updateFundRate}
    >
      <Input
        onChange={e => setNewUsdAmount(e.target.value)}
        suffix="USD"
        title={tCommon('value')}
        value={newUsdAmount}
      />
      <EndTime
        days={days}
        hours={hours}
        onDaysChange={setDays}
        onHoursChange={setHours}
        onYearsChange={setYears}
        years={years}
      />
      <div className="flex">
        <Button className="w-19 m-1" disabled={!canSubmit}>
          {t('save-fund-rate')}
        </Button>
      </div>
    </form>
  )
}

const EditFundingAddress = function ({ stream }) {
  const { active, account } = useWeb3React()
  const { t } = useTranslation('payment-streams')
  const { addTransactionStatus } = useContext(TransactionsContext)
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const [newFundingAddress, setNewFundingAddress] = useState('')
  const router = useRouter()
  const { streamId } = router.query
  const { mutate } = useStreams()

  const originalFundingAddress = stream.fundingAddress
  const { payee } = stream

  useEffect(
    function () {
      if (newFundingAddress || !originalFundingAddress) {
        return
      }
      setNewFundingAddress(originalFundingAddress)
    },
    [newFundingAddress, setNewFundingAddress, originalFundingAddress]
  )

  const updateFundAddress = function (e) {
    e.preventDefault()
    const now = Math.floor(new Date().getTime() / 1000)
    const { emitter } = paymentStreamsLib.updateFundingAddress(
      streamId,
      newFundingAddress
    )

    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'update-funding-address',
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
          id: streamId,
          lib: paymentStreamsLib,
          account,
          streamsView: 'outgoing'
        }).then(() => mutate())
        router.push('/payment-streams')
      })
      .on('error', function (err) {
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
  }

  const canSubmit =
    active &&
    isAddress(newFundingAddress) &&
    originalFundingAddress !== newFundingAddress &&
    newFundingAddress !== ZERO_ADDRESS &&
    newFundingAddress !== payee
  return (
    <form
      className="flex flex-col items-center mx-auto w-full max-w-lg"
      onSubmit={updateFundAddress}
    >
      <Input
        onChange={e => setNewFundingAddress(e.target.value)}
        title={t('funding-address')}
        value={newFundingAddress}
      />
      <div className="mt-4">
        <Button className="w-19 m-1" disabled={!canSubmit}>
          {t('save-funding-address')}
        </Button>
      </div>
    </form>
  )
}

const EditStream = function () {
  const router = useRouter()
  const { active } = useWeb3React()
  const { streamId } = router.query
  const { t } = useTranslation('payment-streams')
  const { streams = { outgoing: [] }, isLoading } = useStreams()

  if (!active) {
    router.push('/payment-streams')
    return null
  }

  if (isLoading) {
    return <p>{t('loading-stream', { streamId })}</p>
  }

  const stream = streams.outgoing.find(s => s.id === streamId)
  if (!stream) {
    router.push('/payment-streams')
    return null
  }

  return (
    <>
      <section>
        <h1 className="capitalize-first text-center text-lg font-bold">
          {t('update-rate')}
        </h1>
        <EditRate stream={stream} />
      </section>
      <section className="mt-7">
        <h1 className="capitalize-first text-center text-lg font-bold">
          {t('update-funding-address')}
        </h1>
        <EditFundingAddress stream={stream} />
      </section>
    </>
  )
}

export default EditStream
