import { inter } from '../../fonts'
import Navbar from '../Navbar'

import Head from './Head'
import HelperBox from './HelperBox'
import ToolsFooter from './ToolsFooter'

const ToolsLayout = ({
  children,
  title,
  helperText,
  walletConnection,
  breadcrumb
}) => (
  <>
    <Head title={title} />
    <div
      className={`h-max bg-grayscale-50 min-h-screen w-full ${inter.className} flex`}
    >
      <div className="flex w-full flex-col justify-between lg:w-8/12 xl:w-9/12">
        <div>
          <Navbar
            breadcrumb={breadcrumb}
            title={title}
            walletConnection={walletConnection}
          />
          <div className="container flex justify-center py-8">{children}</div>
          {helperText && (
            <HelperBox className="lg:hidden" helperText={helperText} />
          )}
        </div>
        <ToolsFooter />
      </div>
      {helperText && (
        <HelperBox
          className="hidden lg:block lg:w-4/12 xl:w-3/12"
          helperText={helperText}
        />
      )}
    </div>
  </>
)

export default ToolsLayout
