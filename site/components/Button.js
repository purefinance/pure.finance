const Button = ({ children, ...props }) => (
  <div {...props} className="w-63 bg-black rounded-3xl py-3 text-white text-center font-bold text-sm cursor-pointer hover:bg-gray-800">
    {children}
  </div>
)

export default Button