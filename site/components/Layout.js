import Navbar from './Navbar'
import Footer from './Footer'
import Head from './Head'

const Layout = ({ children, title, walletConnection }) => (
  <>
    <Head title={title} />
    <div className="max-w-customscreen py-15 mx-auto px-8 w-full xl:px-0">
      <Navbar walletConnection={walletConnection} />
      <div className="md:pt-19 md:min-h-content mx-auto pb-8 pt-6 w-full text-center md:pb-0">
        {title && <h1 className="text-1.5xl text-center font-bold">{title}</h1>}
        {children}
      </div>
      <Footer />
    </div>
  </>
)

export default Layout
