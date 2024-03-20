import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from './context/Transactions'
import Layout from './Layout'
import { PaymentStreamsLibContextProvider } from './payment-streams/PaymentStreamsLib'
import Transactions from './Transactions'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations()
  return (
    <TransactionsContextProvider>
      <PaymentStreamsLibContextProvider>
        <Layout title={t('payment-streams')} walletConnection>
          {children}
        </Layout>
        <Transactions />
      </PaymentStreamsLibContextProvider>
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
