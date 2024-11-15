import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import React from 'react'

import Button from '../../components/Button'
import { TextArea } from '../../components/Input'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilFormBox from '../../components/layout/UtilFormBox'
import SvgContainer from '../../components/svg/SvgContainer'

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
        <div className="bg-slate-100 mt-4 break-all rounded-2xl px-1 pb-1 pt-2">
          <div className="flex items-center justify-between px-2">
            <label className="text-slate-600">{t('signature')}</label>
            <SvgContainer
              className="w-5 cursor-pointer"
              name="copy"
              onClick={copySignatureToClipboard}
            />
          </div>
          <div className="border-slate-100 mt-2 w-full rounded-2xl border bg-white p-4">
            {signature}
          </div>
        </div>
      )}

      <Button {...signButton}>{t('sign')}</Button>

      <p className={`mb-8 mt-4 text-center text-sm ${feedback.color}`}>
        {feedback.message}
      </p>
      <div className="flex w-full max-w-lg items-center justify-center gap-2 text-xs text-gray-400">
        <a
          className="focus:outline-none flex items-center rounded-full hover:text-black"
          href="https://etherscan.io/verifiedSignatures"
          rel="noreferrer"
          target="_blank"
        >
          <SvgContainer className="mr-2 inline-block" name="etherscan" />
          {t('verify-signature-etherscan')}
        </a>
        <span className="text-slate-200">|</span>
        <a
          className="focus:outline-none flex items-center gap-1 rounded-full hover:text-black"
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
  const tHelperText = useTranslations('helper-text.sign-message')

  const helperText = {
    title: tHelperText('title'),
    text: tHelperText('text'),
    questions: [
      {
        title: tHelperText('how-verify-question'),
        answer: tHelperText('how-verify-answer')
      }
    ]
  }

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
