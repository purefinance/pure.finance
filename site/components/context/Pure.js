import { useWeb3React } from '@web3-react/core'
import { createContext, useEffect, useState } from 'react'
import { merkle as createMerkle } from 'pure-finance-lib'
import { sablier as createSablier } from 'pure-finance-lib'
import createErc20 from 'erc-20-lib'
import createTokenApprovals from 'pure-finance-lib/src/token-approvals'

/**
 * This component must be a child of <App> to have access to the appropriate
 * context
 */

const PureContext = createContext()

export const PureContextProvider = function ({ children }) {
  const { active, library, account } = useWeb3React()
  const [merkle, setMerkle] = useState({})
  const [sablier, setSablier] = useState({})
  const [tokenApprovals, setTokenApprovals] = useState(null)
  const [erc20, setErc20] = useState()

  useEffect(
    function () {
      if (active) {
        setMerkle(createMerkle(library, { from: account }))
        setSablier(createSablier(library, { from: account }))
        setTokenApprovals(createTokenApprovals(library, { from: account }))
        setErc20(
          () => address => createErc20(library, address, { from: account })
        )
      }
    },
    [active, library, account]
  )

  return (
    <PureContext.Provider value={{ erc20, merkle, sablier, tokenApprovals }}>
      {children}
    </PureContext.Provider>
  )
}

export default PureContext
