import { useState } from 'react'

import { useTimeout } from './useTimeout'

// This is a hook that returns a state that auto-updates periodically by calling
// `getState`. The update period is set through `delay` and is ms.
export const useUpdatingState = function (getState, delay, deps) {
  const [state, setState] = useState(getState())

  useTimeout(
    function () {
      setState(getState())
    },
    delay,
    deps
  )

  return state
}

// Async version of `useUpdatingState`.
export const useUpdatingStateAsync = function (
  initialState,
  getState,
  delay,
  deps
) {
  const [updating, setUpdating] = useState(false)
  const [state, setState] = useState(initialState)
  const [error, setError] = useState()

  useTimeout(
    function () {
      setUpdating(true)
      Promise.resolve(getState())
        .then(setState)
        .catch(setError)
        .finally(function () {
          setUpdating(false)
        })
    },
    delay,
    deps
  )

  return { state, error, updating }
}
