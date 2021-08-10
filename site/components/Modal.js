import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { useOnKeyUp } from '../hooks/useOnKeyUp'

const Modal = function ({ onRequestClose, children, ...props }) {
  const modalRef = useOnClickOutside(onRequestClose)

  useOnKeyUp(function (e) {
    if (e.key === 'Escape') onRequestClose()
  }, modalRef)
  return (
    <div ref={modalRef} {...props}>
      {children}
    </div>
  )
}

const ModalContainer = function ({ modalIsOpen, ...props }) {
  return modalIsOpen ? (
    <>
      <div className="fixed z-50 inset-0 flex items-center justify-center outline-none focus:outline-none overflow-x-hidden overflow-y-auto">
        <Modal {...props} />
      </div>
      <div className="fixed z-40 inset-0 bg-black opacity-25"></div>
    </>
  ) : null
}

export default ModalContainer
