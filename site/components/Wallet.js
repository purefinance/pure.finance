import { useWeb3React } from '@web3-react/core'
import { useState, useEffect } from 'react'
import { injected, walletconnect } from '../utils/connectors'
import WalletConnectionModal from './WalletConnectionModal'
import WalletConnectionErrorHandler from './WalletConnectionErrorHandler'
const persistLastConnectorKey = 'lastConnector'

import useTranslation from 'next-translate/useTranslation'

const persistLastConnector = (connectorName) =>
  window.localStorage.setItem(persistLastConnectorKey, connectorName)
const getLastConnector = () =>
  window.localStorage.getItem(persistLastConnectorKey)
const removeLastConnector = () =>
  window.localStorage.removeItem(persistLastConnectorKey)

function shortAccount(account) {
  return account ? `${account.substr(0, 6)}...${account.substr(38, 4)}` : null
}

function Wallet() {
  const {
    account,
    active,
    activate,
    connector,
    deactivate,
    error,
    setError
  } = useWeb3React()

  const { t } = useTranslation('common')
  const shortenedAccount = shortAccount(account)

  const [activatingConnector, setActivatingConnector] = useState()
  const [showWalletConnector, setShowWalletConnector] = useState(false)
  const [tried, setTried] = useState(false)

  useEffect(
    function () {
      if (activatingConnector && activatingConnector === connector) {
        setActivatingConnector(undefined)
      }
    },
    [activatingConnector, connector]
  )

  useEffect(
    function () {
      if (error) removeLastConnector()
    },
    [error]
  )
  useEffect(function () {
    const lastConnector = getLastConnector()
    if (lastConnector === 'injected') {
      injected
        .isAuthorized()
        .then(function (isAuthorized) {
          if (isAuthorized) {
            activate(injected, setError)
          }
        })
        .catch(function () {
          setTried(true)
        })
    } else if (lastConnector === 'walletconnect') {
      activate(walletconnect, setError)
    }
  }, [])

  useEffect(
    function () {
      if (!tried && active) {
        setTried(true)
      }
    },
    [tried, active]
  )

  useEffect(function () {
    const { ethereum } = window
    if (ethereum && ethereum.on && !active && !error) {
      const handleChainChanged = function () {
        activate(injected)
      }

      ethereum.on('chainChanged', handleChainChanged)

      return function () {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
    return undefined
  }, [])

  const wallets = [
    {
      name: 'Metamask',
      connector: injected,
      handleConnection() {
        setActivatingConnector(injected)
        activate(injected, setError)
        persistLastConnector('injected')
        setShowWalletConnector(false)
      },
      handleDisconnection() {
        deactivate()
        removeLastConnector()
      }
    },
    {
      name: 'WalletConnect',
      connector: walletconnect,
      handleConnection() {
        setActivatingConnector(walletconnect)
        activate(walletconnect, setError)
        persistLastConnector('walletconnect')
        setShowWalletConnector(false)
      },
      handleDisconnection() {
        connector.close()
        removeLastConnector()
      }
    }
  ]

  const deactivateConnector = function () {
    wallets.find((w) => w.connector === connector).handleDisconnection()
  }

  return (
    <>
      {showWalletConnector && (
        <WalletConnectionModal
          onRequestClose={() => setShowWalletConnector(false)}
          wallets={wallets}
        />
      )}
      {error && <WalletConnectionErrorHandler error={error} />}
      {!active ? (
        <button
          className="font-semibold focus:outline-none hover:text-gray-400"
          onClick={() => setShowWalletConnector(true)}
        >
          {t('connect-wallet')}
        </button>
      ) : (
        <div className="font-semibold text-center md:text-right">
          <p className="text-xs text-gray-400">{t('address')}:</p>
          <div>
            <div className="font-bold focus:outline-none">
              {shortenedAccount}
            </div>
          </div>
          <div>
            <button
              className={`text-sm ${!account && 'hidden'}
              font-semibold focus:outline-none text-gray-400 hover:text-black`}
              onClick={deactivateConnector}
            >
              {t('disconnect')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Wallet
