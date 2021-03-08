const Button = function ({ children, onClick, disabled, ...props }) {
  const handleClick = () => (disabled || !onClick ? null : onClick())
  return (
    <button
      {...props}
      className={`w-63 bg-black rounded-3xl py-3 text-white text-center font-bold text-sm hover:bg-gray-800 focus:outline-none ${
        disabled && 'bg-gray-600 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

export default Button
