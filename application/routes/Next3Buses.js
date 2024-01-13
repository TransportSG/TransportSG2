const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getBusTimings = require('../timings/bus')
const async = require('async')
const { destination } = require('@turf/turf')

async function loadDepartures(busStopCode, db,  req, res) {
  let stops = db.getCollection('stops')
  let busStop = await stops.findDocument({ stopCode: busStopCode })

  if (!busStop) {
    return { error: 'no-stop' }
  }

  let similarStops = await stops.distinct('stopCode', {
    position: {
      $nearSphere: {
        $geometry: busStop.position,
        $maxDistance: 200
      }
    },
    stopName: busStop.stopName
  })

  let stopTimings = {}

  await async.forEach(similarStops, async stopCode => {
    let timings = await getBusTimings(stopCode, db)
    stopTimings[stopCode] = timings
  })

  let services = []
  let mergedTimings = {}

  let servicesSeen = []

  Object.values(stopTimings).forEach(stop => {
    Object.keys(stop).forEach(serviceDest => {
      let [fullService, destination] = serviceDest.split(':')
      let departures = stop[serviceDest]

      if (!mergedTimings[fullService]) mergedTimings[fullService] = {}
      mergedTimings[fullService][destination] = departures

      let {serviceNumber, serviceVariant} = departures[0]
      let sortIndex
      if (serviceNumber === 'NR') {
        sortIndex = parseInt(serviceVariant) + .99999
      } else {
        let dot = serviceNumber
        if (serviceVariant) {
          dot += '.' + serviceVariant.toUpperCase().charCodeAt(0)
        }
        sortIndex = parseFloat(dot)
      }

      let serviceID = fullService + destination
      if (!servicesSeen.includes(serviceID)) {
        services.push({
          displayService: fullService,
          sortIndex
        })
        servicesSeen.push(serviceID)
      }
    })
  })

  services = services.sort((a, b) => a.sortIndex - b.sortIndex).map(e => e.displayService)
  .filter((e, i, a) => a.indexOf(e) === i)

  return {
    services,
    timings: mergedTimings,
    busStop,
    timeDifference: utils.prettyTimeToArrival
  }
}

router.get('/:busStopCode', async (req, res) => {
  let response = await loadDepartures(req.params.busStopCode, res.db)

  if (response.error === 'no-stop') res.status(404).render('errors/no-stop')
  else res.render('bus/timings', response)
})

router.post('/:busStopCode', async (req, res) => {
  let response = await loadDepartures(req.params.busStopCode, res.db)
  
  if (response.error === 'no-stop') res.status(404).render('errors/no-stop')
  else res.render('bus/template', response)
})

router.get('/:busStopCode/json', async (req, res) => {
  let response = await loadDepartures(req.params.busStopCode, res.db)
  
  if (response.error === 'no-stop') res.status(404)
  res.json(response)
})

router.get('/:busStopCode/json/minified', async (req, res) => {
  let response = await loadDepartures(req.params.busStopCode, res.db)
  
  if (response.error === 'no-stop') res.status(404)
  res.json(response.services.map(svc => {
    let data = response.timings[svc]
    let directions = Object.keys(data)

    return directions.map(dir => {
      let destinationInfo = data[dir][0].destinationInfo

      return {
        s: svc,
        d: dir,
        i: destinationInfo,
        b: data[dir].map(dep => ({
          e: dep.estimatedDepartureTime,
          b: dep.busType[0],
          a: dep.seatsAvailable[1]
        }))
      }
    })
  }).reduce((acc, svc) => acc.concat(svc), []))
})


module.exports = router