import { useWeb3React } from '@web3-react/core'
import debounce from 'lodash.debounce'
import { useTranslations } from 'next-intl'
import { useCallback, useContext, useEffect, useState } from 'react'
import { isHexStrict } from 'web3-utils'

import PureContext from '../components/context/Pure'
import { resolveAddress } from '../utils/resolveAddress'

const useTokenInput = function (address, onChange = () => {}, allowAnyAddress) {
  const t = useTranslations()
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

      const addressPromise = resolveAddress(library, value)

      // eslint-disable-next-line promise/catch-or-return
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
            setTokenName(info.symbol)
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

export { useTokenInput }
