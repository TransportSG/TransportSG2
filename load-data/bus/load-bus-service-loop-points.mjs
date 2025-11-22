import DatabaseConnection from '../../database/DatabaseConnection.js'
import config from '../../config.js'
import async from 'async'

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')

  let loopingServices = await services.findDocuments({
    loopingPoint: {
      $ne: ""
    }
  }).toArray()

  await async.forEach(loopingServices, async service => {
    let loopingStops = []
    let {loopingPoint, stops} = service
    if (!(loopingPoint instanceof Array)) loopingPoint = [loopingPoint]

    loopingPoint.forEach(loopingStreet => {
      if (loopingStreet.actual) loopingStreet = loopingStreet.actual

      let firstLoopingStop = stops.find(stop => stop.roadName === loopingStreet)
      loopingStops.push(firstLoopingStop.stopCode)
    })

    await services.updateDocument({ _id: service._id }, {
      $set: {
        loopingStops
      }
    })
  })

  console.log('Completed updating in ' + loopingServices.length + ' bus services')
  process.exit()
})
