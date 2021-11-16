import { createContext, useCallback, useEffect, useState } from 'react'

// @ts-ignore ts(2554)
const TransactionsContext = createContext()

export function TransactionsContextProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [currentTransactions, setCurrentTransactions] = useState([])

  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [openedOpId, setOpenedOpId] = useState(null)

  const openModal = function ({ opId }) {
    setOpenedOpId(opId)
    setModalIsOpen(true)
  }
  const closeModal = () => setModalIsOpen(false)

  useEffect(
    function () {
      if (!transactions.length) {
        return
      }
      const groupedTransactions = transactions.reduce(
        (result, transaction) => ({
          ...result,
          [transaction.opId]: result[transaction.opId]
            ? { ...result[transaction.opId], ...transaction }
            : transaction
        }),
        {}
      )
      setCurrentTransactions(Object.values(groupedTransactions))
    },
    [transactions]
  )

  useEffect(
    function () {
      if (!currentTransactions.length) {
        return
      }
      openModal(currentTransactions[currentTransactions.length - 1])
    },
    [currentTransactions]
  )

  const addTransactionStatus = useCallback(
    function (newTransaction) {
      setTransactions(previousTransactions => [
        ...previousTransactions,
        newTransaction
      ])
    },
    [transactions]
  )

  return (
    <TransactionsContext.Provider
      value={{
        addTransactionStatus,
        closeModal,
        currentTransactions,
        modalIsOpen,
        openedOpId
      }}
    >
      {children}
    </TransactionsContext.Provider>
  )
}

export default TransactionsContext
