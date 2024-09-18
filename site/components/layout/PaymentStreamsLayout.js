import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from '../context/Transactions'
import PaymentStreamsLibContextProvider from '../payment-streams/PaymentStreamsLib'
import Transactions from '../Transactions'

import ToolsLayout from './ToolsLayout'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations()
  return (
    <TransactionsContextProvider>
      <PaymentStreamsLibContextProvider>
        <ToolsLayout title={t('payment-streams')} walletConnection>
          {children}
        </ToolsLayout>
        <Transactions />
      </PaymentStreamsLibContextProvider>
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
