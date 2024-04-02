import { Link } from '../navigation'

import { HemiLogoFull, HemiSymbol } from './HemiLogo'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => (
  <div className="flex flex-wrap items-center w-full md:h-16 xl:px-0">
    <div className="w-1/3 md:block">
      <Link href="/">
        <div className="w-8 h-8 md:hidden">
          <HemiSymbol />
        </div>
        <div className="hidden w-28 h-10 md:block">
          <HemiLogoFull />
        </div>
      </Link>
    </div>
    <div className="hidden w-1/3 md:block" />
    <div className="flex justify-center mt-4 w-full md:justify-end md:mt-0 md:w-1/3">
      {walletConnection && <Wallet />}
    </div>
  </div>
)

export default Navbar
