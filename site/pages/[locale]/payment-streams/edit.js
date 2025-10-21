import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import EditStream from '../../../components/payment-streams/EditStream'

const PaymentStreamsEdit = () => (
  <PaymentStreamsLayout>
    <EditStream />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'

export default PaymentStreamsEdit
