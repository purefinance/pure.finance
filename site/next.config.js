const isProd = process.env.NODE_ENV === 'production'

const basePath = isProd ? `/${process.env.GITHUB_REPOSITORY_NAME}` : ''

module.exports = {
  assetPrefix: `${basePath}/`,
  basePath,
}
