import { UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import ReactModal from 'react-modal'

const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(140, 140, 160, 0.2)',
    zIndex: 30
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: 'auto',
    maxWidth: '720px',
    transform: 'translate(-50%, -50%)',
    padding: 0,
    borderRadius: '0.5rem',
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }
}

const getErrorMessage = function ({ error }) {
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'Please authorize this website to access your Ethereum account.'
  }
  console.error(error)
  return 'An unknown error occurred.'
}

const ErrorHandler = function (error) {
  return (
    <ReactModal ariaHideApp={false} isOpen={true} style={customStyles}>
      <div className="flex flex-wrap justify-center p-4 space-y-5 lg:p-10">
        <h1 className="text-lg font-bold">Error: {getErrorMessage(error)}</h1>
        <button
          className="px-4 py-2 font-semibold border rounded focus:outline-none focus:shadow-outline"
          onClick={() => window.location.reload()}
        >
          RELOAD
        </button>
      </div>
    </ReactModal>
  )
}

export default ErrorHandler
