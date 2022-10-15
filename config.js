const url = require('url')
let config = {}
try {
  config = require('./config.json')
} catch (e) {}

if (process.env.DATABASE_URL) {
  let parts = url.parse(process.env.DATABASE_URL)
  config.databaseURL = `${parts.protocol}//${parts.auth ? parts.auth + '@' : ''}${parts.host}`
  config.databaseName = parts.pathname.slice(1)
}

if (process.env.PORT) {
  config.httpPort = process.env.PORT
}

module.exports = config
