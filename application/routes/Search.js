const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const safeRegex = require('safe-regex')

router.get('/', async (req, res) => {
  res.render('search/index')
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
      || stop.stopName.includes('Depot') || stop.stopName.includes('Station')
  }).sort((a, b) => a.stopName.length - b.stopName.length)

  let stopCodeMatch = await db.getCollection('stops').findDocuments({
    'stopCode': query
  }).toArray()

  return stopCodeMatch.concat(priorityStopsByName)
}

async function performSearch (db, query) {
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
      roadName: queryRegex
    }, {
      stopName: queryRegex
    }, {
      stopName: searchRegex
    }]
  }).limit(15 - prioritySearchResults.length).toArray()).sort((a, b) => a.stopName.length - b.stopName.length)

  // let lowPriorityResults = await db.getCollection('stops').findDocuments({
  //   _id: {
  //     $not: {
  //       $in: excludedIDs.concat(remainingResults.map(stop => stop._id))
  //     }
  //   },
  //   $or: [{
  //     'bays.fullStopName': queryRegex
  //   }, {
  //     'bays.originalStopName': queryRegex
  //   }, {
  //     'bays.fullStopName': searchRegex
  //   }]
  // }).limit(15 - prioritySearchResults.length - remainingResults.length).toArray()

  // return prioritySearchResults.concat(remainingResults).concat(lowPriorityResults)
  return prioritySearchResults.concat(remainingResults)
}

router.post('/', async (req, res) => {
  let query = req.body.query.trim()
  if (!safeRegex(query) || query === '') {
    return res.end('')
  }

  const results = await performSearch(res.db, query)

  res.render('search/results', {
    results
  })
})

module.exports = router
