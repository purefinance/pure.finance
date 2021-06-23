import svgList from './'

const SvgContainer = function ({ name, ...props }) {
  if (!name) {
    return null
  }
  const SvgComponent = svgList[name.toLowerCase()]
  return <SvgComponent {...props} />
}

export default SvgContainer
