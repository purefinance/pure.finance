import Link from 'next/link'
import PureLogo from './svg/Pure'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => (
  <div className="flex flex-wrap items-center w-full md:h-16 xl:px-0">
    <div className="hidden w-1/3 md:block"></div>
    <div className="flex justify-center w-full md:w-1/3">
      <Link href="/">
        <a>
          <PureLogo />
        </a>
      </Link>
    </div>
    <div className="flex justify-center mt-4 w-full md:justify-end md:mt-0 md:w-1/3">
      {walletConnection && <Wallet />}
    </div>
  </div>
)

export default Navbar
