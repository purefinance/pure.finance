import Link from 'next/link'
import Button from './Button'
import useTranslation from 'next-translate/useTranslation'

const UtilityBox = ({ buttonText, buttonHref }) => (
  <div className="mx-2 mt-6">
    <Link href={buttonHref}>
      <a>
        <div className="border-2 rounded-md">
          <div className="pb-14 px-0.5">
            <img height={156} src="/utilities-box-graphic.png" width={336} />
          </div>
        </div>
        <div className="flex justify-center -mt-6">
          <div className="mx-auto">
            <Button>{buttonText.toUpperCase()}</Button>
          </div>
        </div>
      </a>
    </Link>
  </div>
)

const Utilities = function () {
  const { t } = useTranslation('common')
  return (
    <div className="flex flex-wrap justify-center w-full">
      <div className="w-full mb-3.5">
        <p className="font-bold text-center text-gray-600">{t('utilties')}</p>
      </div>
      <UtilityBox buttonHref="/merkle-claims" buttonText={t('merkle-claims')} />
      <UtilityBox
        buttonHref="/sablier-claims"
        buttonText={t('sablier-claims')}
      />
      <UtilityBox
        buttonHref="/token-approvals"
        buttonText={t('token-approvals')}
      />
      <UtilityBox buttonHref="/wrap-eth" buttonText={t('wrap-unwrap-eth')} />
      <UtilityBox buttonHref="/token-revokes" buttonText={t('token-revokes')} />
    </div>
  )
}

export default Utilities
