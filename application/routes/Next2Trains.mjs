import express from 'express'
import utils from '../../utils.mjs'
import getDepartures from '../timings/mrt.mjs'
 
const router = new express.Router()

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


export default router