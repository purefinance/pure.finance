import { useTranslations } from 'next-intl'

import Socials from './Socials'

const ToolsFooter = function () {
  const t = useTranslations()
  return (
    <div className="m-6 flex items-center justify-between text-gray-500">
      <p>{t('copyright')}</p>
      <Socials />
    </div>
  )
}

export default ToolsFooter
