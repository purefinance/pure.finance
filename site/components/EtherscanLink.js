const formatShort = function (text) {
  return `${text.substr(0, 6)}...${text.slice(-4)}`
}

const ETHERSCAN_URL = 'https://etherscan.io'

/**
 * A link to an address or a transaction in Etherscan.
 *
 * @param {object} options Link data.
 * @param {string} [options.address] The address of the link.
 * @param {string} [options.tx] The transaction hash of the link.
 * @param {boolean} [options.long] Whether the hash has to be complet or short.
 * @returns
 */
export const EtherscanLink = function ({ address, tx, long = false }) {
  const url = `${ETHERSCAN_URL}${address ? `/address/${address}` : `/tx/${tx}`}`
  const text = address ?? tx
  return (
    <a
      className="m-auto hover:text-black text-gray-400 font-semibold focus:outline-none"
      href={url}
      rel="noreferrer"
      target="_blank"
      title={long ? undefined : text}
    >
      {long ? text : formatShort(text)}
    </a>
  )
}
