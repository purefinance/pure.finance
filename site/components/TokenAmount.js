import { fromUnit } from '../utils'

// Shows a simple token amount like '0.00125 WETH' inside a `div`.
const TokenAmount = function ({ amount, decimals = 18, symbol }) {
  return (
    <span className="tabular-nums">{`${fromUnit(
      amount,
      decimals
    )} ${symbol}`}</span>
  )
}

export default TokenAmount
