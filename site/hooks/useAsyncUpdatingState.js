import { useEffect, useState } from 'react'

// This hooks maintains a state that is periodically updated through an async
// function call.
//
// During the initial render, the `initialState` is set and an async update is
// triggered by calling `updateState. Then every `delay` milliseconds, the
// `state` is updated again.
//
// If there is an error updating the state, `error` will be set.
export const useAsyncUpdatingState = function (
  initialState,
  updateState,
  delay
) {
  const [state, setState] = useState(initialState)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState()

  const update = function () {
    setUpdating(true)
    updateState()
      .then(setState)
      .catch(setError)
      .finally(function () {
        setUpdating(false)
      })
  }

  useEffect(update, [])

  useEffect(function () {
    const timer = setTimeout(update, delay)

    return function () {
      clearTimeout(timer)
    }
  })

  return { state, updating, error }
}
