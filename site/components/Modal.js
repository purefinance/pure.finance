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

const ModalContainer = ({ modalIsOpen, ...props }) =>
  modalIsOpen ? (
    <>
      <div className="outline-none focus:outline-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
        <Modal {...props} />
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  ) : null

export default ModalContainer
