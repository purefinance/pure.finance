import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, walletConnection }) => (
  <>
    <Head />
    <div className="max-w-customscreen w-full mx-auto py-15">
      <Navbar walletConnection={walletConnection} />
      <div className="pt-19 min-h-content">{children}</div>
      <Footer />
    </div>
  </>
)

export default Layout
