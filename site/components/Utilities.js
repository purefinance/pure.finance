import Link from 'next/link'
import Button from './Button'

const UtilityBox = ({ buttonText, buttonHref }) => (
  <div>
    <div className="border-2 rounded-md mx-2 pb-14 px-0.5"> 
      <img src="/utilities-box-background.png" />
    </div>
    <div className="flex justify-center -mt-6">
      <Link href={buttonHref}>
        <a className="mx-auto">
          <Button>
            {buttonText.toUpperCase()}
          </Button>
        </a>
      </Link>
    </div>
  </div>
)
const Utilities = () => (
  <div className="flex flex-wrap w-full justify-center">
    <div className="w-full">
      <p className="text-center mb-3.5 font-bold text-gray-600">Utilities:</p>
    </div>
    <UtilityBox buttonText='Merkle Claims' buttonHref="/merkle"/>
    <UtilityBox buttonText='Sablier Claims' buttonHref="/sablier"/>
  </div>
)

export default Utilities