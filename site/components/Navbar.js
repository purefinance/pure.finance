import Link from 'next/link'
import PureLogo from './svg/Pure'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => {
  return (
    <div className="flex flex-wrap w-full xl:px-0 md:h-16 items-center">
      <div className="hidden md:block w-1/3"></div>
      <div className="w-full md:w-1/3 flex justify-center">
        <Link href="/">
          <a>
            <PureLogo />
          </a>
        </Link>
      </div>
      <div className="w-full md:w-1/3 flex justify-center md:justify-end mt-4 md:mt-0">
        {walletConnection && <Wallet />}
      </div>
    </div>
  )
}

export default Navbar
