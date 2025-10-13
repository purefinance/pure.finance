import { useTranslations } from 'next-intl'

import Modal from './Modal'
import SvgContainer from './svg/SvgContainer'

const WalletConnectionModal = function ({
  modalIsOpen,
  onRequestClose,
  wallets
}) {
  const t = useTranslations()
  return (
    <Modal
      className="rounded-md bg-white"
      modalIsOpen={modalIsOpen}
      onRequestClose={onRequestClose}
    >
      <h1 className="px-10 pb-5 pt-10 text-center text-xl font-bold">
        {t('connect-wallet')}
      </h1>
      <div className="flex flex-wrap justify-center pb-10 lg:px-20">
        {wallets.map(w => (
          <div className="p-4" key={w.name}>
            <button
              className="focus:outline-none flex w-60 items-center justify-center rounded border px-4 py-2 font-semibold focus:ring"
              onClick={() => w.handleConnection()}
            >
              <SvgContainer
                className="mr-2"
                height="40"
                name={w.name.replace(/\s/g, '')}
                width="40"
              />
              {w.name}
            </button>
          </div>
        ))}
      </div>
    </Modal>
  )
}

export default WalletConnectionModal
