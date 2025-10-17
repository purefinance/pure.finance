const UtilityBox = ({ children, className, subtitle, title }) => (
  <div
    className={`border-slate-100 w-full rounded-2xl border bg-white px-8 py-12 md:max-w-lg ${className}`}
  >
    <h1 className="text-grayscale-950 text-2xl font-normal">{title}</h1>
    {subtitle && (
      <h4 className="text-grayscale-500 mt-2 text-sm">{subtitle}</h4>
    )}
    <div className="mt-4">{children}</div>
  </div>
)

export default UtilityBox
