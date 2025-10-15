import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilFormBox from '../../../components/layout/UtilFormBox'
import CreateStream from '../../../components/payment-streams/CreateStream'

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
