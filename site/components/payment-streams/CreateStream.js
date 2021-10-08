import { useContext, useState } from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import Input from '../../components/Input'
import Button from '../../components/Button'
import PaymentStreamsLibContext from '../../components/payment-streams/paymentStreamsLib'
import EndTime from '../../components/payment-streams/EndTime'
import { useTokenInput } from '../../hooks/useTokenInput'
import { fromUnit, toUnit } from '../../utils'
import * as timeUtils from '../../utils/time'
import { isAddress } from 'web3-utils'
import TransactionsContext from '../context/Transactions'
import { useStreams } from '../../hooks/useStreams'
import { useRouter } from 'next/router'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const CreateStream = function () {
  const { active, account } = useWeb3React()
  const { t } = useTranslation('payment-streams')
  const { t: tCommon } = useTranslation('common')
  const router = useRouter()
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const { addTransactionStatus } = useContext(TransactionsContext)
  const { mutate } = useStreams()
  const [payee, setPayee] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [years, setYears] = useState(0)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const tokenInput = useTokenInput()

  const streamingTime =
    timeUtils.yearsToSeconds(years) +
    timeUtils.daysToSeconds(days) +
    timeUtils.hoursToSeconds(hours)
  const canSubmit =
    active &&
    isAddress(payee) &&
    account !== payee &&
    ZERO_ADDRESS !== payee &&
    usdAmount.length > 0 &&
    !isNaN(usdAmount) &&
    Big(usdAmount).gt('0') &&
    isAddress(tokenInput.value) &&
    streamingTime > 0

  const submit = function (e) {
    e.preventDefault()
    if (!canSubmit) {
      return
    }
    const now = Math.floor(new Date().getTime() / 1000)
    const endTime = now + streamingTime
    const { emitter } = paymentStreamsLib.createStream(
      payee,
      Big(toUnit(usdAmount, 18)).toFixed(0),
      tokenInput.value,
      endTime
    )

    emitter
      .on('transactions', function (transactions) {
        addTransactionStatus({
          expectedFee: fromUnit(transactions.expectedFee),
          operation: 'add-stream',
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
        mutate()
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
      onSubmit={submit}
    >
      <Input
        onChange={e => setPayee(e.target.value)}
        title={t('payee')}
        value={payee}
      />
      <Input
        onChange={e => setUsdAmount(e.target.value)}
        suffix="USD"
        title={tCommon('value')}
        value={usdAmount}
      />
      <Input
        placeholder={tCommon('token-address-placeholder')}
        title={`${tCommon('token-address')}`}
        {...tokenInput}
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
        <Link href="/payment-streams">
          <a>
            <Button className="w-19 m-1">{tCommon('cancel')}</Button>
          </a>
        </Link>
        <Button className="w-19 m-1" disabled={!canSubmit}>
          {t('create')}
        </Button>
      </div>
    </form>
  )
}

export default CreateStream
