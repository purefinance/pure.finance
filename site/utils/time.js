export const hoursToSeconds = hours => hours * 60 * 60
export const daysToSeconds = days => hoursToSeconds(days * 24)
export const yearsToSeconds = years => daysToSeconds(years * 365)
