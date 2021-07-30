import { useContext, useEffect, useState } from 'react'
import Big from 'big.js'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'

import { fromUnit, toFixed, toUnit } from '../utils'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'
import { useBalance } from '../hooks/useBalance'
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
  const { active, account } = useWeb3React()
  const { erc20 } = useContext(PureContext)
  const [operation, setOperation] = useState(Operation.Wrap)
  const {
    data: ethBalance,
    isLoading: isLoadingEthBalance,
    mutate: reloadEthBalance
  } = useBalance({ symbol: 'ETH' })
  const {
    data: wEthBalance,
    isLoading: isLoadingWethBalance,
    mutate: reloadWethBalance
  } = useBalance({ symbol: 'WETH' })
  const [value, setValue] = useState('')
  const { t } = useTranslation('common')

  const registerToken = useRegisterToken()

  const [errorMessage, setErrorMessage] = useTemporalMessage()
  const [successMessage, setSuccessMessage] = useTemporalMessage()

  const isValidNumber =
    value !== '' &&
    /^(0|[1-9]\d*)(\.\d+)?$/.test(value) &&
    Big(value).gt(Big(0))

  const valueInWei = Big(toUnit(isValidNumber ? value : 0)).toFixed(0)
  const isWrapping = operation === Operation.Wrap

  const handleSubmit = function (e) {
    e.preventDefault()
    if (!active || !isValidNumber) {
      return
    }

    const erc20Service = erc20(account)

    if (isWrapping) {
      return erc20Service
        .wrapEther(valueInWei)
        .then(() => {
          setSuccessMessage(t('wrap-eth-success', { value }))
          setValue('')
        })
        .then(() =>
          Promise.all([
            registerToken({ symbol: 'WETH' }),
            reloadEthBalance(),
            reloadWethBalance()
          ])
        )
        .catch((err) => setErrorMessage(err.message))
    }

    return erc20Service
      .unwrapEther(valueInWei)
      .then(() => {
        setSuccessMessage(t('unwrap-weth-success', { value }))
        setValue('')
        return Promise.all([reloadEthBalance(), reloadWethBalance()])
      })
      .catch((err) => setErrorMessage(err.message))
  }

  const getBalanceCaption = function ({ balance = '0', isLoading, symbol }) {
    if (!active) {
      return null
    }
    if (isLoading) {
      return t('loading-balance')
    }
    const Decimals = 6
    return t('your-balance-is', {
      balance: Big(balance).gt(0) ? toFixed(fromUnit(balance), Decimals) : '0',
      symbol
    })
  }

  const destinyToken = isWrapping ? 'WETH' : 'ETH'
  const originToken = isWrapping ? 'ETH' : 'WETH'
  const canWrap = Big(ethBalance ? ethBalance : '0').gt(valueInWei)
  const canUnwrap = Big(wEthBalance ? wEthBalance : '-1').gte(valueInWei)

  const isWrapDisabled = operation === Operation.Wrap
  const isUnwrapDisabled = operation === Operation.Unwrap

  const wrapCaption = {
    balance: ethBalance,
    symbol: 'ETH',
    isLoading: isLoadingEthBalance
  }
  const unwrapCaption = {
    balance: wEthBalance,
    symbol: 'WETH',
    isLoading: isLoadingWethBalance
  }

  return (
    <Layout title={t('wrap-unwrap-eth')} walletConnection>
      <form
        className="flex flex-col items-center w-full max-w-lg mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-center w-full my-7">
          <button
            className={`w-full capitalize h-10 border-b ${
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
            className={`w-full capitalize h-10 border-b ${
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
            caption={getBalanceCaption(
              isWrapping ? wrapCaption : unwrapCaption
            )}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t('enter-amount-here')}
            suffix={originToken}
            value={value}
          />
        </div>
        <div className="w-full">
          <Input
            caption={getBalanceCaption(
              isWrapping ? unwrapCaption : wrapCaption
            )}
            disabled
            suffix={destinyToken}
            title={t('you-will-get')}
            value={value || '-'}
          />
        </div>
        <Button
          className="uppercase mt-7.5"
          disabled={
            !active ||
            !isValidNumber ||
            (operation === Operation.Wrap && !canWrap) ||
            (operation === Operation.Unwrap && !canUnwrap)
          }
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

export const getStaticProps = () => ({})
export default WrapUnwrapEth
