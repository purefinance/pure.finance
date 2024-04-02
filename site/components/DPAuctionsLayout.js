import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from './context/Transactions'
import DPAuctionsContextProvider from './DPAuctionsContext'
import Layout from './Layout'
import Transactions from './Transactions'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations()
  return (
    <TransactionsContextProvider>
      <DPAuctionsContextProvider>
        <Layout title={t('dp-auctions')} walletConnection>
          {children}
        </Layout>
        <Transactions />
      </DPAuctionsContextProvider>
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
