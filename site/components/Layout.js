import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <>
    <Head title={title} />
    <div className="w-full px-8 mx-auto max-w-customscreen py-15 xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="pt-6 pb-8 md:pb-0 md:pt-19 md:min-h-content">
        {children}
      </div>
      <Footer />
    </div>
  </>
)

export default Layout
