import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import StreamTables from '../../../components/payment-streams/StreamTables'

const PaymentStreams = () => (
  <PaymentStreamsLayout>
    <StreamTables />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'

export default PaymentStreams
