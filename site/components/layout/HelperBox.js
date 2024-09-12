import Dropdown from '../Dropdown'
import SvgContainer from '../svg/SvgContainer'

const HelperBox = ({ helperText, className = '' }) => (
  <div
    className={`border border-slate-200 p-8
      md:m-2 md:rounded-xl md:py-36 md:px-16
      bg-gradient-to-br from-orange-opacity via-white to-white  ${className}`}
  >
    <div className="flex flex-col justify-between h-full">
      <div>
        {helperText.title && (
          <h1 className="text-2xl font-normal">{helperText.title}</h1>
        )}
        {helperText.text && (
          <h4 className="text-slate-500 mt-4 text-sm">{helperText.text}</h4>
        )}
      </div>
      <div className="mt-32">
        <h4 className="text-slate-500 mb-4 pb-2 text-sm border-b">
          Got Questions?
        </h4>
        {helperText.questions.map(({ title, answer }) => (
          <div
            className="border-slate-20 mt-2 px-4 py-3 border rounded-xl"
            key={title}
          >
            <Dropdown
              Selector={({ isOpen }) => (
                <div className="flex items-center justify-between text-black text-sm">
                  {title}
                  <SvgContainer
                    className={`w-6 h-6 fill-current ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                    name="caret"
                  />
                </div>
              )}
              className="text-gray-600 cursor-pointer"
            >
              <div className="text-slate-500 py-4 text-sm">{answer}</div>
            </Dropdown>
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default HelperBox
