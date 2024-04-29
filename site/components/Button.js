const Button = function ({
  children,
  className = '',
  disabled,
  onClick,
  width = 'w-full',
  ...props
}) {
  const boxStyle = `py-3 rounded-xl ${width} focus:outline-none`
  const textCase = className
    .split(' ')
    .filter(Boolean)
    .some(c => ['lowercase', 'normal-case', 'uppercase'].includes(c))
    ? ''
    : 'capitalize'
  const textStyle = `text-center text-base text-white ${textCase}`
  const stateStyle = disabled
    ? 'bg-gray-200 cursor-not-allowed'
    : 'bg-black hover:bg-gray-800'
  return (
    <button
      {...props}
      className={`${boxStyle} ${textStyle} ${stateStyle} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
