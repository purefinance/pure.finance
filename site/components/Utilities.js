import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '../navigation'

import Button from './Button'

const UtilityBox = ({ buttonText, buttonHref }) => (
  <div className="mt-6 mx-2">
    <Link href={buttonHref}>
      <div className="border-2 rounded-md">
        <div className="pb-14 px-0.5">
          <Image
            alt=""
            height={156}
            src="/utilities-box-graphic.png"
            width={336}
          />
        </div>
      </div>
      <div className="flex justify-center -mt-6">
        <div className="mx-auto">
          <Button>{buttonText.toUpperCase()}</Button>
        </div>
      </div>
    </Link>
  </div>
)

const Utilities = function () {
  const t = useTranslations()

  return (
    <div className="flex flex-wrap justify-center w-full">
      <div className="mb-3.5 w-full">
        <p className="text-center text-gray-600 font-bold">{t('utilties')}</p>
      </div>
      <UtilityBox buttonHref="/merkle-claims" buttonText={t('merkle-claims')} />
      <UtilityBox
        buttonHref="/token-approvals"
        buttonText={t('token-approvals')}
      />
      <UtilityBox buttonHref="/wrap-eth" buttonText={t('wrap-unwrap-eth')} />
      <UtilityBox buttonHref="/token-revokes" buttonText={t('token-revokes')} />
      <UtilityBox buttonHref="/dp-auctions" buttonText={t('dp-auctions')} />
      <UtilityBox
        buttonHref="/payment-streams"
        buttonText={t('payment-streams')}
      />
      <UtilityBox buttonHref="/sign-message" buttonText={t('sign-message')} />
    </div>
  )
}

export default Utilities
