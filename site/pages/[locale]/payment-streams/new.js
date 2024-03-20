import { useTranslations } from 'next-intl'

import CreateStream from '../../../components/payment-streams/CreateStream'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'
import UtilFormBox from '../../../components/UtilFormBox'

const PaymentStreamsCreate = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilFormBox title={t('payment-streams')}>
        <CreateStream />
      </UtilFormBox>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsCreate
