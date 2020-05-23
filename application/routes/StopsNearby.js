const express = require('express')
const router = new express.Router()

function getDistanceFromLatLon(lat1, lon1, lat2, lon2) {
  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1)  // deg2rad below
  var dLon = deg2rad(lon2-lon1)
  var a =
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
  Math.sin(dLon/2) * Math.sin(dLon/2)

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  var d = R * c // Distance in km
  return Math.floor(d * 1000) // distance in m
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getClosestDistance(userPosition, position) {
  let userLat = userPosition.latitude, userLong = userPosition.longitude
  let distance = getDistanceFromLatLon(position[1], position[0], userLat, userLong)

  return distance
}

let typeMap = {
  'bus': 'Bus Stop',
  'mrt': 'MRT Station',
}

async function getNearbyStops(db, position) {
  let stops = await db.getCollection('stops').findDocuments({
    position: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [position.longitude, position.latitude]
        },
        $maxDistance: 500
      }
    }
  }).toArray()

  return stops
    .map(stop => {
      stop.smallestDistance = getClosestDistance(position, stop.position.coordinates)
      stop.type = typeMap[stop.mode]
      return stop
    }).sort((a, b) => a.smallestDistance - b.smallestDistance)
}

router.get('/', (req, res) => {
  res.render('nearby/index')
})

router.post('/', async (req, res) => {
  let stops = await getNearbyStops(res.db, req.body)
  res.render('nearby/render', {stops})
})

module.exports = router
