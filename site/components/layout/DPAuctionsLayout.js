import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from '../context/Transactions'
import DPAuctionsContextProvider from '../DPAuctionsContext'
import Transactions from '../Transactions'

import ToolsLayout from './ToolsLayout'

function DPAuctionsLayout({ children }) {
  const t = useTranslations()
  return (
    <TransactionsContextProvider>
      <DPAuctionsContextProvider>
        <ToolsLayout title={t('dp-auctions')} walletConnection>
          {children}
        </ToolsLayout>
        <Transactions />
      </DPAuctionsContextProvider>
    </TransactionsContextProvider>
  )
}

export default DPAuctionsLayout
