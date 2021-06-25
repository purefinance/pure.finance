const nextTranslate = require('next-translate')
const { createSecureHeaders } = require('next-secure-headers')

module.exports = nextTranslate({
  async headers() {
    return [{ source: '/:path*', headers: createSecureHeaders() }]
  }
})
