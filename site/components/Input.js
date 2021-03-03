const Input = ({title, ...props }) => (
  <>
    {title && (
      <div className="w-full text-gray-600">
        <p className="text-center mb-1.5 font-bold">{title}</p>
      </div>
    )}
    <input {...props} className="w-full text-center border-2 h-10 align-middle"/>
  </>
)

export default Input
