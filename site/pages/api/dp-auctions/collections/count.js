import dpa from '../../../../utils/dp-auctions'

export default function handler(req, res) {
  if (req.method === 'GET') {
    return dpa
      .getTotalCollections()
      .then(function (count) {
        res.status(200).json(count)
      })
      .catch(function (err) {
        console.warn('Could not get collection count', err.message)
        res.status(500).send()
      })
  } else {
    res.status(404).send()
  }
}
