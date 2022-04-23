const cheerio = require('cheerio')
const DatabaseConnection = require('../../database/DatabaseConnection')
const utils = require('../../utils')
const config = require('../../config')
const async = require('async')
const turf = require('@turf/turf')

let baseURL = 'https://www.lta.gov.sg/map/busService/bus_services.xml'
let serviceSearch = 'CITYDIRECT bus_service, TRUNK bus_service'
let kmlURL = 'https://www.lta.gov.sg/map/busService/bus_route_kml/{0}-{1}.kml'
let coordinateSearch = 'kml > Document > Placemark LineString > coordinates'

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

  let baseURLData = await utils.request(baseURL)

  let $ = cheerio.load(baseURLData)

  let busServices = Array.from($(serviceSearch)).filter(serviceData => {
    let serviceNumber = $('number', serviceData).text()
    return serviceNumber[0] !== '-' && !serviceNumber.endsWith('T')
  }).map(serviceData => {
    let serviceNumber = $('number', serviceData).text()
    let files = Array.from($('kmlFile file', serviceData))

    return { serviceNumber, kmlCount: files.length }
  }).reduce((acc, serviceData) => {
    let {serviceNumber, kmlCount} = serviceData

    acc[serviceNumber] = kmlCount

    return acc
  }, {})

  let allBusServices = await services.distinct('fullService')

  let totalKMLCount = 0

  async function fetchKMLData(fullService, direction) {
    return await utils.request(kmlURL.format(fullService.toUpperCase(), direction), {
      timeout: 30000
    })
  }

  function match(allCoords) {
    let allTexts = Array.from(allCoords).map(coord => $(coord).text())
    let deduped = allTexts.filter((e, i, a) => a.indexOf(e) === i)
    let joint = deduped.join(' ')
    let merged = joint.split(' ').filter((e, i, a) => a.indexOf(e) === i)

    if (allCoords.length === 0) throw Error()
    return merged.map(cpair => cpair.split(',').map(coord => parseFloat(coord)))
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
        console.log(e);
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
      console.log(e);
      console.log('Failed to fetch KML data for', fullService)
    }
  })

  console.log('Completed loading in ' + totalKMLCount + ' bus route paths')
  process.exit()
})
