import { isAddress } from 'web3-utils'
import { useContext, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { util } from 'erc-20-lib'
import vesperMetadata from 'vesper-metadata'

import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'

import { fromUnit, toUnit } from '../utils'

const extraTokens = [].concat(
  vesperMetadata.pools.map((p) => ({ ...p, symbol: p.name })),
  vesperMetadata.tokens
)

const useTokenInput = function (onChange) {
  const { active, chainId } = useWeb3React()
  const { erc20 } = useContext(PureContext)

  const [tokenAddress, setTokenAddress] = useState()
  const [tokenError, setTokenError] = useState()
  const [tokenName, setTokenName] = useState()

  useEffect(() => {
    setTokenAddress('')
    setTokenName('')
    setTokenError('')
  }, [active, chainId])

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

    // TODO debounce this call
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
    disabled: !active,
    onChange: handleChange,
    value: tokenAddress
  }
}

const useAllowanceInput = function (token, spender, allowance, setAllowance) {
  const { account, active, chainId } = useWeb3React()
  const { erc20 } = useContext(PureContext)

  const disabled = !token || !spender || !active || !erc20

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

      const contract = erc20(token.address)
      contract
        .allowance(account, spender.address)
        .then(function (currentAllowance) {
          setAllowance(fromUnit(currentAllowance, token.decimals))
        })
        .catch(function (err) {
          // Send message to feedback too?
          console.warn(err.message)
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
    suffix: token && token.symbol,
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

const useFormButton = function (disabled, setFeedback, onClick) {
  const [inProgress, setInProgress] = useState(false)

  const handleClick = function () {
    setInProgress(true)
    setFeedback('info', 'Approval in Progress')
    onClick()
      .then(function () {
        setFeedback('success', 'Approval Succeeded')
      })
      .catch(function (err) {
        setFeedback('error', err.message)
      })
      .finally(function () {
        setInProgress(false)
      })
  }

  return {
    disabled: disabled || inProgress,
    onClick: handleClick
  }
}

const TokenApprovalsForm = function () {
  const [token, setToken] = useState()
  const tokenInput = useTokenInput(setToken)

  const [spender, setSpender] = useState()
  const spenderInput = useTokenInput(setSpender)

  const [allowance, setAllowance] = useState()
  const allowanceInput = useAllowanceInput(
    token,
    spender,
    allowance,
    setAllowance
  )

  const [feedback, setFeedback] = useFeedback()

  const { account, erc20 } = useContext(PureContext)
  const approveDisabled = !allowance || !erc20
  const approveAmount = function (amount) {
    const contract = erc20(token.address)
    return contract
      .allowance(account, spender.address)
      .then(function (currentAllowance) {
        if (amount === currentAllowance) {
          throw new Error('Allowance already set')
        }
      })
      .then(() => contract.approve(spender.address, amount))
      .then(function (receipt) {
        console.log('DONE', receipt.events.Approval.returnValues)
        return contract.allowance(account, spender.address)
      })
      .then(function (newAllowance) {
        setAllowance(fromUnit(newAllowance, token.decimals))
      })
  }
  const approveAllowance = () =>
    approveAmount(toUnit(allowance, token.decimals))
  const approveInfinite = () => approveAmount((2n ** 256n - 1n).toString()) // 2 ^ 256 - 1
  const approveButton = useFormButton(
    approveDisabled,
    setFeedback,
    approveAllowance
  )
  const infiniteButton = useFormButton(
    approveDisabled,
    setFeedback,
    approveInfinite
  )

  return (
    <>
      <div className="flex flex-wrap justify-center w-full max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-full h-24">
          <Input
            placeholder="address or symbol"
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
        <Input
          suffix={token && token.symbol}
          title="Allowance:"
          {...allowanceInput}
        />
      </div>
      <div className="flex justify-center mt-7.5">
        <Button {...approveButton}>APPROVE ALLOWANCE</Button>
      </div>
      <div className="flex justify-center mt-7.5">
        <Button {...infiniteButton}>APPROVE INFINITE</Button>
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
