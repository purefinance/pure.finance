import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import CreateStream from '../../../components/payment-streams/CreateStream'

const PaymentStreamsCreate = () => (
  <PaymentStreamsLayout>
    <CreateStream />
  </PaymentStreamsLayout>
)

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'

export default PaymentStreamsCreate
