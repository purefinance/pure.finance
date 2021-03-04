import { useWeb3React } from '@web3-react/core'
import { createContext, useEffect, useState } from 'react'
import { merkle as createMerkle } from 'pure-finance-lib'

/**
 * This component must be a child of <App> to have access to the appropriate
 * context
 */

const PureContext = createContext()

export const PureContextProvider = function ({ children }) {
  const { active, library, account } = useWeb3React()
  const [merkle, setMerkle] = useState({})
  // const [sablier, setSablier] = useState({})

  useEffect(
    function () {
      if (active) {
        setMerkle(createMerkle(library, { from: account }))
        // setSablier(createSablier(library, { from: account }))
      }
    },
    [active, library, account]
  )

  return (
    <PureContext.Provider value={{ merkle }}>{children}</PureContext.Provider>
  )
}

export default PureContext
