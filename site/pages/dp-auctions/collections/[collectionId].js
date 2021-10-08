import { DateTime } from 'luxon'
import Link from 'next/link'
import orderBy from 'lodash.orderby'
import useSWR from 'swr'
import { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'

import Dropdown from '../../../components/Dropdown'
import Layout from '../../../components/Layout'
import SvgContainer from '../../../components/svg/SvgContainer'
import TokenAmount from '../../../components/TokenAmount'
import fetchJson from '../../../utils/fetch-json'
import ssDpa from '../../../utils/dp-auctions'
import { useUpdatingState } from '../../../hooks/useUpdatingState'

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
    <Link href={`/dp-auctions/auctions/${auction.id}`} passHref>
      <tr className="cursor-pointer">
        <td className="border-2">{auction.id}</td>
        <td className="border-2">
          {auction.tokens.map(token => (
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
    auctions.filter(auction => showEnded || !auction.stopped),
    ['endBlock', 'id'],
    ['asc', 'desc']
  )

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
            {sortedAuctions.map(auction => (
              <DPAuctionsRow auction={auction} key={auction.id} />
            ))}
          </tbody>
        </table>
      ) : (
        <div>{t('no-auctions')}</div>
      )}
      {auctions.length ? (
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
      ) : null}
    </>
  )
}

// To allow the Dropdown component to send open/close status and keep track of
// what collection is selected, the selector component has to be created on the
// fly keeping the selected collection in the closure.
const createCollectionSelector = collectionId =>
  function CollectionSelector({ isOpen }) {
    const { t } = useTranslation('common')

    const rotate = isOpen ? 'transform rotate-180' : ''
    return (
      <div className="font-bold">
        {t('collection', { collectionId })}
        <SvgContainer
          className={`absolute inline w-6 h-6 fill-current ${rotate}`}
          name="caret"
        />
      </div>
    )
  }

// Use a Dropdown component to allow selecting another existing collection.
const DPAuctionsCollectionSelector = function ({ count, collectionId }) {
  const { t } = useTranslation('common')

  const Selector = createCollectionSelector(collectionId)

  return (
    <div className="flex justify-center">
      <Dropdown
        Selector={Selector}
        className="mb-4 w-48 text-gray-600 cursor-pointer"
      >
        <ul className="absolute z-10 mt-1 w-48 bg-white border-2 shadow-lg">
          {new Array(count).fill(null).map((_, i) =>
            Number.parseInt(collectionId) === i ? (
              <li className={'font-bold'} key={i}>
                {t('collection', { collectionId: i })}
              </li>
            ) : (
              <Link href={`/dp-auctions/collections/${i}`} passHref>
                <li key={i}>{t('collection', { collectionId: i })}</li>
              </Link>
            )
          )}
        </ul>
      </Dropdown>
    </div>
  )
}

// This is the main app component. It holds all the views like the auctions
// list, the auction detail, etc.
export default function DPAuctions(props) {
  const { collectionId, initialCount, initialAuctions, error } = props

  const { t } = useTranslation('common')

  // The amount of collections is managed by SWR. It is set to revalidate aprox.
  // every block (15 seconds).
  const { data: count } = useSWR(
    `/api/dp-auctions/collections/count`,
    fetchJson,
    { fallbackData: initialCount, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  // The list of auctions in the collection is managed by SWR. It is set to
  // revalidate aprox. every block (15 seconds).
  const { data: auctions } = useSWR(
    `/api/dp-auctions/collections/${collectionId}`,
    fetchJson,
    { fallbackData: initialAuctions, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  return (
    <Layout title={t('dp-auctions')} walletConnection>
      <div className="mt-10 w-full">
        <DPAuctionsCollectionSelector
          collectionId={collectionId}
          count={count}
        />
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

// Get the list of auctions in the collection and the collection count. Then
// build the page with the list of auctions in the server aprox. on every block
// (15 seconds).
// If the collection id is greater than the number of collections, 404!
export const getStaticProps = ({ params }) =>
  Promise.all([
    ssDpa.getCollectionAuctions(params.collectionId),
    ssDpa.getTotalCollections()
  ])
    .then(([initialAuctions, initialCount]) => ({
      notFound: Number.parseInt(params.collectionId) >= initialCount,
      props: {
        collectionId: params.collectionId,
        initialAuctions,
        initialCount
      },
      revalidate: ETH_BLOCK_TIME
    }))
    .catch(err => ({
      props: {
        collectionId: params.collectionId,
        error: err.message
      }
    }))

// Do not statically render any collections page other than the default one,
// which has ID 0. Use SSR for the rest of the collections.
export const getStaticPaths = () => ({
  paths: [{ params: { collectionId: process.env.DEFAULT_COLLECTION_ID } }],
  fallback: 'blocking'
})
