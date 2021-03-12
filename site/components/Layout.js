import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <>
    <Head title={title} />
    <div className="max-w-customscreen w-full mx-auto py-15 px-8 xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="pt-6 pb-8 md:pb-0 md:pt-19 md:min-h-content">
        {children}
      </div>
      <Footer />
    </div>
  </>
)

export default Layout
