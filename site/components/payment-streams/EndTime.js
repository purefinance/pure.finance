import { useTranslations } from 'next-intl'

import { daysToSeconds, hoursToSeconds, yearsToSeconds } from '../../utils/time'
const EndTime = function ({
  onYearsChange,
  onDaysChange,
  onHoursChange,
  years,
  days,
  hours
}) {
  const t = useTranslations('payment-streams-util')
  const now = new Date().getTime()
  const deltaDate =
    (hoursToSeconds(hours) + daysToSeconds(days) + yearsToSeconds(years)) * 1000
  const endDate = new Date(now + deltaDate)
  const dateFormatter = new Intl.DateTimeFormat('default', {
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    month: 'numeric',
    year: 'numeric'
  })
  return (
    <fieldset className="my-2">
      <legend className="text-gray-600 font-bold">{t('for-how-long')}</legend>
      <select
        onChange={e => onYearsChange(parseInt(e.target.value, 10))}
        value={years}
      >
        {[...Array(11).keys()].map(year => (
          <option key={year} value={year}>
            {t('count-years', { count: year })}
          </option>
        ))}
      </select>
      <select
        onChange={e => onDaysChange(parseInt(e.target.value, 10))}
        value={days}
      >
        {[...Array(365).keys()].map(day => (
          <option key={day} value={day}>
            {t('count-days', { count: day })}
          </option>
        ))}
      </select>
      <select
        onChange={e => onHoursChange(parseInt(e.target.value, 10))}
        value={hours}
      >
        {[...Array(24).keys()].map(hour => (
          <option key={hour} value={hour}>
            {t('count-hours', { count: hour })}
          </option>
        ))}
      </select>
      <p className={deltaDate === 0 ? 'invisible' : ''}>
        {t('stream-ends-in', { date: dateFormatter.format(endDate) })}
      </p>
    </fieldset>
  )
}

export default EndTime
