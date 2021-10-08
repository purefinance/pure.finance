import { useCallback, useContext, useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { isAddress, isHexStrict } from 'web3-utils'
import { util } from 'erc-20-lib'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import useTranslation from 'next-translate/useTranslation'
import vesperTokens from 'vesper-metadata/src/vesper.tokenlist.json'

const useTokenInput = function (address, onChange = () => {}, allowAnyAddress) {
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
              library.eth.ens.getAddress(value)
          ).catch(function (err) {
            console.log(err)
            return null
          })

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

export { useTokenInput }
