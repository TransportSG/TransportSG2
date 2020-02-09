const async = require('async')
const utils = require('../../utils')
const lines = require('../../mrt-lines.json')
const DatabaseConnection = require('../../database/DatabaseConnection')
const config = require('../../config')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

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
        lines: []
      }
      if (position)
        mergedStations[stationName].position = {
          type: 'Point',
          coordinates: [position.longitude, position.latitude]
        }
    }

    mergedStations[stationName].stopCode.push(stationNumber)
    mergedStations[stationName].lines.push(lineName)
  })
})

let stations = Object.values(mergedStations)

database.connect({
  poolSize: 100
}, async err => {
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
})
