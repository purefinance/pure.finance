import { inter } from '../../fonts'
import Navbar from '../Navbar'

import Head from './Head'
import Hero from './Hero'
import HomeFooter from './HomeFooter'

const HomeLayout = ({ children, title }) => (
  <>
    <Head title={title} />
    <div className={`w-full ${inter.className}`}>
      <Navbar />
      <Hero />
      <div className="container">{children}</div>
      <div className="container">
        <HomeFooter />
      </div>
    </div>
  </>
)

export default HomeLayout
