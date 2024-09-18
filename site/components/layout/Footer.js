import Link from 'next/link'
import { useTranslations } from 'next-intl'

import SvgContainer from '../svg/SvgContainer'

const Footer = function () {
  const t = useTranslations()
  return (
    <div className="flex items-center justify-between mt-8 p-8 text-gray-500 border-t-2">
      <div>
        <p>{t('copyright')}</p>
      </div>
      <div className="flex gap-3">
        <Link href="https://x.com/hemi_xyz" target="_blank">
          <SvgContainer className="w-6" name="twitter" />
        </Link>
        <Link href="https://discord.gg/hemixyz" target="_blank">
          <SvgContainer className="w-6" name="discord" />
        </Link>
        <Link href="https://github.com/hemilabs" target="_blank">
          <SvgContainer className="w-6" name="github" />
        </Link>
        <Link href="https://www.linkedin.com/company/hemi-labs" target="_blank">
          <SvgContainer className="w-6" name="linkedin" />
        </Link>
      </div>
    </div>
  )
}

export default Footer
