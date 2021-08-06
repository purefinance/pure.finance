import React, { useState } from 'react'

import { useOnClickOutside } from '../hooks/useOnClickOutside'

const Dropdown = function ({ Selector, children, ...props }) {
  const [isOpen, setIsOpen] = useState(false)
  const DropdownRef = useOnClickOutside(() => setIsOpen(false))
  return (
    <div onClick={() => setIsOpen(!isOpen)} ref={DropdownRef} {...props}>
      <Selector isOpen={isOpen} />
      {isOpen && children}
    </div>
  )
}

export default Dropdown
