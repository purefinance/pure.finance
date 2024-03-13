import { useRouter } from 'next/router'
import { useTranslations } from 'next-intl'

import { TransactionsContextProvider } from '../../../components/context/Transactions'
import Layout from '../../../components/Layout'
import CreateStream from '../../../components/payment-streams/CreateStream'
import EditStream from '../../../components/payment-streams/EditStream'
import { PaymentStreamsLibContextProvider } from '../../../components/payment-streams/PaymentStreamsLib'
import StreamsTable from '../../../components/payment-streams/StreamsTable'
import Transactions from '../../../components/Transactions'

const PaymentStreams = function () {
  const t = useTranslations('PaymentStreams')
  const { query } = useRouter()
  const view = query.view ?? 'index'

  return (
    <TransactionsContextProvider>
      <PaymentStreamsLibContextProvider>
        <Layout title={t('payment-streams')} walletConnection>
          <div className="mt-10 w-full">
            {view === 'index' && <StreamsTable />}
            {view === 'create' && <CreateStream />}
            {view === 'edit' && <EditStream />}
          </div>
        </Layout>
        <Transactions />
      </PaymentStreamsLibContextProvider>
    </TransactionsContextProvider>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreams
