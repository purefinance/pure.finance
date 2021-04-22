import { useWeb3React } from '@web3-react/core'
import { useContext, useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { fromUnit, toFixed, watchAsset } from '../utils'
import useTranslation from 'next-translate/useTranslation'

function MerkleClaims() {
  const { t } = useTranslation('common')
  const { active, account, chainId } = useWeb3React()
  const [claimID, setClaimID] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const [feedback, setFeedback] = useState({ color: 'text-black', message: '' })
  const { merkle } = useContext(PureContext)

  const clearFeedback = () => setFeedback({ color: 'text-black', message: '' })
  const setErrorMessage = (message) =>
    setFeedback({ color: 'text-red-600', message })
  const setInfoMessage = (message) =>
    setFeedback({ color: 'text-black', message })
  const setSuccessMessage = (message) =>
    setFeedback({ color: 'text-green-600', message })

  const getHolding = (claimID) =>
    claimID &&
    merkle
      .getHolding(claimID)
      .then((h) => {
        if (h.isClaimable) {
          clearFeedback()
        } else {
          setErrorMessage(t('already-claimed'))
        }
        setHolding(h)
      })
      .catch((e) => setErrorMessage(e.message))

  const delayedClaimID = useCallback(
    debounce((cID) => getHolding(cID), 500),
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
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
      .then(() => watchAsset({ account, chainId, token: holding.token }))
  }

  useEffect(() => {
    clearFeedback()
    setClaimID('')
  }, [active, account])

  useEffect(() => setHolding({ amount: '', isClaimable: false }), [claimID])

  return (
    <Layout title={t('merkle-claims')} walletConnection>
      <div className="flex flex-wrap justify-center w-full max-w-lg mx-auto mt-10 space-y-3">
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
      <div className="flex justify-center mt-7.5">
        <Button
          className="flex justify-center mt-7.5"
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
