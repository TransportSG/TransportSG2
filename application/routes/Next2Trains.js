const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getDepartures = require('../timings/mrt')
const async = require('async')

async function loadDepartures(req, res) {
  let stops = res.db.getCollection('stops')
  let stationData = await stops.findDocument({
    mode: 'mrt',
    codedStopName: req.params.codedStationName
  })

  if (!stationData) {
    return res.status(404).render('errors/no-stop')
  }

  let departures = await getDepartures(stationData)

  return {
    departures: departures.filter(departure => departure.destination !== 'Do not board'),
    station: stationData,
    timeDifference: utils.prettyTimeToArrival
  }
}

router.get('/:codedStationName', async (req, res) => {
  let response = await loadDepartures(req, res)
  if (response) res.render('mrt/timings', response)
})

router.post('/:codedStationName', async (req, res) => {
  res.render('mrt/template', await loadDepartures(req, res))
})


module.exports = router
