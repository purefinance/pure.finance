const TableBox = ({ title, text, className, children }) => (
  <div className="flex flex-col">
    <div>
      {title && <h1 className="text-2xl font-normal">{title}</h1>}
      {text && <h4 className="text-slate-500 mt-4 text-sm">{text}</h4>}
    </div>
    <div
      className={`border-slate-100 mt-4 w-full rounded-xl border bg-white p-3 ${className}`}
    >
      {children}
    </div>
  </div>
)

export default TableBox
