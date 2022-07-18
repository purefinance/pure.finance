import { useEffect, useState } from 'react'
import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import { useWeb3React } from '@web3-react/core'

import Button from '../components/Button'
import Layout from '../components/Layout'

const useFeedback = function () {
  const { account, active } = useWeb3React()

  const [feedback, _setFeedback] = useState({ message: '' })

  useEffect(
    function () {
      _setFeedback({ message: '' })
    },
    [account, active]
  )

  const setFeedback = function (type, message) {
    const colors = {
      error: 'text-red-600',
      success: 'text-green-600'
    }
    const color = colors[type] || 'text-black'
    _setFeedback({ color, message })
  }

  return [feedback, setFeedback]
}

const SignMessageForm = function () {
  const { active, account, library: web3 } = useWeb3React()
  const { t } = useTranslation('common')

  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState()
  const [feedback, setFeedback] = useFeedback()

  const messageInput = {
    onChange(event) {
      setMessage(event.target.value)
      setSignature()
      setFeedback()
    }
  }

  const signButton = {
    disabled: !active || !message,
    onClick() {
      web3.eth.sign(message, account, function (err, _signature) {
        if (err) {
          setSignature()
          setFeedback('error', err.message)
          return
        }
        setSignature(_signature)
        setFeedback('success', 'Signed successfully')
      })
    }
  }

  return (
    <>
      <div className="flex flex-wrap justify-center mt-10 mx-auto w-full max-w-lg space-y-4">
        <textarea
          className="w-full border-2"
          placeholder={t('message-placeholder')}
          rows={5}
          title={`${t('message')}:`}
          {...messageInput}
        />
      </div>
      <div className="mt-7.5 flex justify-center">
        <Button {...signButton}>{t('sign').toUpperCase()}</Button>
      </div>
      {signature && (
        <div className="flex-wrap mt-6 w-full text-center text-sm">
          Signature:
          <br />
          {signature}
        </div>
      )}
      <p className={`text-center text-sm mt-6 ${feedback.color}`}>
        {feedback.message}
      </p>
    </>
  )
}

const SignMessage = function () {
  const { t } = useTranslation('common')
  return (
    <Layout title={t('sign-message')} walletConnection>
      <SignMessageForm />
    </Layout>
  )
}

export const getStaticProps = () => ({})
export default SignMessage
