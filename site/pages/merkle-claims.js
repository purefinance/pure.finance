import { useWeb3React } from '@web3-react/core'
import { useContext, useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { fromUnit } from '../utils'
import BalanceField from '../components/BalanceField'

function MerkleClaims() {
  const { active, account } = useWeb3React()
  const [claimID, setClaimID] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const [errorMessage, setErrorMessage] = useState(false)
  const { merkle } = useContext(PureContext)

  const getHolding = (claimID) =>
    claimID &&
    merkle
      .getHolding(claimID)
      .then((h) => {
        if (!h.isClaimable) setErrorMessage('Already Claimed')
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
      setClaimID(e.target.value)
      delayedClaimID(e.target.value)
    }
  }

  const handleClaimSubmit = () => {
    setClaimInProgress(true)
    return merkle
      .claim(claimID, holding.amount, holding.proof)
      .then(() => setClaimID(''))
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
  }

  useEffect(() => setClaimID(''), [active, account])

  useEffect(() => {
    setErrorMessage('')
    setHolding({ amount: '', isClaimable: false })
  }, [claimID])

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
          <div className="w-full">
            <BalanceField
              title="Balance:"
              value={
                holding.amount &&
                fromUnit(holding.amount, holding.token.decimals)
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
        <p className="text-center text-sm text-red-600 mt-6">{errorMessage}</p>
      </div>
    </Layout>
  )
}

export default MerkleClaims