const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getBusTimings = require('../timings/bus')
const async = require('async')
const moment = require('moment')

router.get('/:busStopCode', async (req, res) => {
  let {busStopCode} = req.params
  let stops = res.db.getCollection('stops')
  let busStop = await stops.findDocument({ stopCode: busStopCode })

  if (!busStop) throw new Error('no bus stop')

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
    let timings = await getBusTimings(stopCode, res.db)
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

  let now = utils.now()

  res.render('bus/timings', {
    services,
    timings: mergedTimings,
    busStop,
    timeDifference: time => {
      const timeDifference = moment.utc(time.diff(now))
      let prettyTime

      if (+timeDifference <= 60000) prettyTime = 'Now'
      else {
        let minutesToDeparture = timeDifference.get('hours') * 60 + timeDifference.get('minutes')
        prettyTime = minutesToDeparture + ' m'
      }

      return prettyTime
    }
  })
})


module.exports = router
