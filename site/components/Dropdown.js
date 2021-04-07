import React, { useState } from 'react'

const Dropdown = function ({ selector, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div onClick={() => setIsOpen(!isOpen)} {...props}>
      {selector}
      {isOpen && children}
    </div>
  )
}

export default Dropdown
