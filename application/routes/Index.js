const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const getBusTimings = require('../timings/bus')
const turf = require('@turf/turf')

router.get('/', async (req, res) => {
  res.render('index')
})

router.get('/map/:fullService', async (req, res) => {
  res.render('map')
})

router.post('/map/:fullService', async (req, res) => {
  let shapes = res.db.getCollection('shapes')
  let routeShapes = await shapes.findDocuments(req.params).toArray()

  let allLines = turf.multiLineString(routeShapes.map(r => r.geometry.coordinates))
  let bbox = turf.bboxPolygon(turf.bbox(allLines))
  bbox = turf.transformScale(bbox, 1.1)

  res.json({routeShapes, bbox})
})

module.exports = router
