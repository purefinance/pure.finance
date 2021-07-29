import { useEffect, useRef } from 'react'

export const useOnClickOutside = function (handler, initialRef) {
  const internalRef = useRef(null)
  const ref = initialRef ?? internalRef

  useEffect(
    function () {
      const listener = function (e) {
        // Do nothing if clicking ref's element or descendent elements
        if (!ref.current || ref.current.contains(e.target)) {
          return
        }
        handler(e)
      }
      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)
      return function () {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
      }
    },
    // Add ref and handler to effect dependencies
    // It's worth noting that because passed in handler is a new ...
    // ... function on every render that will cause this effect ...
    // ... callback/cleanup to run every render. It's not a big deal ...
    // ... but to optimize you can wrap handler in useCallback before ...
    // ... passing it into this hook.
    [ref, handler]
  )

  return ref
}
