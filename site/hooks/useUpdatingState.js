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
