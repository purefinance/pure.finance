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
      },
      {
        source: '/payment-streams/new',
        destination: '/payment-streams?view=create'
      },
      {
        source: '/payment-streams/edit/:id',
        destination: '/payment-streams?view=edit&streamId=:id'
      }
    ]
  }
})
