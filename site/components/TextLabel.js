export const TextLabel = ({ color, value }) =>
  value ? <p className={`mt-4 text-center text-sm ${color}`}>{value}</p> : null
