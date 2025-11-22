global.startTime = +new Date()

import _ from './utils.mjs'
import config from './config.json' with { type: 'json' }
import MainServer from './server/MainServer.mjs'

const mainServer = new MainServer()

await mainServer.initDatabaseConnection()
mainServer.configMiddleware()
await mainServer.configRoutes()

mainServer.app.listen(config.httpPort)

process.on('uncaughtException', (err) => {
  console.error(new Date() + '  ' + (err && err.stack) ? err.stack : err)
})

console.err = console.error
