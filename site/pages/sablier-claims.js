import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'

function SablierClaims() {
  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto">
        <h1 className="text-1.5xl font-bold text-center">Sablier Claims</h1>
        <div className="flex flex-wrap space-y-1 max-w-lg w-full mx-auto mt-10 justify-center">
          <Input title="Stream ID:" />
          <Input title="Balance:" />
        </div>
        <div className="flex justify-center mt-7.5">
          <Button>CLAIM</Button>
        </div>
      </div>
    </Layout>
  )
}

export default SablierClaims
