import StreamsTable from '../../../components/payment-streams/StreamsTable'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'

const PaymentStreams = () => (
  <PaymentStreamsLayout>
    <StreamsTable />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreams
