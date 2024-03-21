import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import React from 'react'

import Button from '../../components/Button'
import { InputTitle, TextArea } from '../../components/Input'
import Layout from '../../components/Layout'
import SvgContainer from '../../components/svg/SvgContainer'
import UtilFormBox from '../../components/UtilFormBox'

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
  const t = useTranslations()

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
      web3.eth.personal
        .sign(message, account)
        .then(function (_signature) {
          setSignature(_signature)
          setFeedback('success', 'Signed successfully')
        })
        .catch(function (err) {
          setSignature()
          setFeedback('error', err.message)
        })
    }
  }

  return (
    <UtilFormBox title={t('sign-message')}>
      <TextArea
        placeholder={t('message-placeholder')}
        rows={5}
        title={t('message')}
        {...messageInput}
      />
      <Button {...signButton}>{t('sign')}</Button>
      {signature && (
        <div className="mt-6 break-all">
          <InputTitle>{t('signature')}</InputTitle>
          <div className="p-4 w-full bg-gray-50 rounded-2xl">{signature}</div>
        </div>
      )}
      <p className={`text-center text-sm mt-4 mb-8 ${feedback.color}`}>
        {feedback.message}
      </p>
      <div className="flex justify-between mx-auto w-full max-w-lg text-gray-400 text-xs">
        <a
          className="flex items-center p-2 pr-4 hover:text-black bg-gray-50 rounded-full focus:outline-none"
          href="https://etherscan.io/verifiedSignatures"
          rel="noreferrer"
          target="_blank"
        >
          <SvgContainer className="inline-block mr-2" name="etherscan" />
          {t('verify-signature-etherscan')}
        </a>
        <a
          className="flex items-center p-2 pr-4 hover:text-black bg-gray-50 rounded-full focus:outline-none"
          href="https://github.com/hemilabs/pure.finance/blob/master/site/pages/[locale]/sign-message.js"
          rel="noreferrer"
          target="_blank"
        >
          <SvgContainer className="inline-block mr-2" name="curlybrackets" />
          {t('view-source-code')}
        </a>
      </div>
    </UtilFormBox>
  )
}

const SignMessage = function () {
  const t = useTranslations()
  return (
    <Layout title={t('sign-message')} walletConnection>
      <SignMessageForm />
    </Layout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default SignMessage
