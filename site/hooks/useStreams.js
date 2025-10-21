import { useWeb3React } from '@web3-react/core'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'
import useSWR from 'swr'

import { PaymentStreamsLibContext } from '../components/context/PaymentStreamsLib'
import { getSavedStreamsInfo, saveStreamsInfo } from '../utils/streams'

const ETH_BLOCK_TIME = 13 // Average block time in Ethereum

export const useStreams = function () {
  const { active, account, chainId, library } = useWeb3React()
  const [secondsPast, setSecondsPast] = useState(1)
  const [futureStreamValues, setFutureStreamValues] = useState({
    incoming: [],
    outgoing: []
  })
  const paymentStreamsLib = useContext(PaymentStreamsLibContext)

  const getStreams = function (address) {
    const { savedStreams, startBlock } = getSavedStreamsInfo(account, chainId)
    return Promise.all([
      library.eth.getBlockNumber(),
      paymentStreamsLib.getStreams(address, startBlock)
    ])
      .then(([blockNumber, streams]) =>
        Promise.all([
          blockNumber,
          Promise.all(
            savedStreams.incoming
              .concat(streams.incoming)
              .map(({ id }) => paymentStreamsLib.getStream(id))
          ),
          Promise.all(
            savedStreams.outgoing
              .concat(streams.outgoing)
              .map(({ id }) => paymentStreamsLib.getStream(id))
          )
        ])
      )
      .then(function ([blockNumber, incoming, outgoing]) {
        const newStreams = {
          incoming,
          outgoing
        }
        saveStreamsInfo(account, chainId, {
          savedStreams: newStreams,
          startBlock: blockNumber + 1
        })
        return newStreams
      })
  }

  const { data, error, mutate } = useSWR(
    active ? `${account}-${chainId}-streams` : null,
    () => getStreams(account).catch(console.error),
    {
      onSuccess() {
        setSecondsPast(1)
      },
      refreshInterval: ETH_BLOCK_TIME * 1000
    }
  )

  const isLoading = data === undefined && error === undefined

  useEffect(
    function () {
      if (isLoading || !!error) {
        return undefined
      }
      const timeoutId = setTimeout(function () {
        const mapStream = ({
          claimable,
          usdPerSec,
          tokenPerSec,
          tokenClaimable,
          ...stream
        }) => ({
          tokenPerSec,
          usdPerSec,
          ...stream,
          claimable: Big(claimable).plus(Big(usdPerSec).times(secondsPast)),
          tokenClaimable: Big(tokenClaimable).plus(
            Big(tokenPerSec).times(secondsPast)
          )
        })
        const newIncoming = data.incoming.map(mapStream)
        const newOutgoing = data.outgoing.map(mapStream)

        setFutureStreamValues({ incoming: newIncoming, outgoing: newOutgoing })
        setSecondsPast(prevSeconds => prevSeconds + 1)
      }, 1000)
      return () => clearTimeout(timeoutId)
    },
    [isLoading, error, data, secondsPast, setSecondsPast, setFutureStreamValues]
  )

  return {
    error,
    futureStreamValues,
    isLoading,
    mutate,
    streams: data
  }
}
