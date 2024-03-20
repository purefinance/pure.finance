import { useTranslations } from 'next-intl'

import EditStream from '../../../components/payment-streams/EditStream'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'
import UtilFormBox from '../../../components/UtilFormBox'

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
