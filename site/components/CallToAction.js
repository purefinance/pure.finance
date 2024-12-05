import { useWeb3React } from '@web3-react/core'
import Wallet from './Wallet'

const CallToAction = function ({ children }) {
  const { active } = useWeb3React()

  if (!active) {
    return <Wallet cta={true} />
  }

  return children
}

export default CallToAction
