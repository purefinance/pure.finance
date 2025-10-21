import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import Button from '../../components/Button'
import CallToAction from '../../components/CallToAction'
import { ExternalLink } from '../../components/ExternalLink'
import { TextArea } from '../../components/Input'
import ToolsLayout from '../../components/layout/ToolsLayout'
import UtilityBox from '../../components/layout/UtilityBox'
import SvgContainer from '../../components/svg/SvgContainer'
import { TextLabel } from '../../components/TextLabel'
import { TextOutput } from '../../components/TextOutput'
import { useEphemeralState } from '../../hooks/useEphemeralState'

function SignatureVerificationLinks() {
  const t = useTranslations()

  return (
    <div className="mt-4 flex w-full max-w-lg items-center justify-center gap-2 text-xs">
      <ExternalLink href="https://etherscan.io/verifiedSignatures">
        <SvgContainer className="mr-2 inline-block" name="etherscan" />
        {t('verify-signature-etherscan')}
      </ExternalLink>
      <span className="text-slate-200">|</span>
      <ExternalLink href="https://github.com/purefinance/pure.finance/blob/master/site/pages/[locale]/sign-message.js">
        <SvgContainer className="mr-2 inline-block text-black" name="github" />
        {t('view-source-code')}
      </ExternalLink>
    </div>
  )
}

function SignMessageForm() {
  const { account, active, library: web3 } = useWeb3React()
  const t = useTranslations()

  const [errorMessage, setErrorMessage] = useEphemeralState('')
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')

  useEffect(
    function resetSignature() {
      setSignature('')
    },
    [account, message, setSignature]
  )

  function onMessageChange(event) {
    setMessage(event.target.value)
  }

  function handleSubmit(event) {
    event.preventDefault()

    web3.eth.personal
      .sign(message, account)
      .then(function (_signature) {
        setSignature(_signature)
      })
      .catch(function (err) {
        setErrorMessage(err.message.split('\n')[0])
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextArea
        onChange={onMessageChange}
        placeholder={t('message-placeholder')}
        rows={3}
      />
      <TextOutput label={t('signature')} value={signature} />
      <CallToAction>
        <Button disabled={!active || !message} type="submit">
          {t('sign')}
        </Button>
      </CallToAction>
      <TextLabel color={'text-error'} value={errorMessage} />
      <SignatureVerificationLinks />
    </form>
  )
}

function SignMessage() {
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.sign-message')

  const helperText = {
    questions: [
      {
        answer: tHelperText('how-verify-answer'),
        title: tHelperText('how-verify-question')
      }
    ],
    text: tHelperText('text'),
    title: tHelperText('title')
  }

  return (
    <ToolsLayout
      breadcrumb
      helperText={helperText}
      title={t('sign-message')}
      walletConnection
    >
      <UtilityBox
        subtitle={t('utilities-text.sign-message')}
        title={t('sign-message')}
      >
        <SignMessageForm />
      </UtilityBox>
    </ToolsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'

export default SignMessage
