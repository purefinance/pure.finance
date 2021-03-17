import { isAddress } from 'web3-utils'
import { useContext, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { util } from 'erc-20-lib'
// import debounce from 'lodash.debounce'
import vesperMetadata from 'vesper-metadata'

import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'

import { fromUnit, toUnit } from '../utils'

// TODO add symbol to Vesper pools and fix name
const extraTokens = [].concat(
  vesperMetadata.pools.map((p) => ({ ...p, symbol: p.name })),
  vesperMetadata.tokens
)

const useTokenInput = function (onChange) {
  const { erc20 } = useContext(PureContext)

  const [tokenAddress, setTokenAddress] = useState()
  const [tokenError, setTokenError] = useState()
  const [tokenName, setTokenName] = useState()

  const handleChange = function (e) {
    const { value } = e.target

    setTokenAddress(value)
    setTokenName('')
    setTokenError('')

    const address = isAddress(value)
      ? value
      : util.tokenAddress(value, extraTokens)

    if (!address) {
      onChange(null)
      return
    }

    const contract = erc20(address)
    contract
      .getInfo()
      .then(function (info) {
        onChange(info)
        setTokenName(info.name)
      })
      .catch(function (err) {
        setTokenError('Invalid token address')
        console.warn(err.message)
      })
  }

  return {
    caption: tokenError || tokenName,
    captionColor: tokenError && 'text-red-600',
    disabled: !erc20,
    onChange: handleChange,
    value: tokenAddress
  }
}

const useAllowanceInput = function (tokenInfo, spenderInfo, value, onChange) {
  const { account, erc20 } = useContext(PureContext)

  const disabled = !tokenInfo || !spenderInfo || !erc20 || !account

  useEffect(
    function () {
      if (disabled) {
        onChange()
        return
      }

      const contract = erc20(tokenInfo.address)
      contract
        .allowance(account, spenderInfo.address)
        .then(function (currentAllowance) {
          onChange(fromUnit(currentAllowance, tokenInfo.decimals))
        })
        .catch(function (err) {
          // TODO send message to form feedback
          console.warn(err.message)
        })
    },
    [tokenInfo, spenderInfo]
  )

  const handleChange = function (e) {
    onChange(e.target.value)
  }

  return {
    disabled,
    onChange: handleChange,
    suffix: tokenInfo && tokenInfo.symbol,
    value
  }
}

const AllowanceInput = function (props) {
  const { disabled } = props

  const [isInfinite, setInfinite] = useState(false)

  const handleInfiniteClick = function () {
    setInfinite(!isInfinite)
  }

  // TODO use checkbox value

  return (
    <>
      <Input {...props} />
      <div className="flex items-center justify-center w-full">
        <label className="space-x-2">
          <input
            className="w-4 h-4 border-2"
            disabled={disabled}
            onChange={handleInfiniteClick}
            type="checkbox"
            value={isInfinite}
          />
          <span>Infinite</span>
        </label>
      </div>
    </>
  )
}

const TokenApprovalsForm = function () {
  const [tokenInfo, setTokenInfo] = useState()
  const tokenInput = useTokenInput(setTokenInfo)

  const [spenderInfo, setSpenderInfo] = useState()
  const spenderInput = useTokenInput(setSpenderInfo)

  const [allowance, setAllowance] = useState()
  const allowanceInput = useAllowanceInput(
    tokenInfo,
    spenderInfo,
    allowance,
    setAllowance
  )

  const [feedback, setFeedback] = useState({ message: '' })
  const clearFeedback = () => setFeedback({ message: '' })
  const setErrorMessage = (message) =>
    setFeedback({ color: 'text-red-600', message })
  const setInfoMessage = (message) =>
    setFeedback({ color: 'text-black', message })
  const setSuccessMessage = (message) =>
    setFeedback({ color: 'text-green-600', message })

  const [inProgress, setInProgress] = useState(false)
  const approveDisabled = !allowance || inProgress
  const { erc20 } = useContext(PureContext)
  const handleApproveClick = function () {
    setInProgress(true)
    setInfoMessage('Approval in Progress')
    const contract = erc20(tokenInfo.address)
    // TODO check current allowance first
    Promise.resolve()
      .then(() =>
        contract.approve(
          spenderInfo.address,
          toUnit(allowance, tokenInfo.decimals)
        )
      )
      .then(function (receipt) {
        console.log('DONE', receipt.events.Approval)
        setSuccessMessage('Approval Succeeded')
      })
      .catch(function (err) {
        setErrorMessage(err.message)
      })
      .finally(function () {
        setInProgress(false)
      })
  }

  const { active, account } = useWeb3React()
  useEffect(clearFeedback, [active, account, tokenInfo, spenderInfo])

  return (
    <>
      <div className="flex flex-wrap justify-center w-full max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-full h-24">
          <Input
            placeholder="symbol or address"
            title="Token Address:"
            {...tokenInput}
          />
        </div>
        <div className="w-full h-24">
          <Input
            placeholder="address"
            title="Spender Address:"
            {...spenderInput}
          />
        </div>
        <AllowanceInput
          suffix={tokenInfo && tokenInfo.symbol}
          title="Allowance:"
          {...allowanceInput}
        />
      </div>
      <div className="flex justify-center mt-7.5">
        <Button disabled={approveDisabled} onClick={handleApproveClick}>
          APPROVE
        </Button>
      </div>
      <p className={`text-center text-sm mt-6 ${feedback.color}`}>
        {feedback.message}
      </p>
    </>
  )
}

const TokenApprovals = function () {
  return (
    <Layout title="Token Approvals" walletConnection>
      <TokenApprovalsForm />
    </Layout>
  )
}

export default TokenApprovals
