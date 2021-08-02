import dpa from '../../../../utils/dp-auctions'

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { collectionId } = req.query
    return dpa
      .getCollectionAuctions(collectionId)
      .then(function (auctions) {
        res.status(200).json(auctions)
      })
      .catch(function (err) {
        console.warn(
          'Could not get auctions in collection',
          collectionId,
          err.message
        )
        res.status(500).send()
      })
  } else {
    res.status(404).send()
  }
}
