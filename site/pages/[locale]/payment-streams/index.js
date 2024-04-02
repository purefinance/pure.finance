import { useTranslations } from 'next-intl'

import StreamsTable from '../../../components/payment-streams/StreamsTable'
import PaymentStreamsLayout from '../../../components/PaymentStreamsLayout'
import UtilFormBox from '../../../components/UtilFormBox'

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
