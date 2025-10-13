// Fetch a resource and parse the result as JSON after checking the response was
// ok (i.e. the status is lower than 400).
const fetchJson = (url, init) =>
  fetch(url, init).then(function (res) {
    if (!res.ok) {
      throw new Error(
        `Fetch failed with status code ${res.status} (${res.statusText})`
      )
    }
    return res.json()
  })

export default fetchJson
