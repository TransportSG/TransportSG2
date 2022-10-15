global.startTime = +new Date()
require('./utils')

const config = require('./config')
const MainServer = require('./server/MainServer')

let mainServer = new MainServer()
mainServer.app.listen(config.httpPort)

process.on('uncaughtException', (err) => {
  console.error(new Date() + '  ' + (err && err.stack) ? err.stack : err)
})

console.err = console.error
