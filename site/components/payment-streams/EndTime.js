import { useTranslations } from 'next-intl'

import { daysToSeconds, hoursToSeconds, yearsToSeconds } from '../../utils/time'
import { InputTitle } from '../Input'
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
    <fieldset className="my-2 w-full">
      <InputTitle>{t('for-how-long')}</InputTitle>
      <div className="flex space-x-2">
        <select
          className="p-2 w-1/3 rounded-xl"
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
          className="p-2 w-1/3 rounded-xl"
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
          className="p-2 w-1/3 rounded-xl"
          onChange={e => onHoursChange(parseInt(e.target.value, 10))}
          value={hours}
        >
          {[...Array(24).keys()].map(hour => (
          <option key={hour} value={hour}>
            {t('count-hours', { count: hour })}
          </option>
          ))}
        </select>
      </div>
      <p className={deltaDate === 0 ? 'invisible' : ''}>
        {t('stream-ends-in', { date: dateFormatter.format(endDate) })}
      </p>
    </fieldset>
  )
}

export default EndTime
