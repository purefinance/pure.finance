import { useEffect, useRef, useState } from 'react'

export const useEphemeralState = function (initialState, delay = 5000) {
  const [state, setState] = useState(initialState)
  const timeoutRef = useRef(/** @type {NodeJS.Timeout | null} */ (null))

  function stopTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  function resetState() {
    setState(initialState)
  }

  function setTempState(newState) {
    stopTimeout()
    setState(newState)
    timeoutRef.current = setTimeout(resetState, delay)
  }

  useEffect(() => stopTimeout, [])

  return [state, setTempState]
}
