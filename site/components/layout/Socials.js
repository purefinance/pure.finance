import SocialIconLink from './SocialIconLink'

const Socials = () => (
  <div className="flex gap-3">
    <SocialIconLink href="https://x.com/hemi_xyz" iconName="twitter" />
    <SocialIconLink href="https://discord.gg/hemixyz" iconName="discord" />
    <SocialIconLink href="https://github.com/hemilabs" iconName="github" />
    <SocialIconLink
      href="https://www.linkedin.com/company/hemi-labs"
      iconName="linkedin"
    />
  </div>
)

export default Socials
