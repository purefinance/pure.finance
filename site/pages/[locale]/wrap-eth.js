import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { findByChainId } from 'chain-list'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'
import { findTokenBySymbol } from 'token-list'
import watchAsset from 'wallet-watch-asset'

import Button from '../../components/Button'
import PureContext from '../../components/context/Pure'
import Input from '../../components/Input'
import Layout from '../../components/Layout'
import Tabs from '../../components/Tabs'
import UtilFormBox from '../../components/UtilFormBox'
import { useBalance } from '../../hooks/useBalance'
import { fromUnit, sweepDust, toFixed, toUnit } from '../../utils'

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
  const t = useTranslations()

  const [errorMessage, setErrorMessage] = useTemporalMessage()
  const [successMessage, setSuccessMessage] = useTemporalMessage()
  const { nativeTokenSymbol = 'hETH' } = findByChainId(chainId)

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

  const destinyToken = isWrapping ? 'WETH' : nativeTokenSymbol
  const originToken = isWrapping ? nativeTokenSymbol : 'WETH'
  const canWrap = Big(ethBalance ? ethBalance : '0').gt(valueInWei)
  const canUnwrap = Big(wEthBalance ? wEthBalance : '-1').gte(valueInWei)

  const isWrapDisabled = operation === Operation.Wrap
  const isUnwrapDisabled = operation === Operation.Unwrap

  const wrapCaption = {
    balance: ethBalance,
    isLoading: isLoadingEthBalance,
    symbol: nativeTokenSymbol
  }
  const unwrapCaption = {
    balance: wEthBalance,
    isLoading: isLoadingWethBalance,
    symbol: 'WETH'
  }

  return (
    <Layout walletConnection>
      <UtilFormBox title={t('wrap-unwrap-eth', { nativeTokenSymbol })}>
        <form className="mx-auto w-full max-w-lg" onSubmit={handleSubmit}>
          <Tabs
            className="mb-6"
            items={[
              {
                label: t('wrap', { nativeTokenSymbol }),
                onClick: () => setOperation(Operation.Wrap),
                selected: isWrapDisabled
              },
              {
                label: t('unwrap', { nativeTokenSymbol }),
                onClick: () => setOperation(Operation.Unwrap),
                selected: isUnwrapDisabled
              }
            ]}
          />

          <div className="mb-7 w-full">
            <Input
              caption={getBalanceCaption(
                isWrapping ? wrapCaption : unwrapCaption
              )}
              onChange={e => setValue(e.target.value)}
              placeholder="0.00"
              suffix={originToken}
              title={t('enter-amount-here')}
              value={value}
            />
          </div>
          <div className="w-full">
            <Input
              caption={getBalanceCaption(
                isWrapping ? unwrapCaption : wrapCaption
              )}
              disabled
              placeholder="0.00"
              suffix={destinyToken}
              title={t('you-will-get')}
              value={value || ''}
            />
          </div>
          <Button
            className="mt-7.5 uppercase"
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
        </form>
        {!!errorMessage && (
          <p className="mt-6 text-center text-red-600 text-sm">
            {errorMessage}
          </p>
        )}
        {!!successMessage && (
          <p className="mt-6 text-center text-green-400 text-sm">
            {successMessage}
          </p>
        )}
      </UtilFormBox>
    </Layout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default WrapUnwrapEth
