import { useTranslations } from 'next-intl'

import TokenContainer from './svg/TokenContainer'

const Balance = ({ balance, showMax, setMax }) => {
  const t = useTranslations()

  return (
    <div className="flex gap-1 items-center">
      <span className="text-slate-500">{t('balance')}:</span>
      <label className="text-black text-sm">{balance}</label>
      {showMax && (
        <label className="text-orange-950 ml-1 cursor-pointer" onClick={setMax}>
          MAX
        </label>
      )}
    </div>
  )
}

const Token = ({ token }) => (
  <div className="flex gap-2 items-center">
    <TokenContainer name={token} />
    <label className="text-black text-base">{token}</label>
  </div>
)

const InputBalance = ({
  className = '',
  title,
  token,
  balance,
  showMax,
  setMax,
  ...props
}) => (
  <div className={`w-full bg-slate-50 px-6 py-6 rounded-xl ${className}`}>
    {title && (
      <label className="text-md text-slate-500 block mb-2.5">{title}</label>
    )}
    <div className="flex items-center text-right">
      <input
        className="bg-slate-50 placeholder-black w-full text-black text-4xl focus:outline-none"
        {...props}
      />
      <div className="flex flex-col gap-2 items-end">
        {token && <Token token={token} />}
        {balance && (
          <Balance balance={balance} setMax={setMax} showMax={showMax} />
        )}
      </div>
    </div>
  </div>
)

export default InputBalance
