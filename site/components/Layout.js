import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({children, walletConnection }) => (
  <div className="max-w-customscreen w-full mx-auto py-15">
    <Navbar walletConnection={walletConnection} />
    <div className="pt-19">
      {children}
    </div>
    <Footer />
  </div>
)

export default Layout