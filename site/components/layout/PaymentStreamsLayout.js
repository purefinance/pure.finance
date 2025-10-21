import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from '../context/Transactions'
import PaymentStreamsLibContextProvider from '../payment-streams/PaymentStreamsLib'
import Transactions from '../Transactions'

import ToolsLayout from './ToolsLayout'
import UtilityBox from './UtilityBox'

function PaymentStreamsLayout({ children }) {
  const t = useTranslations()

  return (
    <TransactionsContextProvider>
      <PaymentStreamsLibContextProvider>
        <ToolsLayout breadcrumb title={t('payment-streams')} walletConnection>
          <UtilityBox className="md:max-w-none" title={t('payment-streams')}>
            {children}
          </UtilityBox>
        </ToolsLayout>
        <Transactions />
      </PaymentStreamsLibContextProvider>
    </TransactionsContextProvider>
  )
}

export default PaymentStreamsLayout
