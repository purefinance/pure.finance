import React from 'react'

const commonInputStyles =
  'text-base p-4 rounded-xl bg-gray-50 placeholder-gray-400 placeholder-capitalize'

export const InputTitle = ({ children }) => (
  <label className="block mb-2.5 text-sm">{children}</label>
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
    <p className={`text-center text-sm mt-2 ${captionColor}`}>{caption}</p>
  )

const Input = ({
  className = '',
  title,
  suffix,
  caption,
  captionColor,
  ...props
}) => (
  <div className={`w-full mb-6 ${className}`}>
    {title && <InputTitle>{title}</InputTitle>}
    {suffix ? (
      <SuffixedInput suffix={suffix} {...props} />
    ) : (
      <SimpleInput {...props} />
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
