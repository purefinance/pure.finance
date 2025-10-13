import React from 'react'

import SvgContainer from './svg/SvgContainer'

const commonInputStyles =
  'text-base bg-white placeholder-slate-400 placeholder-capitalize'

export const InputTitle = ({ children }) => (
  <label className="text-md text-slate-500 mb-2.5 block">{children}</label>
)

const SimpleInput = props => (
  <input
    {...props}
    className={`${commonInputStyles} focus:outline-none w-full text-base`}
  />
)

const SuffixedInput = ({ suffix, ...props }) => (
  <div className={`${commonInputStyles} flex w-full`}>
    <input
      {...props}
      className="placeholder-capitalize focus:outline-none flex-1 bg-transparent tabular-nums"
    />
    <div className="m-auto w-16">{suffix}</div>
  </div>
)

const Caption = ({ caption, captionColor }) => (
  <div className="mt-2 flex items-center px-4">
    <CaptionIcon captionColor={captionColor} />
    <p className={`text-sm ${captionColor}`}>{caption}</p>
  </div>
)

function CaptionIcon({ captionColor }) {
  const name = captionColor.includes('red')
    ? 'error'
    : captionColor.includes('green')
      ? 'check'
      : ''

  return name && <SvgContainer className={`mr-2 h-4 w-4`} name={name} />
}

const Input = ({
  className = '',
  title,
  suffix,
  caption,
  captionColor,
  ...props
}) => (
  <div className={`mb-6 w-full ${className}`}>
    <div className={`flex w-full rounded-xl border px-4 py-3`}>
      {suffix ? (
        <SuffixedInput suffix={suffix} {...props} placeholder={title} />
      ) : (
        <SimpleInput {...props} placeholder={title} />
      )}
    </div>
    {<Caption caption={caption || '-'} captionColor={captionColor} />}
  </div>
)

export const TextArea = ({
  className = '',
  title,
  suffix,
  caption,
  captionColor,
  ...props
}) => (
  <div className={`mb-6 w-full ${className}`}>
    {title && <InputTitle>{title}</InputTitle>}
    <textarea
      className={`${commonInputStyles} focus:outline-none w-full rounded-xl border px-4 py-3`}
      {...props}
    />
    {caption && <Caption caption={caption} captionColor={captionColor} />}
  </div>
)

export default Input
