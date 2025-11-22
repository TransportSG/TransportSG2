import DatabaseConnection from '../../database/DatabaseConnection.js'
import ltaAPI from '../../lta-api.js'
import utils from '../../utils.js'
import config from '../../config.js'

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let stops = database.getCollection('stops')
  stops.createIndex({
    mode: 1,
    roadName: 1,
    stopName: 1,
    stopCode: 1,
    position: '2dsphere'
  }, {name: 'stop index', unique: 1})
  stops.createIndex({
    stopName: 1
  }, {name: 'stop name index'})
  stops.createIndex({
    roadName: 1
  }, {name: 'road name index'})
  stops.createIndex({
    stopCode: 1
  }, {name: 'stop code index'})
  stops.createIndex({
    position: '2dsphere'
  }, {name: 'position index'})

  let data = await ltaAPI.paginatedRequest('/BusStops')

  let expandedData = data.map(busStop => {
    busStop.RoadName = utils.expandStopName(busStop.RoadName)
    busStop.Description  = utils.expandStopName(busStop.Description)

    if (busStop.BusStopCode === '68239')
      busStop.RoadName = 'Seletar Aerospace Avenue'
    if (busStop.BusStopCode === '96371')
      busStop.RoadName = 'Changi Business Park Avenue 3'

    return {
      mode: 'bus',
      stopCode: busStop.BusStopCode,
      roadName: busStop.RoadName,
      stopName: busStop.Description,
      position: {
        type: 'Point',
        coordinates: [busStop.Longitude, busStop.Latitude]
      }
    }
  })

  await stops.deleteDocuments({ mode: 'bus' })
  await stops.bulkWrite(expandedData.map(busStop => ({
    insertOne: {
      document: busStop
    }
  })), {
    ordered: false
  })

  console.log('Completed loading in ' + expandedData.length + ' bus stops')
  process.exit()
})
