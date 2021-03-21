const url = require('url')
const path = require('path')
const fs = require('fs')
const config = require('../config.json')

module.exports = class HTTPSRedirectServer {
  app (req, res) {
    if (req.url.startsWith('/.well-known')) {
      try {
        let filePath = path.join(config.webrootPath, req.url)
        fs.createReadStream(filePath).pipe(res)

        return
      } catch (e) {}
    }

    let redirectedURL = `https://${config.websiteDNSName}${url.parse(req.url).path}`

    res.writeHead(308, { Location: redirectedURL })
    res.end()
  }
}
