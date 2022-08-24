import { useCallback, useContext, useEffect, useState } from 'react'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'
import watchAsset from 'wallet-watch-asset'

import { fromUnit, toFixed } from '../utils'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'

function MerkleClaims() {
  const { t } = useTranslation('common')
  const { active, account } = useWeb3React()
  const { query } = useRouter()
  const [claimID, setClaimID] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const [feedback, setFeedback] = useState({ color: 'text-black', message: '' })
  const { merkle } = useContext(PureContext)

  const clearFeedback = () => setFeedback({ color: 'text-black', message: '' })
  const setErrorMessage = message =>
    setFeedback({ color: 'text-red-600', message })
  const setInfoMessage = message =>
    setFeedback({ color: 'text-black', message })
  const setSuccessMessage = message =>
    setFeedback({ color: 'text-green-600', message })

  const getHolding = cID =>
    cID &&
    merkle.getHolding &&
    merkle
      .getHolding(cID)
      .then(h => {
        if (h.isClaimable) {
          clearFeedback()
        } else {
          setErrorMessage(t('already-claimed'))
        }
        setHolding(h)
      })
      .catch(e => setErrorMessage(e.message))

  const delayedClaimID = useCallback(
    debounce(cID => getHolding(cID), 500),
    [merkle]
  )

  const handleClaimIDChange = function (e) {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      clearFeedback()
      setClaimID(e.target.value)
      delayedClaimID(e.target.value)
    }
  }

  const handleClaimSubmit = () => {
    setClaimInProgress(true)
    setInfoMessage(t('claim-in-progress'))
    return merkle
      .claim(claimID, holding.amount, holding.proof)
      .then(function () {
        setSuccessMessage(t('claim-succeeded'))
        setClaimID('')
      })
      .catch(e => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
      .then(() => watchAsset({ account, token: holding.token }))
  }

  useEffect(() => {
    clearFeedback()
    setClaimID('')
  }, [active, account])

  useEffect(() => setHolding({ amount: '', isClaimable: false }), [claimID])

  useEffect(
    function setClaimIdFromQueryOnLoad() {
      handleClaimIDChange({ target: { value: query.id } })
    },
    [merkle, query]
  )

  return (
    <Layout title={t('merkle-claims')} walletConnection>
      <div className="flex flex-wrap justify-center mt-10 mx-auto w-full max-w-lg space-y-3">
        <Input
          disabled={!active || claimInProgress}
          onChange={handleClaimIDChange}
          title={`${t('claim-id')}:`}
          value={claimID}
        />
        <Input
          disabled
          suffix={holding && holding.token && holding.token.symbol}
          title={`${t('balance')}:`}
          value={
            holding.amount &&
            toFixed(fromUnit(holding.amount, holding.token.decimals), 6)
          }
        />
      </div>
      <div className="mt-7.5 flex justify-center">
        <Button
          className="mt-7.5 flex justify-center"
          disabled={!active || !holding.isClaimable || claimInProgress}
          onClick={handleClaimSubmit}
        >
          {t('claim').toUpperCase()}
        </Button>
      </div>
      <p className={`text-center text-sm mt-6 ${feedback.color}`}>
        {feedback.message}
      </p>
    </Layout>
  )
}

export default MerkleClaims
