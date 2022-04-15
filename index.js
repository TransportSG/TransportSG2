global.startTime = +new Date()
require('./utils')

const config = require('./config.json')
const HTTPServer = require('./server/HTTPServer')
const MainServer = require('./server/MainServer')

let mainServer = new MainServer()
let httpServer = HTTPServer.createServer(mainServer)

httpServer.listen(config.httpPort)

process.on('uncaughtException', (err) => {
  console.error(new Date() + '  ' + (err && err.stack) ? err.stack : err)
})

console.err = console.error
