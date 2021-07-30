import { DateTime } from 'luxon'
import Link from 'next/link'
import orderBy from 'lodash.orderby'
import useSWR from 'swr'
import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'

import Layout from '../../components/Layout'
import TokenAmount from '../../components/TokenAmount'
import fetchJson from '../../utils/fetch-json'
import ssDpa from '../../utils/dp-auctions'
import { useUpdatingState } from '../../hooks/useUpdatingState'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

// This component renders an auction row. When clicked, the view changes to the
// auction details page.
//
// The remaining time is shown in minutes. So every 10 seconds the remaining
// time is re-calculated.
const DPAuctionsRow = function ({ auction }) {
  const { lang, t } = useTranslation('common')

  const calcEndTime = () =>
    Date.now() +
    (auction.endBlock - auction.currentBlock) * ETH_BLOCK_TIME * 1000
  const endTime = useUpdatingState(calcEndTime, 10000, [auction.currentBlock]) // 10s

  return (
    <Link href={`dp-auctions/auctions/${auction.id}`}>
      <tr className="cursor-pointer">
        <td className="border-2">{auction.id}</td>
        <td className="border-2">
          {auction.tokens.map((token) => (
            <div key={token.address}>
              <TokenAmount {...token} />
            </div>
          ))}
        </td>
        <td className="border-2">
          {auction.status === 'won' || auction.status === 'stopped' ? (
            '-'
          ) : (
            <TokenAmount
              amount={auction.currentPrice}
              {...auction.paymentToken}
            />
          )}
        </td>
        <td className="border-2">
          {t(auction.status)}
          {auction.status === 'running' &&
            ` (${t('ends')} ${DateTime.fromMillis(endTime).toRelative({
              locale: lang
            })})`}
        </td>
      </tr>
    </Link>
  )
}

// This component renders the list of auctions.
const DPAuctionsTable = function ({ auctions }) {
  const { t } = useTranslation('common')
  const [showEnded, setShowEnded] = useState(false)

  const sortedAuctions = orderBy(
    auctions,
    ['endBlock', 'id'],
    ['desc', 'desc']
  ).filter((auction) => showEnded || !auction.stopped)

  return (
    <>
      {sortedAuctions.length ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="font-bold bg-gray-200">
              <th className="border-2">{t('id')}</th>
              <th className="border-2">{t('contains')}</th>
              <th className="border-2">{t('price')}</th>
              <th className="border-2">{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedAuctions.map((auction) => (
              <DPAuctionsRow auction={auction} key={auction.id} />
            ))}
          </tbody>
        </table>
      ) : (
        <div>{t('no-auctions')}</div>
      )}
      <div className="mt-2">
        <input
          checked={showEnded}
          className="mr-1"
          id="ended-toggle"
          onChange={() => setShowEnded(!showEnded)}
          type="checkbox"
        />
        <label htmlFor="ended-toggle">{t('show-ended-auctions')}</label>
      </div>
    </>
  )
}

// The auctions are grouped in collections. The default is collection ID 0. The
// ID in the contracts is a uint256 so using strings here.
//
// In the MVP only collection ID 0 will be used/available.
const DEFAULT_COLLECTION_ID = '0'

// This is the main app component. It holds all the views like the auctions
// list, the auction detail, etc.
export default function DPAuctions({ initialData, error }) {
  const { t } = useTranslation('common')

  // The list of auctions in the collection is managed by SWR. It is set to
  // revalidate aprox. on every block (15 seconds).
  const { data: auctions } = useSWR(
    `/api/dp-auctions/collections/${DEFAULT_COLLECTION_ID}`,
    fetchJson,
    { initialData, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  return (
    <Layout title={t('dp-auctions')} walletConnection>
      <div className="w-full mt-10">
        <div className="font-bold text-gray-600 mb-1.5">
          {t('collection')} {DEFAULT_COLLECTION_ID}
        </div>
        {error ? (
          <div>
            {t('error-getting-auctions')}: {error}
          </div>
        ) : (
          <DPAuctionsTable auctions={auctions} />
        )}
      </div>
    </Layout>
  )
}

// Get the list of collections and build the page in the server aprox. on every
// block (15 seconds).
export const getStaticProps = () =>
  ssDpa
    .getCollectionAuctions(DEFAULT_COLLECTION_ID)
    .then((initialData) => ({ props: { initialData } }))
    .catch((err) => ({ props: { initialData: [], error: err.message } }))
    .then(({ props }) => ({ props, revalidate: ETH_BLOCK_TIME }))
