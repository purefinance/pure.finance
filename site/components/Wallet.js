import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import shortAccount from '../utils/account'
import { injected, walletlink } from '../utils/connectors'

import WalletConnectionErrorHandler from './WalletConnectionErrorHandler'
import WalletConnectionModal from './WalletConnectionModal'
const persistLastConnectorKey = 'lastConnector'

const persistLastConnector = connectorName =>
  window.localStorage.setItem(persistLastConnectorKey, connectorName)
const getLastConnector = () =>
  window.localStorage.getItem(persistLastConnectorKey)
const removeLastConnector = () =>
  window.localStorage.removeItem(persistLastConnectorKey)

const Wallet = function () {
  const { account, active, activate, connector, deactivate, error, setError } =
    useWeb3React()
  const t = useTranslations()
  const shortenedAccount = shortAccount(account)

  const [activatingConnector, setActivatingConnector] = useState()
  const [showWalletConnector, setShowWalletConnector] = useState(false)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

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
      setErrorModalOpen(true)
      if (error) removeLastConnector()
    },
    [error]
  )

  const [tried, setTried] = useState(false)

  useEffect(
    function () {
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
      } else if (lastConnector === 'walletlink') {
        activate(walletlink, setError)
      }
    },
    [activate, setError]
  )

  useEffect(
    function () {
      if (!tried && active) {
        setTried(true)
      }
    },
    [tried, active]
  )

  useEffect(
    function () {
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
    },
    [activate, active, error]
  )

  const wallets = [
    {
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
      },
      name: 'Metamask'
    },
    {
      connector: walletlink,
      handleConnection() {
        setActivatingConnector(walletlink)
        activate(walletlink, setError)
        persistLastConnector('walletlink')
        setShowWalletConnector(false)
      },
      handleDisconnection() {
        connector.close()
        removeLastConnector()
      },
      name: 'Coinbase Wallet'
    }
  ]

  const deactivateConnector = function () {
    wallets.find(w => w.connector === connector).handleDisconnection()
  }

  return (
    <>
      <WalletConnectionModal
        modalIsOpen={showWalletConnector}
        onRequestClose={() => setShowWalletConnector(false)}
        wallets={wallets}
      />
      <WalletConnectionErrorHandler
        error={error}
        modalIsOpen={errorModalOpen}
        onRequestClose={() => setErrorModalOpen(false)}
      />
      {!active ? (
        <button
          className="hover:text-gray-400 font-semibold focus:outline-none"
          onClick={() => setShowWalletConnector(true)}
        >
          {t('connect-wallet')}
        </button>
      ) : (
        <div className="text-center font-semibold md:text-right">
          <p className="text-gray-400 text-xs">{t('address')}:</p>
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
