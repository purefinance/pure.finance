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
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <Modal {...props} />
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  ) : null
}

export default ModalContainer
