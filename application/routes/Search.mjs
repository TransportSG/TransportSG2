import express from 'express'
import utils from '../../utils.js'
import safeRegex from 'safe-regex'

const router = new express.Router()

router.get('/', async (req, res) => {
  res.render('search/index', { placeholder: 'MRT Station or Bus Stop' })
})

async function prioritySearch(db, query) {
  let possibleStopNames = [
    query,
    utils.expandStopName(utils.titleCase(query, true))
  ]

  let search = possibleStopNames.map(name => ({stopName: new RegExp(name, 'i')}))

  let priorityStopsByName = (await db.getCollection('stops').findDocuments({
    $or: search
  }).toArray()).filter(stop => {
    return stop.stopName.includes('Interchange') || stop.stopName.includes('Terminal')
      || stop.stopName.includes('Depot') || stop.stopName.includes('Station') || stop.mode === 'mrt'
  }).sort((a, b) => a.stopName.length - b.stopName.length)

  let stopCodeMatch = await db.getCollection('stops').findDocuments({
    'stopCode': query
  }).toArray()

  return stopCodeMatch.concat(priorityStopsByName)
}

async function findStops(db, query) {
  let search

  let prioritySearchResults = await prioritySearch(db, query)
  let excludedIDs = prioritySearchResults.map(stop => stop._id)

  let queryRegex = new RegExp(query, 'i')
  let searchRegex = new RegExp(utils.expandStopName(utils.titleCase(query, true)), 'i')

  let remainingResults = (await db.getCollection('stops').findDocuments({
    _id: {
      $not: {
        $in: excludedIDs
      }
    },
    $or: [{
      stopName: queryRegex
    }, {
      stopName: searchRegex
    }]
  }).limit(15 - prioritySearchResults.length).toArray()).sort((a, b) => a.stopName.length - b.stopName.length)

  let lowPriorityResults = await db.getCollection('stops').findDocuments({
    _id: {
      $not: {
        $in: excludedIDs.concat(remainingResults.map(stop => stop._id))
      }
    },
    $or: [{
      roadName: queryRegex
    }, {
      roadName: searchRegex
    }]
  }).limit(15 - prioritySearchResults.length - remainingResults.length).toArray()

  let currentMRTLines = [
    'North South Line',
    'East West Line',
    'Circle Line',
    'Circle Line Extension',
    'Changi Airport Branch Line',
    'Thomson-East Coast Line'
  ]

  return prioritySearchResults.concat(remainingResults).concat(lowPriorityResults).filter(stop => {
    if (stop.mode === 'mrt') {
      return stop.lines.some(e => currentMRTLines.includes(e)) && stop.operational
    }
    return true
  })
}

async function findRoutes(db, query) {
  if (query.length) {
    return (await db.getCollection('services').findDocuments({
      serviceNumber: query.toUpperCase(),
      direction: 1
    }).toArray()).map(route => {
      route.origin = route.stops[0].stopName
      if (route.loopingPoint) {
        let loopingPoint = route.loopingPoint.display || route.loopingPoint
        route.destination = utils.getDestination(loopingPoint, route.fullService)
      } else route.destination = utils.getDestination(route.stops[route.stops.length - 1].stopName, route.fullService)

      route.operatorCSS = utils.operators[route.operator]

      return route
    })
  } else {
    return []
  }
}

router.post('/', async (req, res) => {
  let query = req.body.query.trim()
  if (!safeRegex(query) || query === '') {
    return res.end('')
  }

  let stops = await findStops(res.db, query)
  let routes = await findRoutes(res.db, query)

  res.render('search/results', {
    stops, routes
  })
})

export default router