import { createContext, useCallback, useEffect, useState } from 'react'

import { fromUnit } from '../../utils'

const TransactionsContext = createContext(/** @type {object} */ ({}))

export function TransactionsContextProvider({ children }) {
  const [transactions, setTransactions] = useState(/** @type {object[]} */ ([]))
  const [currentTransactions, setCurrentTransactions] = useState([])

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [openedOpId, setOpenedOpId] = useState(null)

  const openModal = function ({ opId }) {
    setOpenedOpId(opId)
    setModalIsOpen(true)
  }
  const closeModal = function () {
    setModalIsOpen(false)
  }

  useEffect(
    function updateTransactions() {
      if (!transactions.length) {
        return
      }

      const updatedTransactionsById = transactions.reduce(
        (byOpId, transaction) => ({
          ...byOpId,
          [transaction.opId]: byOpId[transaction.opId]
            ? { ...byOpId[transaction.opId], ...transaction }
            : transaction
        }),
        {}
      )
      setCurrentTransactions(Object.values(updatedTransactionsById))
    },
    [transactions]
  )

  useEffect(
    function openModalWhenCurrentTransactionsPresent() {
      if (!currentTransactions.length) {
        return
      }

      openModal(currentTransactions[currentTransactions.length - 1])
    },
    [currentTransactions]
  )

  const addTransactionStatus = useCallback(function (newTransaction) {
    setTransactions(previousTransactions => [
      ...previousTransactions,
      newTransaction
    ])
  }, [])

  const handleTransactionStatus = useCallback(
    function ({
      emitter,
      onError = Function.prototype,
      onResult,
      operation,
      received = /** @type {object[]} */ ([])
    }) {
      const opId = Math.floor(new Date().getTime() / 1000)
      emitter
        .on('transactions', function () {
          addTransactionStatus({
            expectedFee: fromUnit(transactions.expectedFee),
            operation,
            opId,
            received,
            suffixes: transactions.suffixes,
            transactionStatus: 'created'
          })
          transactions.suffixes.forEach(function (suffix, i) {
            emitter.on(`transactionHash-${suffix}`, function (transactionHash) {
              addTransactionStatus({
                opId,
                transactionStatus: 'in-progress',
                [`transactionHash-${i}`]: transactionHash,
                [`transactionStatus-${i}`]: 'waiting-to-be-mined'
              })
            })
            emitter.on(`receipt-${suffix}`, function ({ receipt }) {
              addTransactionStatus({
                currentTransaction: i + 1,
                opId,
                [`transactionHash-${i}`]: receipt.transactionHash,
                [`transactionStatus-${i}`]: receipt.status
                  ? 'confirmed'
                  : 'canceled'
              })
            })
          })
        })
        .on('result', function ({ fees, result, status }) {
          const actuallyReceived = onResult({ result, status })
          addTransactionStatus({
            actualFee: fromUnit(fees),
            opId,
            received: actuallyReceived,
            transactionStatus: status ? 'confirmed' : 'canceled'
          })
        })
        .on('error', function (err) {
          onError(err)
          addTransactionStatus({
            message: err.message,
            opId,
            transactionStatus: 'error'
          })
        })
    },
    [addTransactionStatus, transactions]
  )

  return (
    <TransactionsContext.Provider
      value={{
        addTransactionStatus,
        closeModal,
        currentTransactions,
        handleTransactionStatus,
        modalIsOpen,
        openedOpId
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export default TransactionsContext
