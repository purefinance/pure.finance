import { ExternalLink } from '../ExternalLink'
import SvgContainer from '../svg/SvgContainer'

const SocialIconLink = ({ href, iconName }) => (
  <ExternalLink href={href}>
    <SvgContainer
      className="text-grayscale-500 hover:text-grayscale-950 w-6"
      name={iconName}
    />
  </ExternalLink>
)

export default SocialIconLink
