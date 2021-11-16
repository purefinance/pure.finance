const InputTitle = ({ title }) => (
  <p className="mb-1.5 text-center text-gray-600 font-bold">{title}</p>
)

const SimpleInput = props => (
  <input {...props} className="align-middle w-full h-10 text-center border-2" />
)

const SuffixedInput = ({ suffix, ...props }) => (
  <div className="flex align-middle w-full h-10 text-center border-2">
    <input
      {...props}
      className="flex-1 pl-16 text-center tabular-nums border-r-2"
    />
    <div className="m-auto w-16 text-center">{suffix}</div>
  </div>
)

const Caption = ({ caption, captionColor }) =>
  caption && (
    <p className={`text-center text-sm mt-2 ${captionColor}`}>{caption}</p>
  )

const Input = ({ title, suffix, caption, captionColor, ...props }) => (
  <div className="w-full">
    {title && <InputTitle title={title} />}
    {suffix ? (
      <SuffixedInput suffix={suffix} {...props} />
    ) : (
      <SimpleInput {...props} />
    )}
    {caption && <Caption caption={caption} captionColor={captionColor} />}
  </div>
)

export default Input
