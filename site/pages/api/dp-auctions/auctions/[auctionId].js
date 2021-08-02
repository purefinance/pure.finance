import dpa from '../../../../utils/dp-auctions'

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { auctionId } = req.query
    return dpa
      .getAuction(auctionId, true)
      .then(function (auction) {
        res.status(200).json(auction)
      })
      .catch(function (err) {
        console.warn('Could not get auction', auctionId, err.message)
        res.status(500).send()
      })
  } else {
    res.status(404).send()
  }
}
