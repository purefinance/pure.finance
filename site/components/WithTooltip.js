import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'

const WithTooltip = function ({ tip, children, id, ...props }) {
  const [showToolTip, setShowTooltip] = useState(false)
  useEffect(() => setShowTooltip(true), [])
  if (!showToolTip || !tip) return <>{children}</>
  return (
    <>
      <div data-for={id} data-tip={tip}>
        {children}
      </div>
      <ReactTooltip effect="solid" place="top" type="dark" {...props} id={id} />
    </>
  )
}

export default WithTooltip
