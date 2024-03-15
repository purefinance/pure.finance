import createDpaLib from 'dp-auctions-lib'
import Web3 from 'web3'

const web3 = new Web3(process.env.NEXT_PUBLIC_NODE_URL)
const dpa = createDpaLib(web3)

export default dpa
