import svgList from './tokens/'

const TokenContainer = function ({ name, ...props }) {
  if (!name) {
    return null
  }
  const SvgComponent = svgList[name.toLowerCase()]
  if (!SvgComponent) {
    console.warn(`SVG component missing: ${name}`)
    return null
  }
  return <SvgComponent {...props} />
}

export default TokenContainer
