import { useTranslations } from 'next-intl'

import { HemiLogoDashed } from '../HemiLogo'

const Hero = () => {
  const t = useTranslations()
  return (
    <div className="border-orange-950 from-orange-opacity relative flex flex-col items-center justify-center -mt-24 pb-20 px-8 bg-gradient-to-t border-b overflow-hidden">
      <div className="relative flex justify-center">
        <div className="w-128 absolute">
          <HemiLogoDashed />
        </div>
      </div>
      <div className="z-10 mt-64 md:mt-72">
        <h1 className="max-w-xl text-center text-4xl font-semibold md:max-w-3xl md:text-5xl">
          {t('empower-journey')}{' '}
          <span className="text-orange-950">{t('cutting-edge')}</span>{' '}
          {t('tools')}
        </h1>
      </div>
    </div>
  )
}

export default Hero
