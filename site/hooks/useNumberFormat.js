import { useLocale } from 'next-intl'

export const useNumberFormat = function (max = 6, min = 2) {
  const locale = useLocale()

  return number =>
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: max,
      minimumFractionDigits: min
    }).format(number)
}
