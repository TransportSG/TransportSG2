import utils from '../../utils.mjs'
import lines from '../../mrt-lines.json' with { type: 'json' }
import { MongoDatabaseConnection } from '@transportme/database'
import config from '../../config.json' with { type: 'json' }

const database = new MongoDatabaseConnection(config.databaseURL, config.databaseName)

let mergedStations = {}

Object.keys(lines).forEach(lineName => {
  let lineData = lines[lineName]
  let chineseLineName = lineData.chineseName

  lineData.stations.forEach(station => {
    let { stationName, chineseStationName,
    stationNumber, position, stationCode } = station

    if (!mergedStations[stationName]) {
      mergedStations[stationName] = {
        mode: 'mrt',
        stopCode: [],
        roadName: null,
        stopName: stationName,
        codedStopName: utils.encodeName(stationName),
        lines: [],
        operational: station.hasOwnProperty('operational') ? station.operational : true
      }
      if (position)
        mergedStations[stationName].position = position
    }

    mergedStations[stationName].stopCode.push(stationNumber)
    mergedStations[stationName].lines.push(lineName)
  })
})

let stations = Object.values(mergedStations)

await database.connect()

let stops = database.getCollection('stops')

await stops.deleteDocuments({ mode: 'mrt' })
await stops.bulkWrite(stations.map(mrtStation => ({
  insertOne: {
    document: mrtStation
  }
})), {
  ordered: false
})

console.log('Completed loading in ' + stations.length + ' MRT stations')
process.exit()