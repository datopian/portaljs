import axios from 'axios'

export default function handler(req, res) {
  if (!req.query.url) {
    res.status(200).send({
      error: true,
      info: 'No url to proxy in query string i.e. ?url=...'
    })
    return
  }
  axios({
    method: 'get',
    url: req.query.url,
     responseType:'stream'
    })
  .then(resp => {
    resp.data.pipe(res)
  })
  .catch(err => {
    res.status(400).send({
      error: true,
      info: err.message,
      detailed: err
    })
  })
}
