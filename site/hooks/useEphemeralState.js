import { useState, useEffect, useRef, useCallback } from 'react'

export function useEphemeralState(initialState, delay = 5000) {
  const [state, setState] = useState(initialState)
  const initialStateRef = useRef(initialState)
  const timeoutRef = useRef(/** @type {NodeJS.Timeout | null} */ (null))

  function stopTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const setTempState = useCallback(
    function (newState) {
      stopTimeout()
      setState(newState)
      timeoutRef.current = setTimeout(function () {
        setState(initialStateRef.current)
        timeoutRef.current = null
      }, delay)
    },
    [delay]
  )

  useEffect(() => stopTimeout, [])

  return [state, setTempState]
}
