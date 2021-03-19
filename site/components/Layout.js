import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <>
    <Head title={title} />
    <div className="w-full px-8 mx-auto max-w-customscreen py-15 xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="w-full pt-6 pb-8 mx-auto text-center md:pb-0 md:pt-19 md:min-h-content">
        {title && <h1 className="font-bold text-center text-1.5xl">{title}</h1>}
        {children}
      </div>
      <Footer />
    </div>
  </>
)

export default Layout
