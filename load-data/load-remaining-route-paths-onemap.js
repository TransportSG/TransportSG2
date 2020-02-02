const async = require('async')
const polyline = require('@mapbox/polyline')
const DatabaseConnection = require('../database/DatabaseConnection')
const utils = require('../utils')
const config = require('../config')

let authURL = 'https://developers.onemap.sg/privateapi/auth/post/getToken'
let busRouteURL = 'https://developers.onemap.sg/publicapi/busexp/getOneBusRoute'

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')
  let shapes = database.getCollection('shapes')

  let allBusServices = await services.distinct('fullService')
  let allBusShapes = await shapes.distinct('fullService')

  let token = JSON.parse(await utils.request({
    url: authURL,
    method: 'POST',
    formData: {
      email: config.oneMapEmail,
      password: config.oneMapPassword,
    }
  })).access_token

  let missingBusServices = allBusServices.filter(service => {
    return !allBusShapes.includes(service)
  })

  let updatedCount = 0

  await async.forEach(missingBusServices, async (fullService, i) => {
    await new Promise(r => setTimeout(r, i * 500))

    let serviceDirections = (await services.distinct('direction', { fullService })).length
    for (let i = 1; i <= serviceDirections; i++) {
      let data = JSON.parse(await utils.request(
        `${busRouteURL}?busNo=${fullService}&direction=${i}&token=${token}`
      ))
      if (data.RESULT === 'This bus service has got no available route.' && i === 1)
        data = JSON.parse(await utils.request(
          `${busRouteURL}?busNo=${fullService}&direction=2&token=${token}`
        ))

      let sequences = data['BUS_DIRECTION_' + (i === 1 ? 'ONE' : 'TWO')]
      if (!sequences) {
        console.log('Failed', {
          fullService, direction: i
        })
        continue
    }

      let fullRoute = sequences.map(sequence => {
        return polyline.decode(sequence.GEOMETRIES)
      }).reduce((acc, c) => acc.concat(c), []).map(c => {
        return c.reverse()
      })

      updatedCount++
      await shapes.updateDocument({
        fullService, direction: i
      }, {
        $set: {
          geometry: {
            type: 'LineString',
            coordinates: fullRoute
          }
        }
      }, { upsert: true })
    }
  })

  console.log('Completed loading in ' + updatedCount + ' bus route paths')
  process.exit()
})
