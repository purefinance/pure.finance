import Link from 'next/link'
import PureLogo from './svg/Pure'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => {
  return (
    <div className="flex flex-wrap items-center w-full xl:px-0 md:h-16">
      <div className="hidden w-1/3 md:block"></div>
      <div className="flex justify-center w-full md:w-1/3">
        <Link href="/">
          <a>
            <PureLogo />
          </a>
        </Link>
      </div>
      <div className="flex justify-center w-full mt-4 md:w-1/3 md:justify-end md:mt-0">
        {walletConnection && <Wallet />}
      </div>
    </div>
  )
}

export default Navbar
