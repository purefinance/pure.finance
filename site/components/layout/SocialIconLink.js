import SvgContainer from '../svg/SvgContainer'

const SocialIconLink = ({ href, iconName }) => (
  <a href={href} rel="noopener noreferrer" target="_blank">
    <SvgContainer
      className="text-grayscale-500 hover:text-grayscale-950 w-6"
      name={iconName}
    />
  </a>
)

export default SocialIconLink
