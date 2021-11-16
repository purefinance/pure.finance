import useTranslation from 'next-translate/useTranslation'

export const useNumberFormat = function () {
  const { lang } = useTranslation()

  return number =>
    new Intl.NumberFormat(lang, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 2
    }).format(number)
}
