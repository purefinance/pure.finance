import { useTranslations } from 'next-intl'

import { usePathname } from '../navigation'

import Tabs from './Tabs'

function UtilitiesTabs() {
  const t = useTranslations()
  const pathname = usePathname()
  return (
    <div className="flex justify-center">
      <Tabs
        items={[
          {
            href: '/merkle-claims',
            label: t('merkle-claims'),
            selected: pathname === '/merkle-claims'
          },
          {
            href: '/token-approvals',
            label: t('token-approvals'),
            selected: pathname === '/token-approvals'
          },
          {
            href: '/wrap-eth',
            label: t('wrap-unwrap'),
            selected: pathname === '/wrap-eth'
          },
          {
            href: '/token-revokes',
            label: t('token-revokes'),
            selected: pathname === '/token-revokes'
          },
          {
            href: '/dp-auctions',
            label: t('dp-auctions'),
            selected: pathname === '/dp-auctions'
          },
          {
            href: '/payment-streams',
            label: t('payment-streams'),
            selected: pathname === '/payment-streams'
          },
          {
            href: '/sign-message',
            label: t('sign-message'),
            selected: pathname === '/sign-message'
          }
        ]}
      />
    </div>
  )
}

export default UtilitiesTabs
