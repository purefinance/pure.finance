import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import Button from '../../components/Button'
import Layout from '../../components/Layout'
import { useUpdatingStateAsync } from '../../hooks/useUpdatingState'
import { useWeb3React } from '@web3-react/core'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

// TODO
const CreateStream = function () {
  const { active, account } = useWeb3React()
  const disabled = !active || !account

  const router = useRouter()
  const handleClick = function (e) {
    e.preventDefault()
    router.push('/payment-streams/new')
  }

  return (
    <Button disabled={disabled} onClick={handleClick}>
      {/* // TODO translate */}
      Create Stream
    </Button>
  )
}

// TODO table: status, in/out, to/from, value?, progress%, start, end, link
const StreamsTable = function ({ ...props }) {
  const { active, account } = useWeb3React()
  const connected = !!(active && account)

  // TODO
  const getStreams = () => []
  const { state, updating } = useUpdatingStateAsync(
    [],
    getStreams,
    ETH_BLOCK_TIME * 1000,
    [active, account]
  )

  return (
    <div {...props}>
      {connected && state.length
        ? 'TABLE'
        : connected && updating
        ? 'UPDATING'
        : connected
        ? 'NO DATA'
        : 'DISCONNECTED'}
    </div>
  )
}

// This is the main app component.
export default function PaymentStreams() {
  const { t } = useTranslation('common')
  return (
    <Layout title={t('payment-streams')} walletConnection>
      <div className="mt-10 w-full">
        <CreateStream />
        <StreamsTable className="mt-8" />
      </div>
    </Layout>
  )
}
