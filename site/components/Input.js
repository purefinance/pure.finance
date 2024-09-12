import React, { useEffect, useState } from 'react'

import SvgContainer from './svg/SvgContainer'

const commonInputStyles =
  'text-base px-4 py-3 rounded-xl bg-white placeholder-slate-400 border placeholder-capitalize'

export const InputTitle = ({ children }) => (
  <label className="text-md text-slate-500 block mb-2.5">{children}</label>
)

const SimpleInput = props => (
  <input
    {...props}
    className={`${commonInputStyles} focus:outline-none text-base w-full`}
  />
)

const SuffixedInput = ({ suffix, ...props }) => (
  <div className={`${commonInputStyles} flex w-full`}>
    <input
      {...props}
      className="placeholder-capitalize flex-1 tabular-nums bg-transparent focus:outline-none"
    />
    <div className="m-auto w-16">{suffix}</div>
  </div>
)

const Caption = ({ caption, captionColor }) =>
  caption && (
    <div className="absolute flex gap-1 items-center">
      <CaptionIcon captionColor={captionColor} />
      <p className={` text-sm pr-4 ${captionColor}`}>{caption}</p>
    </div>
  )

const CaptionIcon = ({ captionColor }) => {
  const [name, setName] = useState('')

  useEffect(() => {
    if (captionColor.includes('red')) {
      setName('error')
    }

    if (captionColor.includes('green')) {
      setName('check')
    }
  }, [])

  return <SvgContainer className={`w-6 h-6`} name={name} />
}

const Input = ({
  className = '',
  title,
  suffix,
  caption,
  captionColor,
  ...props
}) => (
  <div className={`w-full flex items-center justify-end mb-6 ${className}`}>
    {suffix ? (
      <SuffixedInput suffix={suffix} {...props} placeholder={title} />
    ) : (
      <SimpleInput {...props} placeholder={title} />
    )}
    {caption && <Caption caption={caption} captionColor={captionColor} />}
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
  <div className={`w-full mb-6 ${className}`}>
    {title && <InputTitle>{title}</InputTitle>}
    <textarea
      className={`${commonInputStyles} focus:outline-none w-full`}
      {...props}
    />
    {caption && <Caption caption={caption} captionColor={captionColor} />}
  </div>
)

export default Input
