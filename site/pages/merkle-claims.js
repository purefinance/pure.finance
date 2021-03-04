import { useWeb3React } from '@web3-react/core'
import { useContext, useState } from 'react'
import throttle from 'lodash.throttle'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'

function MerkleClaims() {
  const { active, account } = useWeb3React()
  const [claimID, setClaimID] = useState('')
  const [holding, setHolding] = useState({ amount: '', isClaimable: false })
  const { merkle } = useContext(PureContext)
  const handleClaimIdInput = (e) => {
    setClaimID(e.target.value)
    return merkle.getHolding(e.target.value).then(setHolding)
  }
  const handleClaimIDInputThrottle = throttle(handleClaimIdInput, 100)
  const handleClaimSubmit = () =>
    merkle
      .claim(claimID, account, holding.amount, holding.proof)
      .then(console.log)

  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto">
        <h1 className="text-1.5xl font-bold text-center">Merkle Claims</h1>
        <div className="flex flex-wrap space-y-1 max-w-lg w-full mx-auto mt-10 justify-center">
          <Input
            title="Claim ID:"
            onChange={handleClaimIDInputThrottle}
            disabled={!active}
          />
          <Input title="Balance:" disabled value={holding.amount} />
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
