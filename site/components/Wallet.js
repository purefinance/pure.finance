import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

function shortAccount(account) {
  return account ? `${account.substr(0, 6)}...${account.substr(38, 4)}` : null
}

function Wallet() {
  const { account, active, activate, deactivate, error } = useWeb3React()

  const injected = new InjectedConnector({ supportedChainIds: [1, 1337] })
  const activateConnector = () => activate(injected)
  const deactivateConnector = () => deactivate()
  const shortenedAccount = shortAccount(account)

  return !active && !error ? (
    <button
      onClick={activateConnector}
      className="font-semibold focus:outline-none hover:text-gray-400"
    >
      Connect Wallet
    </button>
  ) : active ? (
    <div className="text-center md:text-right font-semibold">
      <p className="text-xs text-gray-400">Address:</p>
      <div>
        <div className="font-bold focus:outline-none">{shortenedAccount}</div>
      </div>
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
