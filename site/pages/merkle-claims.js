import { useWeb3React } from '@web3-react/core'
import { useContext, useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { fromUnit } from '../utils'

function MerkleClaims() {
  const { active, account } = useWeb3React()
  const [claimID, setClaimID] = useState('')
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const { merkle } = useContext(PureContext)

  const getHolding = (claimID) =>
    claimID &&
    merkle
      .getHolding(claimID)
      .then(setHolding)
      .catch((e) => console.log(e.message))
  const delayedClaimID = useCallback(
    debounce((cID) => getHolding(cID), 500),
    [merkle]
  )
  const handleClaimIdChange = function (e) {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setClaimID(e.target.value)
      delayedClaimID(e.target.value)
    }
  }

  const handleClaimSubmit = () =>
    merkle.claim(claimID, holding.amount, holding.proof).then(console.log)

  useEffect(() => setClaimID(''), [active, account])

  useEffect(() => setHolding({ amount: '', isClaimable: false }), [claimID])
  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto">
        <h1 className="text-1.5xl font-bold text-center">Merkle Claims</h1>
        <div className="flex flex-wrap space-y-1 max-w-lg w-full mx-auto mt-10 justify-center">
          <Input
            prefix="tonx"
            title="Claim ID:"
            value={claimID}
            onChange={handleClaimIdChange}
            disabled={!active}
          />
          <Input
            title="Balance:"
            disabled
            value={
              holding.amount && fromUnit(holding.amount, holding.token.decimals)
            }
            suffix={holding && holding.token && holding.token.symbol}
          />
        </div>
        <div className="flex justify-center mt-7.5">
          <Button
            disabled={!active || !holding.isClaimable}
            onClick={handleClaimSubmit}
          >
            CLAIM
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default MerkleClaims
