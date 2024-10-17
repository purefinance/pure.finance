import { useTranslations } from 'next-intl'

import Dropdown from '../Dropdown'
import SvgContainer from '../svg/SvgContainer'

const HelperBox = ({ helperText, className = '' }) => {
  const t = useTranslations()

  return (
    <div
      className={`border border-slate-200 p-8
        md:m-2 md:rounded-xl md:py-36 md:px-16
        bg-gradient-to-br from-orange-opacity via-white to-white  ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          {helperText.title && (
            <h1 className="text-grayscale-950 text-2xl font-normal">
              {helperText.title}
            </h1>
          )}
          {helperText.text && (
            <h4 className="text-grayscale-500 mt-4 text-sm">
              {helperText.text}
            </h4>
          )}
        </div>
        <div className="mt-32">
          <h4 className="border-grayscale-300/55 text-grayscale-400 mb-4 pb-2 text-sm border-b">
            {t('got-questions')}
          </h4>
          {helperText.questions.map(({ title, answer }) => (
            <div
              className="border-grayscale-300/55 mt-2 px-4 py-3 border rounded-xl"
              key={title}
            >
              <Dropdown
                Selector={({ isOpen }) => (
                  <div className="text-grayscale-950 flex items-center justify-between text-sm">
                    {title}
                    <SvgContainer
                      className={`w-3 text-grayscale-950 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                      name="chevron"
                    />
                  </div>
                )}
                className="cursor-pointer"
              >
                <div className="text-grayscale-500 py-4 text-sm">{answer}</div>
              </Dropdown>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HelperBox
