import orderBy from 'lodash.orderby'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { useLocale, useTranslations } from 'next-intl'
import { useContext, useState } from 'react'
import useSWR from 'swr'

import { DPAuctionsContext } from '../../../../components/DPAuctionsContext'
import Dropdown from '../../../../components/Dropdown'
import DPAuctionsLayout from '../../../../components/layout/DPAuctionsLayout'
import UtilFormBox from '../../../../components/layout/UtilFormBox'
import SvgContainer from '../../../../components/svg/SvgContainer'
import TokenAmount from '../../../../components/TokenAmount'
import { useUpdatingState } from '../../../../hooks/useUpdatingState'
import { Link } from '../../../../navigation'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

// This component renders an auction row. When clicked, the view changes to the
// auction details page.
//
// The remaining time is shown in minutes. So every 10 seconds the remaining
// time is re-calculated.
const DPAuctionsRow = function ({ auction }) {
  const locale = useLocale()
  const t = useTranslations()

  const calcEndTime = () =>
    Date.now() +
    (auction.endBlock - auction.currentBlock) * ETH_BLOCK_TIME * 1000
  const endTime = useUpdatingState(calcEndTime, 10000, [auction.currentBlock]) // 10s

  return (
    <Link href={`/dp-auctions/auctions?id=${auction.id}`} passHref>
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
              locale
            })})`}
        </td>
      </tr>
    </Link>
  )
}

// This component renders the list of auctions.
const DPAuctionsTable = function ({ auctions }) {
  const t = useTranslations()
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
            <tr className="bg-gray-200 font-bold">
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
    const t = useTranslations()

    const rotate = isOpen ? 'transform rotate-180' : ''
    return (
      <div className="font-bold">
        {t('collection', { collectionId })}
        <SvgContainer
          className={`absolute inline h-6 w-6 fill-current ${rotate}`}
          name="caret"
        />
      </div>
    )
  }

// Use a Dropdown component to allow selecting another existing collection.
const DPAuctionsCollectionSelector = function ({ count, collectionId }) {
  const t = useTranslations()

  const Selector = createCollectionSelector(collectionId)

  return (
    <div className="flex justify-center">
      <Dropdown
        Selector={Selector}
        className="mb-4 w-48 cursor-pointer text-gray-600"
      >
        <ul className="absolute z-10 mt-1 w-40 rounded-xl bg-white p-2 text-center shadow-lg">
          {new Array(count).fill(null).map((_, i) =>
            Number.parseInt(collectionId) === i ? (
              <li className={'font-bold'} key={i}>
                {t('collection', { collectionId: i })}
              </li>
            ) : (
              <Link
                href={`/dp-auctions/collections?collectionId=${i}`}
                key={i}
                passHref
              >
                <li>{t('collection', { collectionId: i })}</li>
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
export default function DPAuctions({
  initialCount = 0,
  initialAuctions = [],
  error
}) {
  const t = useTranslations()
  const {
    query: { id: collectionId = process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID }
  } = useRouter()

  const dpa = useContext(DPAuctionsContext)

  // The amount of collections is managed by SWR. It is set to revalidate aprox.
  // every block (15 seconds).
  const { data: count } = useSWR(
    `dp-auctions-collections-count`,
    () =>
      dpa.getTotalCollections().catch(function (err) {
        console.warn('Could not get collection count', err.message)
        return ''
      }),
    { fallbackData: initialCount, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  // The list of auctions in the collection is managed by SWR. It is set to
  // revalidate aprox. every block (15 seconds).
  const { data: auctions } = useSWR(
    `dp-auctions-collections-${collectionId}`,
    () =>
      dpa.getCollectionAuctions(collectionId).catch(function (err) {
        console.warn(
          'Could not get auctions in collection',
          collectionId,
          err.message
        )
        return []
      }),
    { fallbackData: initialAuctions, refreshInterval: ETH_BLOCK_TIME * 1000 }
  )

  return (
    <DPAuctionsLayout>
      <UtilFormBox className="md:w-200" title={t('dp-auctions')}>
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
      </UtilFormBox>
    </DPAuctionsLayout>
  )
}

export { getStaticProps, getStaticPaths } from '../../../../utils/staticProps'
