/**
 * Formats an account into a short version: 0x + 4 first chars + 4 last chars
 *
 * @param {string} account The account to be shortened.
 * @returns {string} Returns the new format
 */
function shortAccount(account) {
  return account ? `${account.substr(0, 6)}...${account.substr(38, 4)}` : null
}

export default shortAccount
