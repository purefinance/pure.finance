import useTranslation from 'next-translate/useTranslation'
import EditStream from '../../components/payment-streams/EditStream'

import Layout from '../../components/Layout'
import Transactions from '../../components/Transactions'
import CreateStream from '../../components/payment-streams/CreateStream'
import StreamsTable from '../../components/payment-streams/StreamsTable'

import { PaymentStreamsLibContextProvider } from '../../components/payment-streams/PaymentStreamsLib'
import { TransactionsContextProvider } from '../../components/context/Transactions'
import { useRouter } from 'next/router'

const PaymentStreams = function () {
  const { t } = useTranslation('payment-streams')
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

export const getStaticProps = () => ({})
export default PaymentStreams
