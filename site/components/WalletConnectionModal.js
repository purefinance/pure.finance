import ReactModal from 'react-modal'

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(140, 140, 160, 0.2)',
    zIndex: 10
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    borderRadius: '0.5rem',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
}

const WalletConnectionModal = ({ wallets, onRequestClose }) => (
  <ReactModal
    ariaHideApp={false}
    isOpen={true}
    onRequestClose={onRequestClose}
    style={customStyles}
  >
    <div className="w-full">
      <h1 className="px-10 pt-10 pb-5 text-xl font-bold text-center">
        Connect Your Wallet
      </h1>
    </div>
    <div className="flex flex-wrap justify-center pb-10 lg:px-20">
      {wallets.map((w) => (
        <div className="p-4" key={w.name}>
          <button
            className="w-40 px-4 py-2 font-semibold border rounded focus:outline-none focus:shadow-outline"
            onClick={() => w.handleConnection()}
          >
            {w.name}
          </button>
        </div>
      ))}
    </div>
  </ReactModal>
)

export default WalletConnectionModal
