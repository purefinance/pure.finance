import Link from 'next/link'
import PureLogo from './svg/Pure'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => {
  return (
    <div className="flex w-full px-6 xl:px-0 h-16 items-center">
      <div className="hidden md:block w-1/3"></div>
      <div className="w-1/3 flex justify-center">
        <Link href="/">
          <a>
            <PureLogo />
          </a>
        </Link>
      </div>
      <div className="w-1/3 flex justify-end">
        {walletConnection && <Wallet />}
      </div>
    </div>
  )
}

export default Navbar
