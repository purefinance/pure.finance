import { Link } from '../navigation'

import { HemiLogoFull } from './HemiLogo'
import Breadcrumb from './layout/Breadcrumb'
import SvgContainer from './svg/SvgContainer'
import Wallet from './Wallet'

const Navbar = ({ title, walletConnection, breadcrumb }) => (
  <div className="flex flex-col">
    <div className="flex items-center justify-between p-8">
      <div className="flex gap-2 items-center">
        <Link href="/">
          <div className="w-20">
            <HemiLogoFull />
          </div>
        </Link>
        <div className="w-20">
          <SvgContainer name="tools" />
        </div>
        <div className="hidden md:block">
          {breadcrumb && <Breadcrumb title={title} />}
        </div>
      </div>
      <div>{walletConnection && <Wallet />}</div>
    </div>
    <div className="md:hidden">
      {breadcrumb && <Breadcrumb title={title} />}
    </div>
  </div>
)

export default Navbar
