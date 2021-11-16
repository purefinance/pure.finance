import Modal from './Modal'
import useTranslation from 'next-translate/useTranslation'
import SvgContainer from './svg/SvgContainer'

const WalletConnectionModal = function ({
  modalIsOpen,
  onRequestClose,
  wallets
}) {
  const { t } = useTranslation('common')
  return (
    <Modal
      className="bg-white rounded-md"
      modalIsOpen={modalIsOpen}
      onRequestClose={onRequestClose}
    >
      <h1 className="pb-5 pt-10 px-10 text-center text-xl font-bold">
        {t('connect-wallet')}
      </h1>
      <div className="flex flex-wrap justify-center pb-10 lg:px-20">
        {wallets.map(w => (
          <div className="p-4" key={w.name}>
            <button
              className="flex items-center justify-center px-4 py-2 w-60 font-semibold border rounded focus:outline-none focus:ring"
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
