import { useTranslations } from 'next-intl'

import PaymentStreamsLayout from '../../../components/layout/PaymentStreamsLayout'
import UtilFormBox from '../../../components/layout/UtilFormBox'
import StreamsTable from '../../../components/payment-streams/StreamsTable'

const PaymentStreams = () => {
  const t = useTranslations()
  return (
    <PaymentStreamsLayout>
      <UtilFormBox className="md:w-200" title={t('payment-streams')}>
        <StreamsTable />
      </UtilFormBox>
    </PaymentStreamsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../utils/staticProps'
export default PaymentStreams
