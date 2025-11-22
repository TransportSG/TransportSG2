import express from 'express'
import turf from '@turf/turf'

const router = new express.Router()

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

export default router