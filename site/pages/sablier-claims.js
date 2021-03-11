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
  const [feedback, setFeedback] = useState({ color: 'text-black', message: '' })
  const { sablier } = useContext(PureContext)

  const clearFeedback = () => setFeedback({ color: 'text-black', message: '' })
  const setErrorMessage = (message) =>
    setFeedback({ color: 'text-red-600', message })
  const setInfoMessage = (message) =>
    setFeedback({ color: 'text-black', message })
  const setSuccessMessage = (message) =>
    setFeedback({ color: 'text-green-600', message })

  const getStream = (streamID) =>
    streamID &&
    sablier
      .getStream(streamID)
      .then((s) => {
        setStream(s)
        clearFeedback()
      })
      .catch((e) => setErrorMessage(e.message))

  const delayedStreamID = useCallback(
    debounce((sID) => getStream(sID), 500),
    [sablier]
  )

  const handleStreamIDChange = function (e) {
    const re = /^[0-9\b]+$/
    if (e.target.value === '' || re.test(e.target.value)) {
      clearFeedback()
      setStreamID(e.target.value)
      delayedStreamID(e.target.value)
    }
  }

  const handleClaimSubmit = () => {
    setClaimInProgress(true)
    setInfoMessage('Claim in Progress')
    return sablier
      .withdrawFromStream(streamID)
      .then(function () {
        setSuccessMessage('Claim Succeeded')
        setStreamID('')
      })
      .catch((e) => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
  }

  useEffect(() => {
    clearFeedback()
    setStreamID('')
  }, [active, account])

  useEffect(() => setStream({ balance: '' }), [streamID])

  useEffect(
    function () {
      if (!stream.balance) {
        return
      }
      const incBalance = BigInt(stream.balance) + BigInt(stream.ratePerSecond)
      const maxBalance = BigInt(stream.remainingBalance)
      const newBalance = incBalance > maxBalance ? maxBalance : incBalance
      const timer = setTimeout(function () {
        setStream({ ...stream, balance: newBalance.toString() })
      }, 1000)
      return function () {
        clearTimeout(timer)
      }
    },
    [stream.balance]
  )

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
        <p className={`text-center text-sm mt-6 ${feedback.color}`}>
          {feedback.message}
        </p>
      </div>
    </Layout>
  )
}

export default SablierClaims
