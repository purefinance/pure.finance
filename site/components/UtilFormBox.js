const UtilFormBox = ({ title, className, children }) => (
  <div
    className={`bg-white rounded-2xl px-5 py-4 w-full md:w-100 ${className}`}
  >
    {title && <h1 className="pb-9 text-2xl font-bold">{title}</h1>}
    {children}
  </div>
)

export default UtilFormBox
