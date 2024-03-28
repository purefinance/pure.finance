import CreateStream from '../../../components/payment-streams/CreateStream'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'

const PaymentStreamsCreate = () => (
  <PaymentStreamsLayout>
    <CreateStream />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsCreate
