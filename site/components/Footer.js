import Link from 'next/link'
import Vesper from './svg/Vesper'

const Footer = () => (
  <div className="flex flex-wrap justify-center w-full">
    <div className="w-full">
      <p className="text-xs font-semibold text-center opacity-75 text-vesper">
        SPONSORED BY
      </p>
    </div>
    <div className="mt-2">
      <Link href="https://vesper.finance">
        <a target="_blank" rel="noreferrer">
          <Vesper />
        </a>
      </Link>
    </div>
    <div className="flex justify-between w-full pt-3 mt-20 text-xs text-gray-500 border-t-2 space-x-4">
      <div>
        <p>Copyright © 2021 Pure Finance. All Rights Reserved.</p>
      </div>
      <div>
        {/* <p className="text-right">Privacy Policy / Terms & Conditions</p> */}
      </div>
    </div>
  </div>
)

export default Footer
