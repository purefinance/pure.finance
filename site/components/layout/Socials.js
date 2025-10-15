import hemiSocials from 'hemi-socials'

import SocialIconLink from './SocialIconLink'

const Socials = () => (
  <div className="flex gap-3">
    <SocialIconLink href={hemiSocials.twitterUrl} iconName="twitter" />
    <SocialIconLink href={hemiSocials.discordUrl} iconName="discord" />
    <SocialIconLink href={hemiSocials.githubUrl} iconName="github" />
    <SocialIconLink href={hemiSocials.linkedinUrl} iconName="linkedin" />
  </div>
)

export default Socials
