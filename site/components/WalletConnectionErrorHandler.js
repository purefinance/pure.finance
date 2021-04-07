import { UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import ReactModal from 'react-modal'
import useTranslation from 'next-translate/useTranslation'

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
  const { t } = useTranslation('common')
  if (error instanceof NoEthereumProviderError) {
    return t('error-no-ethereum-provider')
  } else if (error instanceof UnsupportedChainIdError) {
    return t('error-unsupported-network')
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return t('error-rejected-wallet-connection')
  }
  console.error(error)
  return t('error-unknown')
}

const ErrorHandler = function (error) {
  const { t } = useTranslation('common')
  return (
    <ReactModal ariaHideApp={false} isOpen={true} style={customStyles}>
      <div className="flex flex-wrap justify-center p-4 space-y-5 lg:p-10">
        <h1 className="text-lg font-bold">
          {t('error')}: {getErrorMessage(error)}
        </h1>
        <button
          className="px-4 py-2 font-semibold border rounded focus:outline-none focus:shadow-outline"
          onClick={() => window.location.reload()}
        >
          {t('reload').toUpperCase()}
        </button>
      </div>
    </ReactModal>
  )
}

export default ErrorHandler
