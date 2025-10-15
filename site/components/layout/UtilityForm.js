/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {import("react").FormEventHandler} [props.onSubmit]
 * @param {string} props.subtitle
 * @param {string} props.title
 */
const UtilityForm = ({ children, className, onSubmit, subtitle, title }) => (
  <div
    className={`border-slate-100 w-full rounded-2xl border bg-white px-8 py-12 md:max-w-lg ${className}`}
  >
    {title && (
      <h1 className="text-grayscale-950 text-2xl font-normal">{title}</h1>
    )}
    {subtitle && (
      <h4 className="text-grayscale-500 mt-2 text-sm">{subtitle}</h4>
    )}
    <div className="mt-4">
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  </div>
)

export default UtilityForm
