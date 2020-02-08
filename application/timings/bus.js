const async = require('async')
const moment = require('moment')
const TimedCache = require('timed-cache')
const departuresCache = new TimedCache({ defaultTtl: 1000 * 60 })
const ltaAPI = require('../../lta-api')
const plates = require('../../red-white-plate.json')
const berths = require('../../bus-berths.json')
const utils = require('../../utils')

let url = '/BusArrivalv2?BusStopCode='

module.exports = async function getBusTimings(busStopCode, db) {
  let services = db.getCollection('services')
  let stops = db.getCollection('stops')

  let cached
  if (cached = departuresCache.get(busStopCode)) return cached

  let data = await ltaAPI(url + busStopCode)
  let busTimings = {}

  let departures = await async.reduce(data, [], async (acc, serviceDepartures) => {
    let {ServiceNo} = serviceDepartures
    let {NextBus, NextBus2, NextBus3} = serviceDepartures
    return acc.concat(await async.map([NextBus, NextBus2, NextBus3].filter(b => b.OriginCode), async bus => {
      let {OriginCode, DestinationCode} = bus
      let displayService = ServiceNo

      if (DestinationCode === '02089') // Pan Pacific Hotel
        DestinationCode = '02099'

      if (DestinationCode === '03218') // Opposite MAS Building
        DestinationCode = '03239'

      if (DestinationCode === '46101') // Woodlands Checkpoint
        DestinationCode = '46239'

      if (DestinationCode === '46008') // Woodlands Temporary Interchange
        DestinationCode = '46009'

      if (DestinationCode === '55009' && ServiceNo === 'CT8') // Ang Mo Kio Depot
        DestinationCode = '55151'

      if (DestinationCode === '44531' && ServiceNo === '307') {
        DestinationCode = '44009'
        displayService = '307T'
      }

      let service = await services.findDocument({
        fullService: ServiceNo,
        destinationCode: DestinationCode
      })

      if (!service) console.log({
        fullService: ServiceNo,
        originCode: OriginCode,
        destinationCode: DestinationCode
      })

      let destination = service.stops.slice(-1)[0].stopName

      if (service.loopingPoint) {
        let {loopingStops} = service
        let stopCodes = service.stops.map(stop => stop.stopCode)
        let loopingStopIndices = loopingStops.map(loopingStop => stopCodes.indexOf(loopingStop))

        let currentStopIndex = -1
        for (let i = parseInt(bus.VisitNumber); i > 0; i--)
          currentStopIndex = stopCodes.indexOf(busStopCode, currentStopIndex + 1)

        let loopingPointNumber = 0
        for (let loopingStopIndex of loopingStopIndices) {
          let loopingStop = stopCodes[loopingStopIndex]

          if (currentStopIndex < loopingStopIndex) {
            let loopingStopData = await stops.findDocument({
              stopCode: loopingStop
            })

            if (loopingStopData.stopName.includes('Terminal')
            || loopingStopData.stopName.includes('Interchange')) {
              destination = loopingStopData.stopName
            } else {
              destination = service.loopingPoint
              if (destination.display) destination = destination.display
              if (destination instanceof Array) {
                let interchangeIndices = service.stops
                .filter(stop => stop.stopName.includes('Interchange')).map(stop => stop.stopNumber - 1)
                let middleIndex = interchangeIndices[1]

                if (currentStopIndex < loopingStopIndices[0])
                  destination = destination[loopingPointNumber]
                else if (currentStopIndex < middleIndex)
                  destination = service.stops[0].stopName
                else
                  destination = destination[loopingPointNumber]
              }
              break
            }
          }

          loopingPointNumber++
        }
      }

      let position
      if (bus.Latitude !== '0') {
        position = {
          type: 'Point',
          coordinates: [bus.Longitude, bus.Latitude]
        }
      }

      let plate
      if (plates[ServiceNo]) {
        plate = plates[ServiceNo][destination]
      }

      let berth
      if (berths[busStopCode]) {
        berth = berths[busStopCode][ServiceNo]
          if (berth && berth[destination])
            berth = berth[destination]
      }

      let serviceNumber = utils.getServiceNumber(displayService),
      serviceVariant = utils.getServiceVariant(displayService)

      return {
        fullService: displayService,
        serviceNumber,
        serviceVariant,
        destination,
        estimatedDepartureTime: moment.tz(bus.EstimatedArrival, 'Asia/Singapore'),
        wheelchairAccessible: bus.Feature === 'WAB',
        busType: bus.Type,
        seatsAvailable: bus.Load,
        position,
        plate,
        berth,
        operator: serviceDepartures.Operator
      }
    }))
  })

  departures.forEach(departure => {
    let id = `${departure.fullService}:${departure.destination}`
    if (!busTimings[id]) busTimings[id] = []
    busTimings[id].push(departure)
  })

  departuresCache.put(busStopCode, busTimings)
  return busTimings
}
