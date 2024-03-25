import createDpaLib from 'dp-auctions-lib'
import Web3 from 'web3'

import utilsConfig from './utilsConfig'

const web3 = new Web3(process.env.NEXT_PUBLIC_NODE_URL)
const dpa = createDpaLib(web3, utilsConfig.dpAuctions)

export default dpa
