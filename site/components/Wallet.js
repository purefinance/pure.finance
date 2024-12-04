import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import shortAccount from '../utils/account'
import { injected, walletlink } from '../utils/connectors'

import Dropdown from './Dropdown'
import SvgContainer from './svg/SvgContainer'
import WalletConnectionErrorHandler from './WalletConnectionErrorHandler'
import WalletConnectionModal from './WalletConnectionModal'
import Button from './Button'
const persistLastConnectorKey = 'lastConnector'

const persistLastConnector = connectorName =>
  window.localStorage.setItem(persistLastConnectorKey, connectorName)
const getLastConnector = () =>
  window.localStorage.getItem(persistLastConnectorKey)
const removeLastConnector = () =>
  window.localStorage.removeItem(persistLastConnectorKey)

const WalletButton = function ({ cta = false, onClick }) {
  const t = useTranslations()

  if (cta) {
    return <Button onClick={onClick}>{t('connect-wallet-cta')}</Button>
  }

  return (
    <button
      className="border-slate-200 flex items-center gap-2 rounded-lg border px-2 py-2 text-sm text-black"
      onClick={onClick}
    >
      <SvgContainer name="wallet" />
      {t('connect-wallet')}
    </button>
  )
}

const Wallet = function ({ cta = false }) {
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
        <WalletButton cta={cta} onClick={() => setShowWalletConnector(true)} />
      ) : (
        <Dropdown
          Selector={({ isOpen }) => (
            <div className="border-slate-20 flex items-center rounded-xl border py-2 pl-2 pr-1 text-sm text-black">
              {shortenedAccount}
              <SvgContainer
                className={`h-6 w-6 fill-current ${
                  isOpen ? 'rotate-180 transform' : ''
                }`}
                name="caret"
              />
            </div>
          )}
          className="cursor-pointer text-gray-600"
        >
          <ul
            className="absolute z-10 mt-1 w-40 rounded-xl bg-white p-2 text-center shadow-lg"
            onClick={deactivateConnector}
          >
            {t('disconnect')}
          </ul>
        </Dropdown>
      )}
    </>
  )
}

export default Wallet
