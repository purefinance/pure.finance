const UtilFormBox = ({ title, text, className, children }) => (
  <div
    className={`bg-white rounded-2xl px-8 py-12 w-full border border-slate-100 md:max-w-lg ${className}`}
  >
    {title && <h1 className="text-2xl font-normal">{title}</h1>}
    {text && <h4 className="text-slate-500 mt-4 text-sm">{text}</h4>}
    <div className="mt-8">{children}</div>
  </div>
)

export default UtilFormBox
