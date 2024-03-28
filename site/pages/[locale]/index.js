import Layout from '../../components/Layout'
import Utilities from '../../components/Utilities'

const HomePage = () => (
  <Layout>
    <div className="mb-14 w-full">
      <Utilities />
    </div>
  </Layout>
)

export { getStaticProps, getStaticPaths } from '../../utils/staticProps'

export default HomePage
