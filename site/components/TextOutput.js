import SvgContainer from './svg/SvgContainer'

export const TextOutput = function ({ label, value }) {
  function copySignatureToClipboard() {
    if (!value) {
      return
    }

    navigator.clipboard.writeText(value)
  }

  return (
    <div className="mt-4 break-all">
      <div className="flex items-center justify-between">
        <span className="text-slate-600">{label}</span>
        <SvgContainer
          className="w-5 cursor-pointer"
          name="copy"
          onClick={copySignatureToClipboard}
        />
      </div>
      <div className="mb-8 mt-2 w-full rounded-xl border px-4 py-3">
        {value || '-'}
      </div>
    </div>
  )
}
