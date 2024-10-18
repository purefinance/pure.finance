import { useTranslations } from 'next-intl'

import Socials from './Socials'

const ToolsFooter = function () {
  const t = useTranslations()
  return (
    <div className="flex items-center justify-between m-6 text-gray-500">
      <p>{t('copyright')}</p>
      <Socials />
    </div>
  )
}

export default ToolsFooter
