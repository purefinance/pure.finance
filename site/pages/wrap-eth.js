import { useState, useContext, useEffect } from 'react'
import Big from 'big.js'
import { useWeb3React } from '@web3-react/core'
import Layout from '../components/Layout'
import useTranslation from 'next-translate/useTranslation'
import Input from '../components/Input'
import Button from '../components/Button'
import PureContext from '../components/context/Pure'
import { toUnit } from '../utils'
import { useRegisterToken } from '../hooks/useRegisterToken'

const Operation = {
  Wrap: 1,
  Unwrap: 2
}

const useTemporalMessage = function () {
  const state = useState()
  const [text, setText] = state
  useEffect(
    function () {
      if (!text) {
        return
      }
      const CLEANUP_TEXT_MS = 5000
      const timeoutId = setTimeout(() => setText(undefined), CLEANUP_TEXT_MS)
      return () => clearTimeout(timeoutId)
    },
    [text, setText]
  )

  return state
}

const WrapUnwrapEth = function () {
  const { active, account, library } = useWeb3React()
  const { erc20 } = useContext(PureContext)
  const [operation, setOperation] = useState(Operation.Wrap)
  const [value, setValue] = useState('')
  const { t } = useTranslation('common')

  const registerToken = useRegisterToken({ symbol: 'WETH' })

  const [errorMessage, setErrorMessage] = useTemporalMessage()
  const [successMessage, setSuccessMessage] = useTemporalMessage()

  const isValidNumber =
    value !== '' &&
    /^(0|[1-9]\d*)(\.\d+)?$/.test(value) &&
    Big(value).gt(Big(0))

  const handleSubmit = function (e) {
    e.preventDefault()
    if (!active || !isValidNumber) {
      return
    }

    const erc20Service = erc20(account)

    const valueInWei = Big(toUnit(value)).toFixed(0)

    const isWrapping = operation === Operation.Wrap

    if (isWrapping) {
      return library.eth
        .getBalance(account, 'latest')
        .then(function (balance) {
          if (Big(balance).lt(valueInWei)) {
            return Promise.reject(new Error(t('not-enough-funds-wrap')))
          }
          return erc20Service.wrapEther(valueInWei)
        })
        .then(() => {
          setSuccessMessage(t('wrap-eth-success', { value }))
          setValue('')
        })
        .then(() => registerToken())
        .catch((err) => setErrorMessage(err.message))
    }

    return erc20Service
      .wrappedEtherBalanceOf()
      .then(function (balance) {
        if (Big(balance).lte(valueInWei)) {
          return Promise.reject(new Error(t('not-enough-funds-unwrap')))
        }
        return erc20Service.unwrapEther(valueInWei)
      })
      .then(() => {
        setSuccessMessage(t('unwrap-weth-success', { value }))
        setValue('')
      })
      .catch((err) => setErrorMessage(err.message))
  }

  const destinyToken = operation === Operation.Wrap ? 'WETH' : 'ETH'
  const originToken = operation === Operation.Wrap ? 'ETH' : 'WETH'
  const isWrapDisabled = operation === Operation.Wrap
  const isUnwrapDisabled = operation === Operation.Unwrap

  return (
    <Layout title={t('wrap-unwrap-eth')} walletConnection>
      <form
        className="flex flex-col items-center w-full max-w-lg mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-center w-full my-7">
          <button
            className={`w-full capitalize h-10 ${
              isWrapDisabled
                ? 'bg-gray-800 text-white cursor-not-allowed'
                : 'hover:bg-gray-800 hover:text-white'
            }`}
            disabled={isWrapDisabled}
            onClick={() => setOperation(Operation.Wrap)}
          >
            {t('wrap')}
          </button>
          <button
            className={`w-full capitalize h-10 ${
              isUnwrapDisabled
                ? 'bg-gray-800 text-white cursor-not-allowed'
                : 'hover:bg-gray-800 hover:text-white'
            }`}
            disabled={isUnwrapDisabled}
            onClick={() => setOperation(Operation.Unwrap)}
          >
            {t('unwrap')}
          </button>
        </div>
        <div className="w-full mb-7">
          <Input
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('enter-amount-here')}
            suffix={originToken}
            value={value}
          />
        </div>
        <div className="w-full">
          <Input
            disabled
            suffix={destinyToken}
            title={t('you-will-get')}
            value={value || '-'}
          />
        </div>
        <Button
          className="capitalize mt-7.5"
          disabled={!active || !isValidNumber}
        >
          {t(operation === Operation.Wrap ? 'wrap' : 'unwrap')}
        </Button>
      </form>
      {!!errorMessage && (
        <p className="mt-6 text-sm text-center text-red-600">{errorMessage}</p>
      )}
      {!!successMessage && (
        <p className="mt-6 text-sm text-center text-green-400">
          {successMessage}
        </p>
      )}
    </Layout>
  )
}

export default WrapUnwrapEth
