import { useEffect } from 'react'

import { useRouter } from '../../../navigation'

function DpAuctionsIndex() {
  const router = useRouter()

  useEffect(
    function redirectToDefaultCollection() {
      router.replace(
        `/dp-auctions/collections?id=${process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID}`
      )
    },
    [router]
  )

  return null
}

export default DpAuctionsIndex
