import { UnsupportedChainIdError } from '@web3-react/core'
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector'
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector'
import useTranslation from 'next-translate/useTranslation'

import Modal from './Modal'

const getErrorKey = function (error) {
  if (error instanceof NoEthereumProviderError) {
    return 'error-no-ethereum-provider'
  } else if (error instanceof UnsupportedChainIdError) {
    return 'error-unsupported-network'
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return 'error-rejected-wallet-connection'
  }
  console.error(error)
  return 'error-unknown'
}

const ErrorHandler = function ({ error, modalIsOpen, onRequestClose }) {
  const { t } = useTranslation('common')
  return error ? (
    <Modal
      className="p-10 max-w-2xl text-center bg-white rounded-md"
      modalIsOpen={modalIsOpen}
      onRequestClose={onRequestClose}
    >
      <p className="pb-2 font-semibold">{t('error')}</p>
      <p>{t(`${getErrorKey(error)}`)}</p>
    </Modal>
  ) : null
}

export default ErrorHandler
