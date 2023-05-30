const formatShort = text => `${text.substr(0, 6)}...${text.slice(-4)}`

const ETHERSCAN_URL = 'https://etherscan.io'

/**
 * A link to an address or a transaction in Etherscan.
 *
 * @param {object} options Link data.
 * @param {string} [options.address] The address of the link.
 * @param {string} [options.text] The text of the link.
 * @param {string} [options.tx] The transaction hash of the link.
 * @param {boolean} [options.long] Whether the hash has to be complete or short.
 * @returns
 */
export const EtherscanLink = function ({ address, text, tx, long = false }) {
  const url = `${ETHERSCAN_URL}${address ? `/address/${address}` : `/tx/${tx}`}`
  const hash = address ?? tx
  return (
    <a
      className="m-auto hover:text-black text-gray-400 font-semibold focus:outline-none"
      href={url}
      rel="noreferrer"
      target="_blank"
      title={long ? undefined : text}
    >
      {text ?? (long ? hash : formatShort(hash))}
    </a>
  )
}
