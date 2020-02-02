const cheerio = require('cheerio')
const DatabaseConnection = require('../database/DatabaseConnection')
const utils = require('../utils')
const config = require('../config')
const async = require('async')
const turf = require('@turf/turf')

let baseURL = 'https://www.mytransport.sg/content/mytransport/home/commuting/busservices.html'
let serviceSearch = '.Bus_Service_no option[value!=""][busn=""]'
let kmlURL = 'https://www.mytransport.sg/kml/busroutes/{0}-{1}.kml'
let coordinateSearch = 'kml > Document > Placemark > LineString > coordinates'

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')
  let shapes = database.getCollection('shapes')
  shapes.createIndex({
    fullService: 1,
    direction: 1
  }, {name: 'shape index'})
  // shapes.deleteDocuments({})

  let baseURLData = await utils.request({
    url: baseURL,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0',
      'Host': 'www.mytransport.sg'
    }
  })
  let $ = cheerio.load(baseURLData)

  let busServices = Array.from($(serviceSearch)).map(serviceOption => {
    return serviceOption.value
  }).filter(serviceData => serviceData && serviceData.length < 8).map(serviceData => {
    if (!serviceData.includes('_')) serviceData += '_2'
    let serviceDataParts = serviceData.split('_')
    let [serviceNumber, kmlCount] = serviceDataParts
    return {serviceNumber, kmlCount}
  }).reduce((acc, serviceData) => {
    let {serviceNumber, kmlCount} = serviceData

    acc[serviceNumber] = kmlCount
  }, {})

  let allBusServices = await services.distinct('fullService')

  let totalKMLCount = 0

  async function fetchKMLData(fullService, direction) {
    return await utils.request({
      url: kmlURL.format(fullService.toUpperCase(), direction),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0',
        'Host': 'www.mytransport.sg'
      }
    })
  }

  function match(allCoords) {
    if (allCoords.length !== 1) throw Error()
    return allCoords.text().split(' ').map(cpair => cpair.split(',').map(coord => parseFloat(coord)))
  }

  function shiftLines(coordinates) {
    let cleaned = turf.cleanCoords(turf.lineString(coordinates))
    return cleaned.geometry.coordinates.map((c, i) => {
      let point = turf.point(c)
      let nextPair = coordinates[i + 1]
      let previousPair = coordinates[i - 1]
      let bearing

      if (!nextPair) {
        bearing = turf.rhumbBearing(turf.point(previousPair), point)
      } else if (!previousPair) {
        bearing = turf.rhumbBearing(point, turf.point(nextPair))
      } else {
        bearing = turf.rhumbBearing(turf.point(previousPair), turf.point(nextPair))
      }

      let normalBearing = bearing - 90
      let translatedPoint = turf.transformTranslate(point, 0.005, normalBearing)

      return translatedPoint.geometry.coordinates
    })
  }

  await async.forEachOf(allBusServices, async (fullService, i) => {
    try {
      await new Promise(r => setTimeout(r, i * 500))
      let kmlCount = busServices[fullService]
      let serviceDirections = (await services.distinct('direction', { fullService })).length

      let coordinatesD1
      try {
        let kmlDataD1 = await fetchKMLData(fullService, 1)
        let $1 = cheerio.load(kmlDataD1)
        coordinatesD1 = match($1(coordinateSearch))
      } catch (e) {
        console.log('Could not fetch KML data for ' + fullService + ', trying D2')

        let kmlDataD1 = await fetchKMLData(fullService, 2)
        let $1 = cheerio.load(kmlDataD1)
        coordinatesD1 = match($1(coordinateSearch)).reverse()

        console.log('Using D2 data for D1, reversing route')
      }

      totalKMLCount++
      await shapes.updateDocument({
        fullService, direction: 1
      }, {
        $set: {
          geometry: {
            type: 'LineString',
            coordinates: shiftLines(coordinatesD1)
          }
        }
      }, { upsert: true })

      if (serviceDirections === 2) {
        let coordinatesD2
        if (kmlCount === 1) {
          coordinatesD2 = coordinatesD1.slice(0).reverse()
        } else {
          totalKMLCount++
          let kmlDataD2 = await fetchKMLData(fullService, 2)
          let $2 = cheerio.load(kmlDataD2)
          coordinatesD2 = match($2(coordinateSearch))
        }

        await shapes.updateDocument({
          fullService, direction: 2
        }, {
          $set: {
            geometry: {
              type: 'LineString',
              coordinates: shiftLines(coordinatesD2)
            }
          }
        }, { upsert: true })

      }
    } catch (e) {
      console.log('Failed to fetch KML data for', fullService)
    }
  })

  console.log('Completed loading in ' + totalKMLCount + ' bus route paths')
  process.exit()
})
