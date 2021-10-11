import { useCallback, useContext, useEffect, useState } from 'react'
import Big from 'big.js'
import debounce from 'lodash.debounce'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'
import watchAsset from 'wallet-watch-asset'

import { fromUnit, toFixed } from '../utils'
import Button from '../components/Button'
import Input from '../components/Input'
import Layout from '../components/Layout'
import PureContext from '../components/context/Pure'

function SablierClaims() {
  const { t } = useTranslation('common')
  const { active, account } = useWeb3React()
  const [streamID, setStreamID] = useState('')
  const [claimInProgress, setClaimInProgress] = useState(false)
  const [stream, setStream] = useState({ balance: '' })
  const [feedback, setFeedback] = useState({ color: 'text-black', message: '' })
  const { sablier } = useContext(PureContext)

  const clearFeedback = () => setFeedback({ color: 'text-black', message: '' })
  const setErrorMessage = message =>
    setFeedback({ color: 'text-red-600', message })
  const setInfoMessage = message =>
    setFeedback({ color: 'text-black', message })
  const setSuccessMessage = message =>
    setFeedback({ color: 'text-green-600', message })

  const getStream = streamID =>
    streamID &&
    sablier
      .getStream(streamID)
      .then(s => {
        setStream(s)
        clearFeedback()
      })
      .catch(e => setErrorMessage(e.message))

  const delayedStreamID = useCallback(
    debounce(sID => getStream(sID), 500),
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
    setInfoMessage(t('claim-in-progress'))
    return sablier
      .withdrawFromStream(streamID)
      .then(function () {
        setSuccessMessage(t('claim-succeeded'))
        setStreamID('')
      })
      .catch(e => setErrorMessage(e.message))
      .finally(() => setClaimInProgress(false))
      .then(() => watchAsset({ account, token: stream.token }))
  }

  useEffect(() => {
    clearFeedback()
    setStreamID('')
  }, [active, account])

  useEffect(() => setStream({ balance: '' }), [streamID])

  // TODO consider replacing this with useTimeoutWhen (imbhargav5/rooks)
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
    <Layout title={t('sablier-claims')} walletConnection>
      <div className="flex flex-wrap justify-center mt-10 mx-auto w-full max-w-lg space-y-3">
        <Input
          disabled={!active || claimInProgress}
          onChange={handleStreamIDChange}
          title={`${t('stream-id')}:`}
          value={streamID}
        />
        <Input
          caption={
            stream.balance
              ? `${new Intl.NumberFormat('default', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }).format(
                  new Big(stream.balance)
                    .div(`1e${stream.token.decimals}`)
                    .mul(stream.rate)
                    .div('1e6')
                    .toNumber()
                )} USD`
              : '-'
          }
          disabled
          suffix={stream && stream.token && stream.token.symbol}
          title={`${t('balance')}:`}
          value={
            stream.balance &&
            toFixed(fromUnit(stream.balance, stream.token.decimals), 6)
          }
        />
      </div>
      <div className="mt-7.5 flex justify-center">
        <Button
          disabled={!active || claimInProgress || !stream.balance}
          onClick={handleClaimSubmit}
        >
          {t('claim')}
        </Button>
      </div>
      <p className={`text-center text-sm mt-6 ${feedback.color}`}>
        {feedback.message}
      </p>
    </Layout>
  )
}

export default SablierClaims
