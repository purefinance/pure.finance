import Link from 'next/link'
import PureLogo from './svg/Pure'
import Wallet from './Wallet'

const Navbar = ({ walletConnection }) => {
  return (
    <div className={`flex w-full px-6 md:px-32 ${walletConnection ? 'justify-between' : 'justify-center'}`}>
      <Link href="/">
        <a>
          <PureLogo />
        </a>
      </Link>
      { walletConnection && <Wallet /> }
    </div>
  )
}

export default Navbar