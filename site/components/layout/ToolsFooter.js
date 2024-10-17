import Link from 'next/link'
import { useTranslations } from 'next-intl'

import SvgContainer from '../svg/SvgContainer'

const ToolsFooter = function () {
  const t = useTranslations()
  return (
    <div className="flex items-center justify-between m-6 text-gray-500">
      <div>
        <p>{t('copyright')}</p>
      </div>
      <div className="flex gap-3">
        <Link href="https://x.com/hemi_xyz" target="_blank">
          <SvgContainer
            className="text-grayscale-500 hover:text-grayscale-950 w-6"
            name="twitter"
          />
        </Link>
        <Link href="https://discord.gg/hemixyz" target="_blank">
          <SvgContainer
            className="text-grayscale-500 hover:text-grayscale-950 w-6"
            name="discord"
          />
        </Link>
        <Link href="https://github.com/hemilabs" target="_blank">
          <SvgContainer
            className="text-grayscale-500 hover:text-grayscale-950 w-6"
            name="github"
          />
        </Link>
        <Link href="https://www.linkedin.com/company/hemi-labs" target="_blank">
          <SvgContainer
            className="text-grayscale-500 hover:text-grayscale-950 w-6"
            name="linkedin"
          />
        </Link>
      </div>
    </div>
  )
}

export default ToolsFooter
