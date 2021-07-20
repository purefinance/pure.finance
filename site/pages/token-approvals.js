import { isAddress, isHexStrict } from 'web3-utils'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useWeb3React } from '@web3-react/core'
import { util } from 'erc-20-lib'
import debounce from 'lodash.debounce'
import vesperTokens from 'vesper-metadata/src/vesper.tokenlist.json'
import useTranslation from 'next-translate/useTranslation'

import { fromUnit, toUnit } from '../utils'
import { useFormButton } from '../hooks/useFormButton'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'

const useTokenInput = function (address, onChange, allowAnyAddress) {
  const { t } = useTranslation('common')
  const { active, chainId, library } = useWeb3React()
  const { erc20 } = useContext(PureContext)

  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenError, setTokenError] = useState('')
  const [tokenName, setTokenName] = useState('')

  useEffect(() => {
    onChange(null)
    setTokenAddress('')
    setTokenName('')
    setTokenError('')
  }, [active, chainId])

  const delayedGetTokenInfo = useCallback(
    debounce(function (value) {
      setTokenError('')

      const addressPromise = isAddress(value)
        ? Promise.resolve(value)
        : Promise.resolve(
            util.tokenAddress(value, vesperTokens.tokens) ||
              library.eth.ens
                .getAddress(value)
                .catch((err) => console.log(err) || null)
          )

      addressPromise.then(function (addressFound) {
        if (!addressFound) {
          setTokenError(
            isHexStrict(value) ? t('invalid-address') : t('address-not-found')
          )
          onChange(null)
          return
        }

        setTokenAddress(addressFound)

        const contract = erc20(addressFound)
        contract
          .getInfo()
          .then(function (info) {
            onChange(info)
            setTokenName(info.name)
          })
          .catch(function () {
            if (allowAnyAddress) {
              setTokenName('')
              onChange({ address: addressFound })
              return
            }
            setTokenError(t('invalid-token-address'))
          })
      })
    }, 1000),
    [erc20]
  )

  const handleChange = function (e) {
    const { value } = e.target

    const re = /^[0-9a-zA-Z.]*$/
    if (!re.test(e.target.value)) {
      return
    }

    setTokenAddress(value)
    setTokenName('')
    setTokenError('')

    delayedGetTokenInfo(value)
  }

  useEffect(
    function () {
      if (!address || !erc20) {
        return
      }
      handleChange({ target: { value: address } })
    },
    [address, erc20]
  )

  return {
    caption: tokenError || tokenName,
    captionColor: tokenError && 'text-red-600',
    disabled: !active,
    onChange: handleChange,
    value: tokenAddress
  }
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

const TokenApprovalsForm = function () {
  const { t } = useTranslation('common')
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
    <>
      <div className="flex flex-wrap justify-center w-full max-w-lg mx-auto mt-10 space-y-4">
        <div className="w-full h-24">
          <Input
            placeholder={t('token-address-placeholder')}
            title={`${t('token-address')}:`}
            {...tokenInput}
          />
        </div>
        <div className="w-full h-24">
          <Input
            placeholder={t('spender-address-placeholder')}
            title={`${t('spender-address')}:`}
            {...spenderInput}
          />
        </div>
        <Input
          suffix={token && token.symbol}
          title={`${t('allowance')}:`}
          {...allowanceInput}
        />
      </div>
      <div className="flex justify-center mt-7.5">
        <Button {...approveButton}>
          {t('approve-allowance').toUpperCase()}
        </Button>
      </div>
      <div className="flex justify-center mt-7.5">
        <Button {...infiniteButton}>
          {t('approve-infinite').toUpperCase()}
        </Button>
      </div>
      <p className={`text-center text-sm mt-6 ${feedback.color}`}>
        {feedback.message}
      </p>
    </>
  )
}

const TokenApprovals = function () {
  const { t } = useTranslation('common')
  return (
    <Layout title={t('token-approvals')} walletConnection>
      <TokenApprovalsForm />
    </Layout>
  )
}

export const getStaticProps = () => ({})
export default TokenApprovals
