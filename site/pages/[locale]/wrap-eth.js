import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { findByChainId } from 'chain-list'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'
import { findTokenBySymbol } from 'token-list'
import watchAsset from 'wallet-watch-asset'

import Button from '../../components/Button'
import PureContext from '../../components/context/Pure'
import InputBalance from '../../components/InputBalance'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilFormBox from '../../components/layout/UtilFormBox'
import SvgContainer from '../../components/svg/SvgContainer'
import { useBalance } from '../../hooks/useBalance'
import { fromUnit, sweepDust, toFixed, toUnit } from '../../utils'
import CallToAction from '../../components/CallToAction'

const Operation = {
  Unwrap: 2,
  Wrap: 1
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
  const { active, account, chainId } = useWeb3React()
  const { erc20 } = useContext(PureContext)
  const [operation, setOperation] = useState(Operation.Wrap)
  const { data: ethBalance, mutate: reloadEthBalance } = useBalance({
    symbol: 'ETH'
  })
  const { data: wEthBalance, mutate: reloadWethBalance } = useBalance({
    symbol: 'WETH'
  })
  const [value, setValue] = useState('')
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.wrap-unwrap')
  const [errorMessage, setErrorMessage] = useTemporalMessage()
  const [successMessage, setSuccessMessage] = useTemporalMessage()
  const { nativeTokenSymbol = 'ETH' } = findByChainId(chainId)
  const helperText = {
    title: tHelperText('title'),
    text: (
      <>
        <p>
          <span className="text-black">{tHelperText('text.wrap-title')}</span>{' '}
          {tHelperText('text.wrap-content')}
        </p>
        <p className="mt-2">
          <span className="text-black">{tHelperText('text.unwrap-title')}</span>{' '}
          {tHelperText('text.unwrap-content')}
        </p>
      </>
    ),
    questions: [
      {
        title: tHelperText('what-is-question'),
        answer: tHelperText('what-is-answer')
      },
      {
        title: tHelperText('why-wrap-question'),
        answer: tHelperText('why-wrap-answer')
      },
      {
        title: tHelperText('fee-question'),
        answer: tHelperText('fee-answer')
      }
    ]
  }

  const isValidNumber =
    value !== '' &&
    /^(0|[1-9]\d*)(\.\d+)?$/.test(value) &&
    Big(value).gt(Big(0))

  const valueInWei = Big(toUnit(isValidNumber ? value : 0)).toFixed(0)
  const isWrapping = operation === Operation.Wrap

  const handleSubmit = function (e) {
    e.preventDefault()
    if (!active || !isValidNumber) {
      return null
    }

    const erc20Service = erc20(account)

    // Work around chain id issues with Ganache. Then find WETH token info.
    const _chainId = chainId === 1337 ? 1 : chainId
    const weth = findTokenBySymbol('WETH', _chainId)

    if (isWrapping) {
      return erc20Service
        .wrapEther(valueInWei)
        .then(function () {
          setSuccessMessage(t('wrap-eth-success', { nativeTokenSymbol, value }))
          setValue('')
        })
        .then(() =>
          Promise.all([
            watchAsset({ account, token: weth }),
            reloadEthBalance(),
            reloadWethBalance()
          ])
        )
        .catch(err => setErrorMessage(err.message))
    }

    return erc20Service
      .unwrapEther(sweepDust(valueInWei, wEthBalance))
      .then(function () {
        setSuccessMessage(t('unwrap-weth-success', { value }))
        setValue('')
        return Promise.all([reloadEthBalance(), reloadWethBalance()])
      })
      .catch(err => setErrorMessage(err.message))
  }

  const getBalance = balance => {
    const Decimals = 6

    if (!active || !Big(balance).gt) {
      return null
    }

    return Big(balance).gt(0) ? toFixed(fromUnit(balance), Decimals) : '0'
  }

  const destinyToken = isWrapping ? 'WETH' : nativeTokenSymbol
  const originToken = isWrapping ? nativeTokenSymbol : 'WETH'

  const destinyBalance = isWrapping ? wEthBalance : ethBalance
  const originBalance = isWrapping ? ethBalance : wEthBalance

  const canWrap = Big(ethBalance ? ethBalance : '0').gt(valueInWei)
  const canUnwrap = Big(wEthBalance ? wEthBalance : '-1').gte(valueInWei)

  const toogleOperation = () => {
    if (operation === Operation.Wrap) {
      setOperation(Operation.Unwrap)
    } else {
      setOperation(Operation.Wrap)
    }
  }

  const setMax = () => {
    setValue(getBalance(originBalance))
  }

  const decimalRegex = /^(([1-9][0-9]*)?[0-9](\.[0-9]*)?|\.[0-9]+)$/
  const handleChange = function (e) {
    if (e.target.value === '' || decimalRegex.test(e.target.value)) {
      setValue(e.target.value)
    }
  }

  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('wrap-unwrap-eth', { nativeTokenSymbol })}
      walletConnection
    >
      <UtilFormBox
        text={t('utilities-text.wrap-unwrap')}
        title={t('wrap-unwrap-eth', { nativeTokenSymbol })}
      >
        <form className="mx-auto w-full max-w-lg" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col items-center justify-center gap-2">
            <InputBalance
              balance={getBalance(originBalance)}
              onChange={handleChange}
              placeholder="-"
              setMax={setMax}
              showMax={true}
              title={t('enter-amount-here')}
              token={originToken}
              value={value}
            />

            <SvgContainer
              className="absolute cursor-pointer"
              name="arrows"
              onClick={toogleOperation}
            />

            <InputBalance
              balance={getBalance(destinyBalance)}
              disabled
              placeholder="0.00"
              title={t('you-will-get')}
              token={destinyToken}
              value={value || ''}
            />
          </div>

          <div className="mt-7.5">
            <CallToAction>
              <Button
                className="normal-case"
                disabled={
                  !active ||
                  !isValidNumber ||
                  (operation === Operation.Wrap && !canWrap) ||
                  (operation === Operation.Unwrap && !canUnwrap)
                }
              >
                {t(operation === Operation.Wrap ? 'wrap' : 'unwrap', {
                  nativeTokenSymbol
                })}
              </Button>
            </CallToAction>
          </div>
        </form>
        {!!errorMessage && (
          <p className="mt-6 text-center text-sm text-red-600">
            {errorMessage}
          </p>
        )}
        {!!successMessage && (
          <p className="mt-6 text-center text-sm text-green-400">
            {successMessage}
          </p>
        )}
      </UtilFormBox>
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default WrapUnwrapEth
