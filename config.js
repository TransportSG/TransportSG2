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

if (process.env.PORT) config.httpPort = process.env.PORT

if (process.env.LTA_KEY) config.ltaAccountKey = process.env.LTA_KEY
if (process.env.ONEMAP_EMAIL) config.oneMapEmail = process.env.ONEMAP_EMAIL
if (process.env.ONEMAP_PASSWORD) config.oneMapPassword = process.env.ONEMAP_PASSWORD

module.exports = config
