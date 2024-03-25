const utilsConfig = {
  dpAuctions: {
    address: process.env.NEXT_PUBLIC_DP_AUCTIONS_ADDRESS
  },
  merkleClaim: {
    address: process.env.NEXT_PUBLIC_MERKLE_CLAIM_ADDRESS
  },
  paymentStreams: {
    address: process.env.NEXT_PUBLIC_PAYMENT_STREAMS_ADDRESS,
    birthblock: process.env.NEXT_PUBLIC_PAYMENT_STREAMS_BIRTHBLOCK
  }
}

export default utilsConfig
