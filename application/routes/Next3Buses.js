const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getBusTimings = require('../timings/bus')
const async = require('async')

router.get('/:busStopCode', async (req, res) => {
  let {busStopCode} = req.params
  let stops = res.db.getCollection('stops')
  let busStop = await stops.findDocument({ stopCode: busStopCode })

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

  let mergedTimings = {}
  Object.values(stopTimings).forEach(stop => {
    Object.keys(stop).forEach(serviceDest => {
      let [serviceNumber, destination] = serviceDest.split(':')
      let departures = stop[serviceDest]

      if (!mergedTimings[serviceNumber]) mergedTimings[serviceNumber] = {}
      mergedTimings[serviceNumber][destination] = departures
    })
  })

  res.json(mergedTimings)
})


module.exports = router
