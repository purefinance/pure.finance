import Web3 from 'web3'
import createDpaLib from 'dp-auctions-lib'

const web3 = new Web3(process.env.NODE_URL)
const dpa = createDpaLib(web3)

export default dpa
