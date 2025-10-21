import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from '../context/Transactions'
import PaymentStreamsLibContextProvider from '../context/PaymentStreamsLib'
import Transactions from '../Transactions'

import ToolsLayout from './ToolsLayout'
import UtilityBox from './UtilityBox'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations()
  const tHelperText = useTranslations('helper-text.payment-streams')

  const helperText = {
    questions: [
      {
        answer: tHelperText('answer-1'),
        title: tHelperText('question-1')
      }
    ],
    text: tHelperText('text'),
    title: tHelperText('title')
  }

  return (
    <TransactionsContextProvider>
      <ToolsLayout
        breadcrumb
        helperText={helperText}
        title={t('payment-streams')}
        walletConnection
      >
        <UtilityBox
          className="md:max-w-none"
          subtitle={t('utilities-text.payment-streams')}
          title={t('payment-streams')}
        >
          <PaymentStreamsLibContextProvider>
            {children}
          </PaymentStreamsLibContextProvider>
        </UtilityBox>
      </ToolsLayout>
      <Transactions />
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
