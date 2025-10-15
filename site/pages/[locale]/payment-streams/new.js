import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilityForm from '../../../components/layout/UtilityForm'
import CreateStream from '../../../components/payment-streams/CreateStream'

const PaymentStreamsCreate = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilityForm title={t('payment-streams')}>
        <CreateStream />
      </UtilityForm>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreamsCreate
