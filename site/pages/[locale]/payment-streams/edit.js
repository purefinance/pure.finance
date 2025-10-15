import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilFormBox from '../../../components/layout/UtilFormBox'
import EditStream from '../../../components/payment-streams/EditStream'

const PaymentStreamsEdit = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilFormBox title={t('payment-streams')}>
        <EditStream />
      </UtilFormBox>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsEdit
