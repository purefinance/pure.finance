import { util } from 'erc-20-lib'

const ensRegistryOverrides = {
  43111: '0x099Fee7f2EF53eB7CCC0e465a32f3aEfa8D703C5' // getheminames.me
}

/**
 * Try resolving a string to an address.
 *
 * If the value is already an address, it will be returned as is. If the value
 * is a token symbol, it will be resolved to an address using the token list. If
 * the value is an ENS name, it will be resolved to an address using the ENS
 * registry. If the value cannot be resolved, null will be returned.
 *
 * @param {object} web3
 * @param {string} string
 * @returns {Promise<string|null>}
 */
export async function resolveAddress(web3, string) {
  if (web3.utils.isAddress(string)) {
    return string
  }

  const chainId = await web3.eth.getChainId()
  const tokenAddress = util.tokenAddress(string, chainId)
  if (tokenAddress) {
    return tokenAddress
  }

  try {
    web3.eth.ens.registryAddress =
      ensRegistryOverrides[chainId] || web3.eth.ens.registryAddress
    return await web3.eth.ens.getAddress(string)
  } catch (err) {
    console.error(err) // eslint-disable-line no-console
    return null
  }
}
