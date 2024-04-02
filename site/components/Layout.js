import { inter } from '../fonts'

import Head from './Head'
import Navbar from './Navbar'
import UtilitiesTabs from './UtilitiesTabs'

const Layout = ({ children, title, walletConnection }) => (
  <>
    <Head title={title} />
    <div className={`py-15 px-8 w-full ${inter.className}`}>
      <div className="max-w-customscreen mx-auto">
        <Navbar walletConnection={walletConnection} />
        <UtilitiesTabs />
        <div className="md:pt-19 md:min-h-content flex flex-col items-center mx-auto pb-8 pt-6 w-full md:pb-0">
          {children}
        </div>
      </div>
    </div>
  </>
)

export default Layout
