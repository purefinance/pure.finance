import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import StreamsTable from '../../../components/payment-streams/StreamsTable'

const PaymentStreams = () => (
  <PaymentStreamsLayout>
    <StreamsTable />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'

export default PaymentStreams
