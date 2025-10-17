import { useWeb3React } from '@web3-react/core'

import Wallet from './Wallet'

const CallToAction = function ({ children, className = '' }) {
  const { active } = useWeb3React()
  return (
    <div className={`mt-8 ${className}`}>
      {!active ? <Wallet cta={true} /> : children}
    </div>
  )
}

export default CallToAction
