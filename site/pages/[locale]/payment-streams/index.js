import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilityForm from '../../../components/layout/UtilityForm'
import StreamsTable from '../../../components/payment-streams/StreamsTable'

const PaymentStreams = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilityForm className="md:w-200" title={t('payment-streams')}>
        <StreamsTable />
      </UtilityForm>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreams
