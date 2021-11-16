import { useContext } from 'react'

import TransactionsContext from './context/Transactions'
import TransactionsModal from './TransactionsModal'

function Transactions() {
  const { currentTransactions, modalIsOpen, closeModal, openedOpId } =
    useContext(TransactionsContext)

  if (!currentTransactions || !currentTransactions.length) {
    return null
  }

  const transaction = currentTransactions.find(t => t.opId === openedOpId)
  if (!transaction) {
    return null
  }

  return (
    <TransactionsModal
      closeModal={closeModal}
      modalIsOpen={modalIsOpen}
      transaction={transaction}
    />
  )
}

export default Transactions
