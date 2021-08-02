import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

export const useFormButton = function (disabled, onClick, onProgress) {
  const { active } = useWeb3React()

  const [inProgress, setInProgress] = useState(false)

  const handleClick = function () {
    setInProgress(true)
    onProgress(null, 'info')
    onClick()
      .then(function () {
        onProgress(null, 'success')
      })
      .catch(function (err) {
        onProgress(err.message)
      })
      .finally(function () {
        setInProgress(false)
      })
  }

  useEffect(
    function () {
      if (active) {
        return
      }
      setInProgress(false)
    },
    [active]
  )

  return {
    disabled: disabled || inProgress,
    onClick: handleClick
  }
}
