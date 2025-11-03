import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'

import Button from '../../components/Button'
import CallToAction from '../../components/CallToAction'
import PureContext from '../../components/context/Pure'
import Input from '../../components/Input'
import InputBalance from '../../components/InputBalance'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilityForm from '../../components/layout/UtilityForm'
import { TextButton } from '../../components/TextButton'
import { TextLabel } from '../../components/TextLabel'
import { useEphemeralState } from '../../hooks/useEphemeralState'
import { useFormProgress } from '../../hooks/useFormProgress'
import { useTokenInput } from '../../hooks/useTokenInput'
import { fromUnit, toUnit } from '../../utils'

const inputDecimalNumber = /^(([1-9]\d*)?\d(\.\d*)?|\.\d+)$/
const infiniteSymbol = '∞'

const TokenApprovalsForm = function () {
  const { account, active, chainId } = useWeb3React()
  const { query } = useRouter()
  const { tokenApprovals } = useContext(PureContext)
  const t = useTranslations()

  const [allowance, setAllowance] = useState('')
  const [result, setResult] = useEphemeralState({ value: '' })
  const [spender, setSpender] = useState(null)
  const [token, setToken] = useState(null)
  const spenderInput = useTokenInput(query.spender, setSpender, true)
  const tokenInput = useTokenInput(query.token, setToken)

  const canRefreshAllowance = tokenApprovals && token && spender
  const canApprove = tokenApprovals && token && spender && allowance
  const isInfinite = allowance === infiniteSymbol

  useEffect(
    function resetForm() {
      setAllowance('')
    },
    [account, active, chainId]
  )

  useEffect(
    function refreshAllowance() {
      if (!canRefreshAllowance) {
        return
      }

      tokenApprovals
        .allowance(token.address, account, spender.address)
        .then(function (currentAllowance) {
          if (Big(currentAllowance).lte(token.totalSupply)) {
            setAllowance(fromUnit(currentAllowance, token.decimals))
          } else {
            setAllowance(infiniteSymbol)
          }
        })
        .catch(function (err) {
          setResult({ color: 'text-error', value: err.message })
        })
    },
    [account, canRefreshAllowance, setResult, spender, token, tokenApprovals]
  )

  const onAllowanceChange = function (e) {
    if (e.target.value === '' || inputDecimalNumber.test(e.target.value)) {
      setAllowance(e.target.value)
    }
  }

  const onAllowInfiniteClick = function () {
    setAllowance(infiniteSymbol)
  }

  const handleSubmit = () =>
    isInfinite
      ? tokenApprovals.approveInfinite(token.address, spender.address)
      : tokenApprovals.approve(
          token.address,
          spender.address,
          toUnit(allowance, token.decimals)
        )

  const onProgress = function (state, message) {
    const values = {
      error: message || t('error-unknown'),
      info: t('approval-in-progress'),
      success: t('approval-succeeded')
    }
    setResult({ color: `text-${state}`, value: values[state] })
  }

  const { canSubmit, onSubmit } = useFormProgress(
    !canApprove,
    handleSubmit,
    onProgress
  )

  return (
    <UtilityForm
      onSubmit={onSubmit}
      subtitle={t('utilities-text.token-approvals')}
      title={t('token-approvals')}
    >
      <Input
        placeholder={t('token-address-placeholder')}
        title={t('token-address')}
        {...tokenInput}
      />
      <Input
        placeholder={t('spender-address-placeholder')}
        title={t('spender-address')}
        {...spenderInput}
      />
      <InputBalance
        disabled={!active}
        onChange={onAllowanceChange}
        placeholder="-"
        suffix={token?.symbol}
        title={t('allowance')}
        token={token && token.symbol}
        value={allowance}
      />
      <div className="mr-2 mt-4 flex justify-end">
        <TextButton disabled={!active} onClick={onAllowInfiniteClick}>
          {t('allow-infinite')}
        </TextButton>
      </div>
      <CallToAction>
        <Button disabled={!canSubmit} type="submit">
          {t('approve-allowance')}
        </Button>
      </CallToAction>
      <TextLabel {...result} />
    </UtilityForm>
  )
}

const TokenApprovals = function () {
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.token-approvals')

  const helperText = {
    questions: [
      {
        answer: tHelperText('how-grant-answer'),
        title: tHelperText('how-grant-question')
      },
      {
        answer: tHelperText('fee-answer'),
        title: tHelperText('fee-question')
      }
    ],
    text: tHelperText('text'),
    title: tHelperText('title')
  }

  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('token-approvals')}
      walletConnection
    >
      <TokenApprovalsForm />
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'

export default TokenApprovals
