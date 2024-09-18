import { inter } from '../../fonts'
import Navbar from '../Navbar'

import Footer from './Footer'
import Head from './Head'
import Hero from './Hero'

const HomeLayout = ({ children, title }) => (
  <>
    <Head title={title} />
    <div className={`w-full ${inter.className}`}>
      <Navbar />
      <Hero />
      <div className="container">{children}</div>
      <Footer />
    </div>
  </>
)

export default HomeLayout
