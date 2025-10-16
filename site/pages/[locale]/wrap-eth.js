import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useTranslations } from 'next-intl'
import { useContext, useState } from 'react'
import { findTokenBySymbol } from 'token-list'
import watchAsset from 'wallet-watch-asset'

import Button from '../../components/Button'
import CallToAction from '../../components/CallToAction'
import PureContext from '../../components/context/Pure'
import InputBalance from '../../components/InputBalance'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilityForm from '../../components/layout/UtilityForm'
import SvgContainer from '../../components/svg/SvgContainer'
import { TextLabel } from '../../components/TextLabel'
import { useBalance } from '../../hooks/useBalance'
import { useEphemeralState } from '../../hooks/useEphemeralState'
import { fromUnit, sweepDust, toUnit } from '../../utils'

// This depends on the chain, but all currently supported networks use ETH/WETH.
const nativeTokenSymbol = 'ETH'
const wrappedTokenSymbol = 'WETH'

const Operation = {
  Unwrap: 'Unwrap',
  Wrap: 'Wrap'
}

function WrapUnwrapEthForm() {
  const { account, active, chainId, library } = useWeb3React()
  const { data: ethBalance, mutate: reloadEthBalance } =
    useBalance(nativeTokenSymbol)
  const { data: wethBalance, mutate: reloadWethBalance } =
    useBalance(wrappedTokenSymbol)
  const { erc20 } = useContext(PureContext)
  const t = useTranslations()

  const [operation, setOperation] = useState(Operation.Wrap)
  const [result, setResult] = useEphemeralState({
    color: 'text-black',
    message: ''
  })
  const [value, setValue] = useState('')

  const decimalNumber = /^(0|[1-9]\d*)(\.\d+)?$/
  const isValueValid = decimalNumber.test(value) && Big(value).gt(Big(0))
  const isWrapping = operation === Operation.Wrap

  const fromToken = isWrapping ? nativeTokenSymbol : wrappedTokenSymbol
  const toToken = isWrapping ? wrappedTokenSymbol : nativeTokenSymbol

  const fromBalance = isWrapping ? ethBalance : wethBalance
  const toBalance = isWrapping ? wethBalance : ethBalance

  const canWrap = ethBalance && value && Big(ethBalance).gt(toUnit(value))
  const canUnwrap = wethBalance && value && Big(wethBalance).gte(toUnit(value))

  const onAmountChange = function (event) {
    const decimalRegex = /^(([1-9]\d*)?\d(\.\d*)?|\.\d+)$/
    if (event.target.value === '' || decimalRegex.test(event.target.value)) {
      setValue(event.target.value)
    }
  }

  function setMaxAmount() {
    setValue(fromUnit(fromBalance))
  }

  function toggleOperation() {
    setOperation(isWrapping ? Operation.Unwrap : Operation.Wrap)
    setValue('')
  }

  const handleSubmit = function (event) {
    event.preventDefault()

    if (!active || !isValueValid) {
      return null
    }

    const erc20Service = erc20(account)
    const valueInUnits = toUnit(value)
    const _chainId = chainId === 1337 ? 1 : chainId // Workaround for Ganache
    const weth = findTokenBySymbol(wrappedTokenSymbol, _chainId)

    const operationPromise = isWrapping
      ? erc20Service.wrapEther(valueInUnits).then(function () {
          watchAsset(
            library.currentProvider,
            account,
            weth,
            localStorage
          ).catch(() => null) // Ignore errors from watchAsset
          return t('wrap-eth-success', { nativeTokenSymbol, value })
        })
      : erc20Service
          .unwrapEther(sweepDust(valueInUnits, wethBalance))
          .then(() => t('unwrap-weth-success', { value, wrappedTokenSymbol }))

    return operationPromise
      .then(function (message) {
        setResult({ color: 'text-success', message })
        setValue('')
        reloadEthBalance()
        reloadWethBalance()
      })
      .catch(function (err) {
        const message = err.message.split('\n')[0]
        setResult({ color: 'text-error', message })
      })
  }

  return (
    <UtilityForm
      onSubmit={handleSubmit}
      subtitle={t('utilities-text.wrap-unwrap')}
      title={t('wrap-unwrap-eth', { nativeTokenSymbol })}
    >
      <div className="flex w-full flex-col items-center justify-center gap-2">
        <InputBalance
          balance={fromBalance && fromUnit(fromBalance, 18, 6)}
          onChange={onAmountChange}
          placeholder="-"
          setMax={setMaxAmount}
          showMax={true}
          title={t('enter-amount-here')}
          token={fromToken}
          value={value}
        />
        <SvgContainer
          className="absolute cursor-pointer"
          name="arrows"
          onClick={toggleOperation}
        />
        <InputBalance
          balance={toBalance && fromUnit(toBalance, 18, 6)}
          disabled
          placeholder="0.00"
          title={t('you-will-get')}
          token={toToken}
          value={value}
        />
      </div>
      <CallToAction>
        <Button
          className="normal-case"
          disabled={
            !active ||
            !isValueValid ||
            (operation === Operation.Wrap && !canWrap) ||
            (operation === Operation.Unwrap && !canUnwrap)
          }
          type="submit"
        >
          {t(operation === Operation.Wrap ? 'wrap' : 'unwrap', {
            nativeTokenSymbol
          })}
        </Button>
      </CallToAction>
      <TextLabel color={result.color} value={result.message} />
    </UtilityForm>
  )
}

function WrapUnwrapEth() {
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.wrap-unwrap')

  const helperText = {
    questions: [
      {
        answer: tHelperText('what-is-answer'),
        title: tHelperText('what-is-question')
      },
      {
        answer: tHelperText('why-wrap-answer'),
        title: tHelperText('why-wrap-question')
      },
      {
        answer: tHelperText('fee-answer'),
        title: tHelperText('fee-question')
      }
    ],
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
    title: tHelperText('title')
  }

  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('wrap-unwrap-eth', { nativeTokenSymbol })}
      walletConnection
    >
      <WrapUnwrapEthForm />
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'

export default WrapUnwrapEth
