import useTranslation from 'next-translate/useTranslation'

import { EtherscanLink } from './EtherscanLink'
import JustifiedBetweenRow from './JustifiedBetweenRow'
import Modal from './Modal'
import SvgContainer from './svg/SvgContainer'
import { useNumberFormat } from '../hooks/useNumberFormat'

const TransactionModalRow = ({ text, value, tipLink = '' }) => (
  <JustifiedBetweenRow
    keyComponent={
      tipLink ? (
        <a
          className={'text-gray-350 text-sm flex justify-between'}
          href={tipLink}
          rel="noreferrer"
          target={'_blank'}
        >
          {text}
          <SvgContainer className="ml-1" name="questionmark" />
        </a>
      ) : (
        <p className={'text-gray-350 text-sm'}>{text}</p>
      )
    }
    valueComponent={<p className="text-sm font-semibold">{value}</p>}
  />
)

// eslint-disable-next-line complexity
const TransactionsModal = function ({ transaction, modalIsOpen, closeModal }) {
  const { t } = useTranslation('common')
  const formatNumber = useNumberFormat()

  const isConfirmed = transaction.transactionStatus === 'confirmed'
  const isError =
    transaction.transactionStatus === 'canceled' ||
    transaction.transactionStatus === 'error'

  return (
    <Modal
      className="relative flex flex-col w-full max-w-screen-sm h-screen bg-white border-0 outline-none focus:outline-none shadow-lg md:h-auto md:rounded-lg"
      modalIsOpen={modalIsOpen}
      onRequestClose={closeModal}
    >
      <div className="p-6">
        {/* Header: operation name and closing "x" */}
        <div className="border-b">
          <button className="float-right" onClick={closeModal}>
            <SvgContainer name="close" />
          </button>
          <p className="mb-2 text-left font-bold">{t(transaction.operation)}</p>
        </div>
        <div className="mt-4">
          {/* Values sent and received */}
          {transaction.sent && (
            <div className="flex items-center justify-between pb-2 text-lg font-bold border-b border-gray-300">
              <div className="w-2/5 text-left">
                {`${formatNumber(transaction.sent)} ${transaction.sentSymbol}`}
              </div>
              <div className="w-1/5 text-2xl">→</div>
              <div className="w-2/5 text-right">
                {transaction.received.map((token, i) => (
                  <div key={i}>{`${formatNumber(token.value)} ${
                    token.symbol
                  }`}</div>
                ))}
              </div>
            </div>
          )}
          {!transaction.sent &&
            (transaction.received || []).map(({ symbol, value }) => (
              <div
                className="flex items-center justify-between pb-2 text-lg font-bold border-b border-gray-300"
                key={symbol}
              >
                <div className="w-2/5 text-left">{symbol}</div>
                <div className="w-3/5 text-right">{formatNumber(value)}</div>
              </div>
            ))}

          {/* General operation information: total txs, fees, status */}
          <div className="py-4">
            <TransactionModalRow
              text={t('total-transactions')}
              value={transaction.suffixes.length}
            />
            <TransactionModalRow
              text={isConfirmed ? t('total-tx-fee') : t('estimated-tx-fee')}
              value={`${formatNumber(
                isConfirmed ? transaction.actualFee : transaction.expectedFee
              )} ETH`}
            />
            <JustifiedBetweenRow
              keyComponent={
                <p className="text-gray-350 text-sm">{t('global-tx-status')}</p>
              }
              valueComponent={
                <p className="text-sm font-semibold">
                  {t(`status-${transaction.transactionStatus}`)}
                </p>
              }
            />
          </div>

          {/* Transactions list and status: name, number, status, hash */}
          {transaction.suffixes.map((suffix, idx) => (
            <div className="py-4 border-t border-gray-300" key={suffix}>
              <TransactionModalRow
                text={`${t('transaction')}: ${t(suffix)}`}
                value={`${idx + 1}/${transaction.suffixes.length}`}
              />
              <TransactionModalRow
                text={t('status')}
                value={
                  transaction[`transactionStatus-${idx}`]
                    ? t(`status-${transaction[`transactionStatus-${idx}`]}`)
                    : t('status-waiting-wallet')
                }
              />
              {transaction[`transactionHash-${idx}`] && (
                <TransactionModalRow
                  text={t('transaction-hash')}
                  value={
                    <EtherscanLink tx={transaction[`transactionHash-${idx}`]} />
                  }
                />
              )}
            </div>
          ))}

          {/* Status icon and error message */}
          <div className="pt-4 border-t border-gray-300">
            <SvgContainer
              className="m-auto"
              name={isConfirmed ? 'checkmark' : isError ? 'cross' : 'loading'}
            />
            {transaction.message && (
              <p className="mt-1 text-center">
                <span className="text-red-600 text-sm font-semibold">
                  {transaction.message}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default TransactionsModal
