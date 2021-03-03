import Link from 'next/link'
import Vesper from "./svg/Vesper";

const Footer = () => (
  <div className="flex flex-wrap w-full justify-center">
    <div className="w-full">
      <p className="text-xs text-center text-vesper font-semibold opacity-75">SPONSORED BY</p>
    </div>
    <div className="mt-2">
      <Link href="https://vesper.finance">
      <a target="_blank" rel="noreferrer">
        <Vesper />  
      </a>
      </Link>
    </div>
    <div className="w-full flex justify-between border-t-2 mt-20 pt-3 text-xs text-gray-500">
      <div>
        <p>Copyright © 2021 Pure Finance. All Rights Reserved.</p>
      </div>
      <div>
        <p>Privacy Policy / Terms & Conditions</p>
      </div>
    </div>
  </div>
)

export default Footer
