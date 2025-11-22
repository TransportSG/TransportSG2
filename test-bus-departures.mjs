import DatabaseConnection from './database/DatabaseConnection.js'
import config from './config.json' with { type: 'json' }
import async from 'async'
import getBusTimings from './application/timings/bus.mjs'

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
