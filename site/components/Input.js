const InputTitle = ({ title }) => (
  <p className="font-bold text-center text-gray-600 mb-1.5">{title}</p>
)

const SimpleInput = (props) => (
  <input {...props} className="w-full h-10 text-center align-middle border-2" />
)

const SuffixedInput = ({ suffix, ...props }) => (
  <div className="flex w-full h-10 text-center align-middle border-2">
    <input
      {...props}
      className="flex-1 pl-16 text-center border-r-2 tabular-nums"
    />
    <div className="w-16 m-auto text-center">{suffix}</div>
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
