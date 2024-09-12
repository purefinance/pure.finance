const formatShort = text => `${text.substr(0, 6)}...${text.slice(-4)}`

const explorerUrls = {
  1: 'https://etherscan.io',
  43111: 'https://explorer.hemi.xyz',
  743111: 'https://testnet.explorer.hemi.xyz'
}

/**
 * A link to an address or transaction in a chain explorer.
 * Defaults to Etherscan.
 *
 * @param {object} options Link data.
 * @param {string} [options.address] The address of the link.
 * @param {number} [options.chainId] The chainId of the address or tx.
 * @param {boolean} [options.long] Whether the hash has to be complete or short.
 * @param {string} [options.text] The text of the link.
 * @param {string} [options.tx] The transaction hash of the link.
 * @returns
 */
export const ExplorerLink = function ({
  address,
  chainId = 1,
  long = false,
  text,
  tx
}) {
  const baseUrl = explorerUrls[chainId]
  const url = `${baseUrl}${address ? `/address/${address}` : `/tx/${tx}`}`
  const hash = address ?? tx
  return (
    <a
      className="m-auto text-black hover:text-gray-400 font-semibold focus:outline-none"
      href={url}
      rel="noreferrer"
      target="_blank"
      title={long ? undefined : text}
    >
      {text ?? (long ? hash : formatShort(hash))}
    </a>
  )
}
