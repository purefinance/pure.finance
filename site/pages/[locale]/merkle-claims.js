import { useWeb3React } from '@web3-react/core'
import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'
import { useCallback, useContext, useEffect, useState } from 'react'
import watchAsset from 'wallet-watch-asset'

import Button from '../../components/Button'
import CallToAction from '../../components/CallToAction'
import PureContext from '../../components/context/Pure'
import Input from '../../components/Input'
import InputBalance from '../../components/InputBalance'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilityForm from '../../components/layout/UtilityForm'
import { TextLabel } from '../../components/TextLabel'
import { useEphemeralState } from '../../hooks/useEphemeralState'
import { fromUnit } from '../../utils'

function MerkleClaimsForm() {
  const { account, active, chainId, library } = useWeb3React()
  const { merkle } = useContext(PureContext)
  const { query } = useRouter()
  const t = useTranslations()

  const [claimId, setClaimId] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [feedback, setFeedback] = useState({ color: 'text-black', message: '' })
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const [result, setResult] = useEphemeralState({
    color: 'text-black',
    message: ''
  })

  useEffect(
    function resetForm() {
      setClaimId('')
    },
    [account, active, chainId]
  )

  useEffect(
    function updateHolding() {
      setFeedback({ color: 'text-black', message: '' })

      if (!claimId) {
        setHolding({ amount: '', isClaimable: false })
        return void 0
      }

      const timeoutId = setTimeout(function () {
        merkle
          .getHolding(claimId)
          .then(function (h) {
            setHolding(h)
            if (!h.isClaimable) {
              throw new Error(t('already-claimed'))
            }
          })
          .catch(function (err) {
            setFeedback({ color: 'text-error', message: err.message })
          })
      }, 500)

      return function cancelUpdateHolding() {
        clearTimeout(timeoutId)
      }
    },
    [claimId, merkle, t]
  )

  const onClaimIdChange = useCallback(function (event) {
    const onlyNumbers = /^[0-9]+$/
    if (event.target.value === '' || onlyNumbers.test(event.target.value)) {
      setClaimId(event.target.value)
    }
  }, [])

  useEffect(
    function setClaimIdFromQueryStringOnLoad() {
      const event = { target: { value: query.id } }
      onClaimIdChange(event)
    },
    [onClaimIdChange, query]
  )

  const handleSubmit = function (event) {
    event.preventDefault()

    setClaimInProgress(true)
    setResult({ color: 'text-info', message: t('claim-in-progress') })
    return merkle
      .claim(claimId, holding.amount, holding.proof)
      .then(function () {
        setResult({ color: 'text-success', message: t('claim-succeeded') })
        setClaimId('')
        watchAsset(
          library.currentProvider,
          account,
          holding.token,
          localStorage
        ).catch(() => null) // Ignore errors from watchAsset
      })
      .catch(function (err) {
        const message = err.message.split('\n')[0]
        setResult({ color: 'text-error', message })
      })
      .finally(function () {
        setClaimInProgress(false)
      })
  }

  return (
    <UtilityForm
      onSubmit={handleSubmit}
      subtitle={t('utilities-text.merkle-claims')}
      title={t('merkle-claims')}
    >
      <Input
        caption={feedback.message}
        captionColor={feedback.color}
        disabled={!active || claimInProgress}
        onChange={onClaimIdChange}
        placeholder={t('enter-claim-id')}
        title={t('claim-id')}
        value={claimId}
      />
      <InputBalance
        className="mb-8 mt-4"
        disabled
        placeholder="-"
        title={t('balance')}
        token={holding?.token?.symbol}
        value={
          holding.amount && fromUnit(holding.amount, holding.token.decimals, 6)
        }
      />
      <CallToAction>
        <Button disabled={!holding.isClaimable} type="submit">
          {t('claim')}
        </Button>
      </CallToAction>
      <TextLabel color={result.color} value={result.message} />
    </UtilityForm>
  )
}

function MerkleClaims() {
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.merkle-claims')

  const helperText = {
    questions: [
      {
        answer: tHelperText('what-are-answer'),
        title: tHelperText('what-are-question')
      },
      {
        answer: tHelperText('how-find-answer'),
        title: tHelperText('how-find-question')
      }
    ],
    text: tHelperText('text'),
    title: tHelperText('title')
  }

  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('merkle-claims')}
      walletConnection
    >
      <MerkleClaimsForm />
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'

export default MerkleClaims
