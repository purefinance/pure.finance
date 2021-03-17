const BalanceField = ({ title, value, suffix }) => (
  <>
    {title && (
      <div className="w-full text-gray-600">
        <p className="font-bold text-center mb-1.5">{title}</p>
      </div>
    )}
    <div className="flex w-full h-10 border-2 bg-gray-50">
      <p className="w-full m-auto text-center">
        {value} {suffix}
      </p>
    </div>
  </>
)

export default BalanceField
