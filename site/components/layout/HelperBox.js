import { useTranslations } from 'next-intl'

import Dropdown from '../Dropdown'
import SvgContainer from '../svg/SvgContainer'

function HelperBox({ helperText, className = '' }) {
  const t = useTranslations()

  return (
    <div
      className={`border-slate-200 from-grayscale-950/10 border bg-gradient-to-br via-white to-white p-8 md:m-2 md:rounded-xl md:px-16 md:py-36 ${className}`}
    >
      <div className="flex h-full flex-col justify-between">
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
          <h4 className="border-grayscale-300/55 text-grayscale-400 mb-4 border-b pb-2 text-sm">
            {t('got-questions')}
          </h4>
          {helperText.questions.map(({ title, answer }) => (
            <div
              className="border-grayscale-300/55 mt-2 rounded-xl border bg-white px-4 py-3 shadow-sm"
              key={title}
            >
              <Dropdown
                Selector={({ isOpen }) => (
                  <div className="text-grayscale-950 flex items-center justify-between text-sm">
                    {title}
                    <SvgContainer
                      className={`text-grayscale-950 w-3 ${
                        isOpen ? 'rotate-180 transform' : ''
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
