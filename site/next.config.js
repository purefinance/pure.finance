const nextTranslate = require('next-translate')
const { createSecureHeaders } = require('next-secure-headers')

module.exports = nextTranslate({
  async headers() {
    return [
      {
        source: '/:path*',
        headers: createSecureHeaders()
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/dp-auctions',
        destination: `/dp-auctions/collections/${process.env.DEFAULT_COLLECTION_ID}`
      }
    ]
  }
})
