import express from 'express'
import utils from '../../utils.mjs'

const router = new express.Router()

router.get('/:routeNumber', async (req, res, next) => {
  let { db } = res
  let routes = db.getCollection('services')
  let { routeNumber } = req.params

  let matchingRoute = await routes.findDocument({
    mode: 'bus',
    fullService: routeNumber,
    direction: 1
  })

  if (!matchingRoute) return next()

  let destination = utils.getDestination(matchingRoute.stops[matchingRoute.stops.length - 1].stopName, routeNumber)

  res.redirect('/bus/route/' + routeNumber + '/' + utils.encodeName(destination))
})

router.get('/:routeNumber/:direction', async (req, res, next) => {
  let { db } = res
  let routes = db.getCollection('services')
  let { routeNumber, direction } = req.params

  let matchingRoutes = await routes.findDocuments({
    mode: 'bus',
    fullService: routeNumber
  }).sort({ direction: 1 }).toArray()

  if (!matchingRoutes.length) return next()

  let destinations = matchingRoutes.map(route => {
    return utils.getDestination(route.stops[route.stops.length - 1].stopName, routeNumber)
  })

  let matchingRoute = matchingRoutes.find((route, i) => {
    return utils.encodeName(destinations[i]) === direction
  })

  if (!matchingRoute) return res.redirect('/bus/route/' + routeNumber + '/' + utils.encodeName(destinations[0]))

  let origin, destination
  origin = matchingRoute.stops[0].stopName
  if (matchingRoute.loopingPoint) {
    let loopingPoint = matchingRoute.loopingPoint.display || matchingRoute.loopingPoint
    destination = utils.getDestination(loopingPoint, routeNumber)
  } else destination = destinations[matchingRoute.direction - 1]

  let otherDirectionURL
  if (matchingRoutes.length === 2) {
    otherDirectionURL = '/bus/route/' + routeNumber + '/' + utils.encodeName(destinations[1 - (matchingRoute.direction - 1)])
  }

  res.render('bus/route', { route: matchingRoute, operators: utils.operators, destinations, origin, destination, otherDirectionURL })
})

export default router