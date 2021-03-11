import { useWeb3React } from '@web3-react/core'
import { useContext, useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { fromUnit, toFixed } from '../utils'
import BalanceField from '../components/BalanceField'

function MerkleClaims() {
  const { active, account } = useWeb3React()
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
          setErrorMessage('Already Claimed')
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
    setInfoMessage('Claim in Progress')
    return merkle
      .claim(claimID, holding.amount, holding.proof)
      .then(function () {
        setSuccessMessage('Claim Succeeded')
        setClaimID('')
      })
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
  }

  useEffect(() => {
    clearFeedback()
    setClaimID('')
  }, [active, account])

  useEffect(() => setHolding({ amount: '', isClaimable: false }), [claimID])

  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto">
        <h1 className="text-1.5xl font-bold text-center">Merkle Claims</h1>
        <div className="flex flex-wrap space-y-3 max-w-lg w-full mx-auto mt-10 justify-center">
          <div className="w-full">
            <Input
              title="Claim ID:"
              value={claimID}
              onChange={handleClaimIDChange}
              disabled={!active || claimInProgress}
            />
          </div>
          <div className="w-full tabular-nums">
            <BalanceField
              title="Balance:"
              value={
                holding.amount &&
                toFixed(fromUnit(holding.amount, holding.token.decimals), 6)
              }
              suffix={holding && holding.token && holding.token.symbol}
            />
          </div>
        </div>
        <div className="flex justify-center mt-7.5">
          <Button
            disabled={!active || !holding.isClaimable || claimInProgress}
            onClick={handleClaimSubmit}
          >
            CLAIM
          </Button>
        </div>
        <p className={`text-center text-sm mt-6 ${feedback.color}`}>
          {feedback.message}
        </p>
      </div>
    </Layout>
  )
}

export default MerkleClaims
