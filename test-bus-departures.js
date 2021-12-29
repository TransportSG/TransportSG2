const DatabaseConnection = require('./database/DatabaseConnection')
const ltaAPI = require('./lta-api')
const utils = require('./utils')
const config = require('./config')
const async = require('async')
const getBusTimings = require('./application/timings/bus')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let stops = database.getCollection('stops')
  let terminals = await stops.findDocuments({
    stopName: /(Terminal|Interchange)/
  }).toArray()

  await async.forEachSeries(terminals, async terminal => {
    console.log('Getting data for', terminal.stopCode, terminal.stopName)
    await getBusTimings(terminal.stopCode, database)
  })

  process.exit(0)
})
