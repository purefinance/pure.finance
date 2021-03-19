import Link from 'next/link'
import Button from './Button'

const UtilityBox = ({ buttonText, buttonHref }) => (
  <div className="mx-2 mt-6">
    <Link href={buttonHref}>
      <a>
        <div className="border-2 rounded-md">
          <img className=" pb-14 px-0.5" src="/utilities-box-graphic.png" />
        </div>
        <div className="flex justify-center -mt-6">
          <div className="mx-auto">
            <Button>{buttonText.toUpperCase()}</Button>
          </div>
        </div>
      </a>
    </Link>
  </div>
)

const Utilities = () => (
  <div className="flex flex-wrap justify-center w-full">
    <div className="w-full mb-3.5">
      <p className="font-bold text-center text-gray-600">Utilities:</p>
    </div>
    <UtilityBox buttonHref="/merkle-claims" buttonText="Merkle Claims" />
    <UtilityBox buttonHref="/sablier-claims" buttonText="Sablier Claims" />
    <UtilityBox buttonHref="/token-approvals" buttonText="Token Approvals" />
  </div>
)

export default Utilities
