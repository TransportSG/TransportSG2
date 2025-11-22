import { MongoDatabaseConnection } from '@transportme/database'
import config from './config.json' with { type: 'json' }
import async from 'async'
import getBusTimings from './application/timings/bus.mjs'

const database = new MongoDatabaseConnection(config.databaseURL, config.databaseName)

await database.connect()

let stops = database.getCollection('stops')
let terminals = await stops.findDocuments({
  stopName: /(Terminal|Interchange)/
}).toArray()

await async.forEachSeries(terminals, async terminal => {
  console.log('Getting data for', terminal.stopCode, terminal.stopName)
  await getBusTimings(terminal.stopCode, database)
})

process.exit(0)