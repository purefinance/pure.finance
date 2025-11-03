import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilityForm from '../../../components/layout/UtilityForm'
import EditStream from '../../../components/payment-streams/EditStream'

const PaymentStreamsEdit = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilityForm title={t('payment-streams')}>
        <EditStream />
      </UtilityForm>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsEdit
