const BIRTH_BLOCK = 13495981

const getKey = address => `payment-streams-events-start-block-${address}`

export const getSavedStreamsInfo = function (account) {
  let parsed
  try {
    parsed = JSON.parse(window.localStorage.getItem(getKey(account)) ?? '{}')
  } catch {
    parsed = {}
  }
  const {
    savedStreams = { incoming: [], outgoing: [] },
    startBlock = BIRTH_BLOCK
  } = parsed
  return { savedStreams, startBlock }
}

export const saveStreamsInfo = function (account, toSave) {
  const { savedStreams, ...rest } = toSave
  // remove duplicates if any, as there might be when fetching more than once the same block
  // for example in local forks without auto-mining.
  const getUniques = array =>
    Array.from(new Set(array.map(stream => stream.id)))
  const mapIdToStream = (ids, array) =>
    ids.map(id => array.find(stream => stream.id === id))
  const uniqueIncomingIds = getUniques(savedStreams.incoming)
  const uniqueOutgoingIds = getUniques(savedStreams.outgoing)
  window.localStorage.setItem(
    getKey(account),
    JSON.stringify({
      savedStreams: {
        incoming: mapIdToStream(uniqueIncomingIds, savedStreams.incoming),
        outgoing: mapIdToStream(uniqueOutgoingIds, savedStreams.outgoing)
      },
      ...rest
    })
  )
}

export const updateStreamInfo = ({ account, streamsView, lib, id }) =>
  lib.getStream(id).then(function (stream) {
    const { savedStreams, startBlock } = getSavedStreamsInfo(account)
    const indexToModify = savedStreams[streamsView].findIndex(s => s.id === id)
    savedStreams[streamsView][indexToModify] = {
      ...stream
    }
    saveStreamsInfo(account, { savedStreams, startBlock })
  })
