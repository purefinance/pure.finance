import Layout from '../components/Layout'
import Input from '../components/Input'
import Button from '../components/Button'

function MerkleClaims() {
  return (
    <Layout walletConnection>
      <div className="text-center max-w-2xl w-full mx-auto mb-28">
        <h1 className="text-1.5xl font-bold text-center">Merkle Claims</h1>
        <div className="flex flex-wrap space-y-1 max-w-lg w-full mx-auto mt-10 justify-center">
          <Input title="Claim ID:"/>
          <Input title="ERC20 Address:"/>
          <Input title="Balance:"/>
        </div>
        <div className="flex justify-center mt-7.5">
          <Button>
            CLAIM
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default MerkleClaims
