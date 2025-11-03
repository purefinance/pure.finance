import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'

export function useFormProgress(disabled, handleSubmit, onProgress) {
  const { active } = useWeb3React()

  const [inProgress, setInProgress] = useState(false)

  const onSubmit = function (event) {
    event.preventDefault()
    setInProgress(true)
    onProgress('info')
    handleSubmit()
      .then(function () {
        onProgress('success')
      })
      .catch(function (err) {
        onProgress('error', err.message)
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
    canSubmit: !(disabled || inProgress),
    onSubmit
  }
}
