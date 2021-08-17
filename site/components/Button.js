const Button = function ({
  children,
  className = '',
  disabled,
  onClick,
  width = 'w-63',
  ...props
}) {
  const boxStyle = `py-3 rounded-3xl ${width} focus:outline-none`
  const textStyle = 'font-bold text-center text-sm text-white uppercase'
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
