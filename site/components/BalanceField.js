const BalanceField = ({ title, value, suffix }) => (
  <>
    {title && (
      <div className="w-full text-gray-600">
        <p className="text-center mb-1.5 font-bold">{title}</p>
      </div>
    )}
    <div className="flex w-full border-2 bg-gray-50 h-10">
      <p className="w-full text-center m-auto">
        {value} {suffix}
      </p>
    </div>
  </>
)

export default BalanceField
