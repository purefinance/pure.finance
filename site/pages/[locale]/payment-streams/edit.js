import EditStream from '../../../components/payment-streams/EditStream'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'

const PaymentStreamsEdit = () => (
  <PaymentStreamsLayout>
    <EditStream />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsEdit
