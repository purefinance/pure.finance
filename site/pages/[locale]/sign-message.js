import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import React from 'react'

import Button from '../../components/Button'
import { TextArea } from '../../components/Input'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilFormBox from '../../components/layout/UtilFormBox'
import SvgContainer from '../../components/svg/SvgContainer'

const helperText = {
  title: 'How Does a Sign Message Work?',
  text: "Signing a message creates a unique cryptographic signature using your wallet's private key. This signature can be used to verify that you are the owner of the wallet without revealing your private key. Enter your message, sign it, and share the signature for verification.",
  questions: [
    {
      title: 'How can I verify a signed message?',
      answer:
        'To verify a signed message, use the signature and the original message with any signature verification tool. Etherscan offers one such tool, but there are many options available, including web-based platforms and command-line interfaces (CLIs).'
    }
  ]
}
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
    className: 'mt-4',
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

  const copySignatureToClipboard = () => {
    navigator.clipboard.writeText(signature)
  }

  return (
    <UtilFormBox
      text={t('utilities-text.sign-message')}
      title={t('sign-message')}
    >
      <TextArea
        placeholder={t('message-placeholder')}
        rows={3}
        {...messageInput}
      />
      {signature && (
        <div className="bg-slate-100 mt-4 pb-1 pt-2 px-1 break-all rounded-2xl">
          <div className="flex items-center justify-between px-2">
            <label className="text-slate-600">{t('signature')}</label>
            <SvgContainer
              className="w-5 cursor-pointer"
              name="copy"
              onClick={copySignatureToClipboard}
            />
          </div>
          <div className="border-slate-100 mt-2 p-4 w-full bg-white border rounded-2xl">
            {signature}
          </div>
        </div>
      )}

      <Button {...signButton}>{t('sign')}</Button>

      <p className={`text-center text-sm mt-4 mb-8 ${feedback.color}`}>
        {feedback.message}
      </p>
      <div className="flex gap-2 items-center justify-center w-full max-w-lg text-gray-400 text-xs">
        <a
          className="flex items-center hover:text-black rounded-full focus:outline-none"
          href="https://etherscan.io/verifiedSignatures"
          rel="noreferrer"
          target="_blank"
        >
          <SvgContainer className="inline-block mr-2" name="etherscan" />
          {t('verify-signature-etherscan')}
        </a>
        <span className="text-slate-200">|</span>
        <a
          className="flex gap-1 items-center hover:text-black rounded-full focus:outline-none"
          href="https://github.com/hemilabs/pure.finance/blob/master/site/pages/[locale]/sign-message.js"
          rel="noreferrer"
          target="_blank"
        >
          <SvgContainer className="inline-block" name="Github" />
          {t('view-source-code')}
        </a>
      </div>
    </UtilFormBox>
  )
}

const SignMessage = function () {
  const t = useTranslations()
  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('sign-message')}
      walletConnection
    >
      <SignMessageForm />
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'
export default SignMessage
