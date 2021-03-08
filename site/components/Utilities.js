import Link from 'next/link'
import Button from './Button'

const UtilityBox = ({ buttonText, buttonHref }) => (
  <Link href={buttonHref}>
    <a>
      <div className="border-2 rounded-md mx-2 pb-14 px-0.5 mt-6 md:mt-0">
        <img src="/utilities-box-graphic.png" />
      </div>
      <div className="flex justify-center -mt-6">
        <div className="mx-auto">
          <Button>{buttonText.toUpperCase()}</Button>
        </div>
      </div>
    </a>
  </Link>
)
const Utilities = () => (
  <div className="flex flex-wrap w-full justify-center">
    <div className="w-full">
      <p className="text-center mb-3.5 font-bold text-gray-600">Utilities:</p>
    </div>
    <UtilityBox buttonText="Merkle Claims" buttonHref="/merkle-claims" />
    <UtilityBox buttonText="Sablier Claims" buttonHref="/sablier-claims" />
  </div>
)

export default Utilities
