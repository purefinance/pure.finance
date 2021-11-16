import { useContext, useState } from 'react'
import Big from 'big.js'
import Link from 'next/link'
import { isAddress } from 'web3-utils'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'

import * as timeUtils from '../../utils/time'
import { fromUnit, toUnit } from '../../utils'
import Button from '../../components/Button'
import EndTime from '../../components/payment-streams/EndTime'
import Input from '../../components/Input'
import PaymentStreamsLibContext from '../../components/payment-streams/PaymentStreamsLib'
import TransactionsContext from '../context/Transactions'
import { useStreams } from '../../hooks/useStreams'
import { useTokenInput } from '../../hooks/useTokenInput'
import { findToken } from 'pf-payment-streams/src/token-list'

import fetchJson from '../../utils/fetch-json'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const useSupportedTokens = function () {
  const { data, error } = useSWR('supported-tokens', () =>
    fetchJson('https://cl-docs-addresses.web.app/addresses.json').then(
      json =>
        json?.['ethereum-addresses'].networks.find(
          ({ name }) => name === 'Ethereum Mainnet'
        )?.proxies ?? []
    )
  )

  return {
    tokens: data,
    error,
    isLoading: data === undefined && error === undefined
  }
}

// eslint-disable-next-line complexity
const CreateStream = function () {
  const { active, account } = useWeb3React()
  const { t } = useTranslation('payment-streams')
  const { t: tCommon } = useTranslation('common')
  const router = useRouter()
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)
  const { addTransactionStatus } = useContext(TransactionsContext)
  const { mutate } = useStreams()
  const { tokens = [] } = useSupportedTokens()
  const [payee, setPayee] = useState('')
  const [usdAmount, setUsdAmount] = useState('')
  const [years, setYears] = useState(0)
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const tokenInput = useTokenInput()

  // tokens are in the list in the form of "<token> / [USD|ETH]"" pairs. For example: "UNI / USD"
  // addresses are not available
  const isTokenSupported = function (value) {
    // vesper is registered as "Vesper Finance TVL" - see https://docs.chain.link/docs/ethereum-addresses/#Ethereum%20Mainnet
    const symbol = findToken(value, 1)?.symbol.toLowerCase()
    if (!symbol) {
      return false
    }
    const name = symbol === 'vsp' ? 'vesper' : symbol
    return tokens.some(({ pair }) => pair.toLowerCase().startsWith(name))
  }

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
    !isNaN(Number.parseInt(usdAmount)) &&
    new Big(usdAmount).gt('0') &&
    isAddress(tokenInput.value) &&
    streamingTime > 0 &&
    isTokenSupported(tokenInput.value) &&
    !isCreating

  const submit = function (e) {
    e.preventDefault()
    if (!canSubmit) {
      return
    }
    setIsCreating(true)
    const now = Math.floor(new Date().getTime() / 1000)
    const endTime = now + streamingTime
    const { emitter } = paymentStreamsLib.createStream(
      payee,
      new Big(toUnit(usdAmount, 18)).toFixed(0),
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
        setIsCreating(false)
        mutate()
        router.push('/payment-streams')
      })
      .on('error', function (err) {
        setIsCreating(false)
        addTransactionStatus({
          message: err.message,
          opId: now,
          transactionStatus: 'error'
        })
      })
  }

  let captionColor = tokenInput.captionColor
  let tokenInputCaption = tokenInput.caption
  if (isAddress(tokenInput.value) && !isTokenSupported(tokenInput.value)) {
    captionColor = 'text-red-600'
    tokenInputCaption = t('token-not-approved-for-streams')
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
        caption={tokenInputCaption}
        captionColor={captionColor}
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
