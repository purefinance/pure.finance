import { useWeb3React } from '@web3-react/core'
import { useContext, useState, useCallback, useEffect } from 'react'
import debounce from 'lodash.debounce'
import PureContext from '../components/context/Pure'
import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'
import { fromUnit } from '../utils'
import BalanceField from '../components/BalanceField'

function SablierClaims() {
  const { active, account } = useWeb3React()
  const [streamID, setStreamID] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [stream, setStream] = useState({ balance: '' })
  const [errorMessage, setErrorMessage] = useState(false)
  const { sablier } = useContext(PureContext)

  const getStream = (streamID) =>
    streamID &&
    sablier
      .getStream(streamID)
      .then((s) => setStream(s))
      .catch((e) => setErrorMessage(e.message))

  const delayedStreamID = useCallback(
    debounce((sID) => getStream(sID), 500),
    [sablier]
  )
  const handleStreamIDChange = function (e) {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      setStreamID(e.target.value)
      delayedStreamID(e.target.value)
    }
  }

  const handleClaimSubmit = () => {
    setClaimInProgress(true)
    return sablier
      .withdrawFromStream(streamID)
      .then(() => setStreamID(''))
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
  }

  useEffect(() => setStreamID(''), [active, account])

  useEffect(() => {
    setErrorMessage('')
    setStream({ balance: '' })
  }, [streamID])

  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto">
        <h1 className="text-1.5xl font-bold text-center">Sablier Claims</h1>
        <div className="flex flex-wrap space-y-3 max-w-lg w-full mx-auto mt-10 justify-center">
          <div className="w-full">
            <Input
              title="Stream ID:"
              value={streamID}
              onChange={handleStreamIDChange}
              disabled={!active || claimInProgress}
            />
          </div>
          <div className="w-full">
            <BalanceField
              title="Balance:"
              value={
                stream.balance &&
                fromUnit(stream.balance, stream.token.decimals)
              }
              suffix={stream && stream.token && stream.token.symbol}
            />
          </div>
        </div>
        <div className="flex justify-center mt-7.5">
          <Button
            disabled={!active || claimInProgress || !stream.balance}
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

export default SablierClaims
