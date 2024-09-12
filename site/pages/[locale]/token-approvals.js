import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useContext, useEffect, useState } from 'react'

import Button from '../../components/Button'
import PureContext from '../../components/context/Pure'
import Input from '../../components/Input'
import InputBalance from '../../components/InputBalance'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilFormBox from '../../components/layout/UtilFormBox'
import { useFormButton } from '../../hooks/useFormButton'
import { useTokenInput } from '../../hooks/useTokenInput'
import { fromUnit, toUnit } from '../../utils'

const helperText = {
  title: 'How Token Approvals Work?',
  text: 'Token approvals allow you to grant permissions to specific addresses to spend your tokens on your behalf. You can approve a specific amount or allow unlimited spending, depending on your needs.',
  questions: [
    {
      title: 'How do I grant token approval?',
      answer:
        'To grant token approval, enter the token address or symbol, the spender address, and the allowance amount.'
    },
    {
      title: 'Is there a fee to grant token approvals?',
      answer:
        'There is a transaction fee to grant token approvals, with the fee amount varying based on network conditions.'
    }
  ]
}

const useAllowanceInput = function (
  token,
  spender,
  allowance,
  setAllowance,
  setFeedback
) {
  const { account, active, chainId } = useWeb3React()
  const { tokenApprovals } = useContext(PureContext)

  const disabled = !token || !spender || !active || !tokenApprovals

  useEffect(
    function () {
      setAllowance('')
    },
    [active, token, spender]
  )

  useEffect(
    function () {
      if (disabled) {
        return
      }

      tokenApprovals
        .allowance(token.address, account, spender.address)
        .then(function (currentAllowance) {
          setAllowance(fromUnit(currentAllowance, token.decimals))
        })
        .catch(function (err) {
          setFeedback('error', err.message)
        })
    },
    [token, spender, account, chainId]
  )

  const handleChange = function (e) {
    const re = /^(([1-9][0-9]*)?[0-9](\.[0-9]*)?|\.[0-9]+)$/ // Decimal number
    if (e.target.value === '' || re.test(e.target.value)) {
      setAllowance(e.target.value)
    }
  }

  return {
    disabled,
    onChange: handleChange,
    token: token && token.symbol,
    value: allowance
  }
}

const useFeedback = function () {
  const { account, active } = useWeb3React()

  const [feedback, _setFeedback] = useState({ message: '' })

  useEffect(
    function () {
      _setFeedback({ message: '' })
    },
    [account, active]
  )

  const setFeedback = function (type, message) {
    const colors = {
      error: 'text-red-600',
      success: 'text-green-600'
    }
    const color = colors[type] || 'text-black'
    _setFeedback({ color, message })
  }

  return [feedback, setFeedback]
}

const TokenApprovalsForm = function () {
  const t = useTranslations()
  const { account } = useWeb3React()
  const { tokenApprovals } = useContext(PureContext)
  const { query } = useRouter()

  const [token, setToken] = useState(null)
  const tokenInput = useTokenInput(query.token, setToken)

  const [spender, setSpender] = useState(null)
  const spenderInput = useTokenInput(query.spender, setSpender, true)

  const [allowance, setAllowance] = useState('')
  const allowanceInput = useAllowanceInput(
    token,
    spender,
    allowance,
    setAllowance
  )

  const [feedback, setFeedback] = useFeedback()

  // Depending on the progress state of the approval operation, set the feedback
  // color and message.
  const onProgress = function (err, state) {
    if (err) {
      setFeedback('error', err.message)
      return
    }

    const messages = {
      info: t('approval-in-progress'),
      success: t('approval-succeeded')
    }
    setFeedback(state, messages[state])
  }

  // Set the approval buttons behavior, linking to the contract calls and
  // progress feedback.
  const approveDisabled = !allowance
  const approveButton = useFormButton(
    approveDisabled,
    () =>
      tokenApprovals.approve(
        token.address,
        spender.address,
        toUnit(allowance, token.decimals)
      ),
    onProgress
  )
  const infiniteButton = useFormButton(
    approveDisabled,
    () =>
      tokenApprovals
        .approveInfinite(token.address, spender.address)
        .then(() =>
          tokenApprovals
            .allowance(token.address, account, spender.address)
            .then(setAllowance)
        ),
    onProgress
  )

  return (
    <UtilFormBox
      text={t('utilities-text.token-approvals')}
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
        className="mb-4"
        suffix={token && token.symbol}
        title={t('allowance')}
        {...allowanceInput}
      />

      <p
        className="text-orange-950 hover:text-orange-500 text-right cursor-pointer"
        {...infiniteButton}
      >
        {t('approve-infinite')}
      </p>

      <Button {...approveButton} className="mt-4">
        {t('approve-allowance')}
      </Button>

      {feedback.message && (
        <p className={`text-center text-sm mt-6 ${feedback.color}`}>
          {feedback.message}
        </p>
      )}
    </UtilFormBox>
  )
}

const TokenApprovals = function () {
  const t = useTranslations()
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
