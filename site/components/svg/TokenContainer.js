import Image from 'next/image'

import Ether from './tokens/Ether'

const { findTokenBySymbol } = require('token-list')

const TokenContainer = function ({ chainId = 1, name, ...props }) {
  if (!name) {
    return null
  }

  if (name === 'ETH') {
    return <Ether {...props} />
  }

  const token = findTokenBySymbol(name, chainId)
  if (token && token.logoURI) {
    return (
      <Image
        alt={token.symbol}
        className="rounded-full"
        height="20"
        src={token.logoURI}
        width="20"
        {...props}
      />
    )
  }

  console.warn(`Token icon is missing for ${name}`)
  return null
}

export default TokenContainer
