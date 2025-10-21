import { useWeb3React } from '@web3-react/core'
import { useTranslations } from 'next-intl'

import Button from './Button'
import Wallet from './Wallet'

/**
 * @param {object} props
 * @param {React.ReactNode} [props.children]
 * @param {string} [props.className]
 * @param {boolean} [props.supportedNetwork]
 */
const CallToAction = function ({
  children,
  className = '',
  supportedNetwork = true
}) {
  const { active, library } = useWeb3React()
  const t = useTranslations()

  function switchToEthereum() {
    library.currentProvider
      ?.request?.({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }]
      })
      .catch(Function.prototype)
  }

  return (
    <div className={`mt-8 ${className}`}>
      {!active ? (
        <Wallet cta={true} />
      ) : !supportedNetwork ? (
        <Button onClick={switchToEthereum}>{t('switch-to-ethereum')}</Button>
      ) : (
        children
      )}
    </div>
  )
}

export default CallToAction
