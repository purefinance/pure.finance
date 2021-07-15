import { useEffect } from 'react'

// Simple hook to execute a callback after a specified timeout.
export const useTimeout = function (callback, ms, dependencies) {
  useEffect(function () {
    const timer = setTimeout(callback, ms)

    return function () {
      clearTimeout(timer)
    }
  }, dependencies)
}
