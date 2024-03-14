import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from './context/Transactions'
import Layout from './Layout'
import { PaymentStreamsLibContextProvider } from './payment-streams/PaymentStreamsLib'
import Transactions from './Transactions'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations('PaymentStreams')
  return (
    <TransactionsContextProvider>
      <PaymentStreamsLibContextProvider>
        <Layout title={t('payment-streams')} walletConnection>
          <div className="mt-10 w-full">{children}</div>
        </Layout>
        <Transactions />
      </PaymentStreamsLibContextProvider>
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
