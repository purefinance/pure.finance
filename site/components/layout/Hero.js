import { useTranslations } from 'next-intl'

const Hero = function () {
  const t = useTranslations()
  return (
    <div className="border-grayscale-950 from-grayscale-950/10 relative -mt-24 flex flex-col items-center justify-center overflow-hidden border-b bg-gradient-to-t px-8 pb-20">
      <div className="z-10 mt-20 md:mt-28">
        <h1 className="max-w-xl text-center text-4xl font-semibold md:max-w-3xl md:text-5xl">
          {t('empower-journey')}{' '}
          <span className="text-grayscale-400">{t('cutting-edge')}</span>{' '}
          {t('tools')}
        </h1>
      </div>
    </div>
  )
}

export default Hero
