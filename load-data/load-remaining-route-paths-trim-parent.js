const async = require('async')
const turf = require('@turf/turf')
const DatabaseConnection = require('../database/DatabaseConnection')
const utils = require('../utils')
const config = require('../config')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')
  let shapes = database.getCollection('shapes')
  let stops = database.getCollection('stops')

  let allBusServices = await services.distinct('fullService')
  let allBusShapes = await shapes.distinct('fullService')

  let missingBusServices = allBusServices.filter(service => {
    return !allBusShapes.includes(service)
  })

  await async.forEach(missingBusServices, async fullService => {
    let serviceData = await services.findDocument({ fullService })
    let parentServiceNumber = serviceData.serviceNumber

    let parentRouteD1 = await shapes.findDocument({ fullService: parentServiceNumber, direction: 1 })
    let parentRouteD2 = await shapes.findDocument({ fullService: parentServiceNumber, direction: 2 })
    let originStop = await stops.findDocument({ stopCode: serviceData.originCode })
    let destinationStop = await stops.findDocument({ stopCode: serviceData.destinationCode })

    let parentGeometry = turf.lineString(parentRouteD1.geometry.coordinates)
    let parentStart = turf.point(parentRouteD1.geometry.coordinates[0])

    let originPos = turf.point(originStop.position.coordinates),
      destinationPos = turf.point(destinationStop.position.coordinates)

    let toStart = turf.length(turf.lineSlice(parentStart, originPos, parentGeometry))
    let toEnd = turf.length(turf.lineSlice(parentStart, destinationPos, parentGeometry))

    if (toStart > toEnd)
      parentGeometry = turf.lineString(parentRouteD2.geometry.coordinates)

    let routeData = turf.lineSlice(originPos, destinationPos, parentGeometry)

    await shapes.updateDocument({
      fullService, direction: 1
    }, {
      $set: {
        geometry: routeData.geometry
      }
    }, { upsert: true })
  })

  console.log('Completed loading in ' + missingBusServices.length + ' bus route paths')
  process.exit()
})
