import Layout from '../components/Layout'
import Utilities from '../components/Utilities'

function HomePage() {
  return (
    <Layout>
      <div className="w-full mb-14">
        <div className="text-center w-full max-w-2xl mx-auto mb-15">
          <h1 className="text-1.5xl font-bold text-center">
            Lorem Ipsum Dolor Sit Amet
          </h1>
          <p className="text-center mt-5.5 text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a
            urna eget enim iaculis fringilla id non leo. Pellentesque efficitur
            diam nibh, non tempor nunc dapibus vitae.
          </p>
        </div>
        <Utilities />
      </div>
    </Layout>
  )
}

export default HomePage
