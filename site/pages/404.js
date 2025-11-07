import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const DEFAULT_LOCALE = 'en'

/* eslint-disable sort-keys */
const states = {
  loading: 0,
  redirecting: 1,
  prefixed: 2
}
/* eslint-enable sort-keys */

export default function LocalizedRedirectHandler() {
  const router = useRouter()

  const [state, setState] = useState(states.loading)

  useEffect(
    function redirectIfNotLocalized() {
      if (typeof window === 'undefined') {
        return
      }

      const path = window.location.pathname
      if (path.startsWith(`/${DEFAULT_LOCALE}/`)) {
        setState(states.prefixed)
      } else {
        setState(states.redirecting)
        router.replace(`/${DEFAULT_LOCALE}${path}`)
      }
    },
    [router]
  )

  return (
    <div className="bg-grayscale-50 flex min-h-screen items-center justify-center text-center">
      {state === states.loading ? null : state === states.redirecting ? (
        <p>Redirecting...</p>
      ) : (
        <p>404 | This page could not be found</p>
      )}
    </div>
  )
}
