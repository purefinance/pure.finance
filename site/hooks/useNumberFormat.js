import { useTranslations } from 'next-intl'

export const useNumberFormat = function () {
  const { lang } = useTranslations()

  return number =>
    new Intl.NumberFormat(lang, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
    }).format(number)
}
