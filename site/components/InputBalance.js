import { useTranslations } from 'next-intl'

import TokenContainer from './svg/TokenContainer'
import { TextButton } from './TextButton'

const Balance = function ({ balance, setMax, showMax }) {
  const t = useTranslations()
  return (
    <div className="flex items-center gap-1">
      <span className="text-slate-500">{t('balance')}:</span>
      <span className="text-sm text-black">{balance}</span>
      {showMax && <TextButton onClick={setMax}>{t('max')}</TextButton>}
    </div>
  )
}

const Token = ({ token }) => (
  <div className="flex items-center gap-2">
    <TokenContainer name={token} />
    <span className="text-base text-black">{token}</span>
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
  <div className={`bg-slate-50 w-full rounded-xl px-6 py-6 ${className}`}>
    {title && (
      <label className="text-md text-slate-500 mb-2.5 block">{title}</label>
    )}
    <div className="flex items-center text-right">
      <input
        className="bg-slate-50 focus:outline-none w-full text-4xl text-black placeholder-black"
        {...props}
      />
      <div className="flex flex-col items-end gap-2">
        {token && <Token token={token} />}
        {balance && (
          <Balance balance={balance} setMax={setMax} showMax={showMax} />
        )}
      </div>
    </div>
  </div>
)

export default InputBalance
