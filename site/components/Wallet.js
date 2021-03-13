import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

function shortAccount(account) {
  return account ? `${account.substr(0, 6)}...${account.substr(38, 4)}` : null
}

function WalletStatistic({ label, value, className }) {
  return (
    <div className={className || 'inline-block pr-4'}>
      <p className="text-xs text-gray-400">{label}</p>
      <div>
        <div className="font-bold focus:outline-none">{value}</div>
      </div>
    </div>
  )
}

function Wallet() {
  const web3 = useWeb3React()
  const [balance, setBalance] = useState(0)
  const [gasPrice, setGasPrice] = useState(0)
  const { account, library, active, activate, deactivate, error } = web3

  const injected = new InjectedConnector({ supportedChainIds: [1, 1337] })
  const activateConnector = () => activate(injected)
  const deactivateConnector = () => deactivate()
  const shortenedAccount = shortAccount(account)

  useEffect(() => {
    if (library) {
      Promise.all([
        library.eth.getBalance(account, 'latest'),
        library.eth.getGasPrice()
      ]).then(([bal, gp]) => {
        setBalance(library.utils.fromWei(bal))
        setGasPrice(library.utils.fromWei(gp, 'gwei'))
      })
    }
  }, [account, library])

  return !active && !error ? (
    <button
      onClick={activateConnector}
      className="font-semibold focus:outline-none hover:text-gray-400"
    >
      Connect Wallet
    </button>
  ) : active ? (
    <div className="text-center md:text-right font-semibold">
      <WalletStatistic label="Balance:" value={`${balance} ETH`} />
      <WalletStatistic label="Gas Price:" value={`${gasPrice} gwei`} />
      <WalletStatistic
        className="inline-block"
        label="Address:"
        value={shortenedAccount}
      />
      <div>
        <button
          className={`text-sm ${!account && 'hidden'}
          font-semibold focus:outline-none text-gray-400 hover:text-black`}
          onClick={deactivateConnector}
        >
          Disconnect
        </button>
      </div>
    </div>
  ) : (
    <div>
      Error:{' '}
      {error.message.startsWith('Unsupported chain id')
        ? 'You are connected to an unsupported network. Connect to the Ethereum mainnet.'
        : error.message.startsWith('No Ethereum provider')
        ? 'No Ethereum browser extension detected. Install MetaMask on desktop or visit from a dApp browser on mobile.'
        : error.message}
    </div>
  )
}

export default Wallet
