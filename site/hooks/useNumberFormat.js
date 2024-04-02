import { useLocale } from 'next-intl'

export const useNumberFormat = function () {
  const locale = useLocale()

  return number =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
    }).format(number)
}
