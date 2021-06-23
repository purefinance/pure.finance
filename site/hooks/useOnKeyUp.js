import { useRef, useEffect } from 'react'

export const useOnKeyUp = function (handler, initialRef) {
  const internalRef = useRef(null)
  const ref = initialRef ?? internalRef

  useEffect(
    function () {
      document.addEventListener('keyup', handler)
      return function () {
        document.removeEventListener('keyup', handler)
      }
    },
    [ref, handler]
  )

  return ref
}
