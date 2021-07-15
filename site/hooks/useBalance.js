import { useContext } from 'react'
import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core'

import PureContext from '../components/context/Pure'

export const useBalance = function ({ symbol }) {
  const { active, account: userAccount, library } = useWeb3React()
  const { erc20 } = useContext(PureContext)

  const { data, mutate, error } = useSWR(
    [`${symbol}-Balance-${userAccount}`, userAccount, erc20],
    async function (_, account, erc20Instancer) {
      if (!active) {
        return Promise.resolve(null)
      }
      const erc20Service = erc20Instancer(account)
      switch (symbol) {
        case 'ETH':
          return library.eth.getBalance(account, 'latest')
        case 'WETH':
          return erc20Service.wrappedEtherBalanceOf()
        default:
          return Promise.reject(
            new Error(`method to read balance of ${symbol} not implemented`)
          )
      }
    }
  )
  return {
    data,
    error,
    isLoading: !data && !error,
    mutate
  }
}
