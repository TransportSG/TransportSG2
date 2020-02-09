const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getDepartures = require('../timings/mrt')
const async = require('async')

router.get('/:codedStationName', async (req, res) => {
  let stops = res.db.getCollection('stops')
  let stationData = await stops.findDocument({
    mode: 'mrt',
    codedStopName: req.params.codedStationName
  })

  if (!stationData) return res.end('no departure need to do that screen')

  let departures = await getDepartures(stationData)

  departures = departures.filter(departure => departure.destination !== 'Do not board')

  res.render('mrt/timings', {
    departures,
    station: stationData,
    timeDifference: utils.prettyTimeToArrival
  })
})


module.exports = router
