const DatabaseConnection = require('../../database/DatabaseConnection')
const ltaAPI = require('../../lta-api')
const utils = require('../../utils')
const config = require('../../config')
const EventEmitter = require('events')
const async = require('async')

let stopLoaders = {}
let stopCache = {}

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

async function getStop(busStopCode, stops) {
  if (stopLoaders[busStopCode]) {
    return await new Promise(resolve => stopLoaders[busStopCode].on('loaded', resolve))
  } else if (!stopCache[busStopCode]) {
    stopLoaders[busStopCode] = new EventEmitter()
    stopLoaders[busStopCode].setMaxListeners(Infinity)

    let stop = await stops.findDocument({
      stopCode: busStopCode,
      mode: 'bus'
    })

    stopLoaders[busStopCode].emit('loaded', stop)
    stopCache[busStopCode] = stop

    delete stopLoaders[busStopCode]

    return stop
  } else return stopCache[busStopCode]
}

function addColonToTime(time) {
  return time.slice(0, 2) + ':' + time.slice(2)
}

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')
  let stops = database.getCollection('stops')

  let data = await ltaAPI.paginatedRequest('/BusRoutes')

  let expandedData = await async.reduce(data, {}, async (acc, busRouteStop) => {
    let {ServiceNo, Direction, BusStopCode, Distance, StopSequence,
      WD_FirstBus, WD_LastBus, SAT_FirstBus, SAT_LastBus, SUN_FirstBus, SUN_LastBus} = busRouteStop
    let id = `${ServiceNo}.${Direction}`
    if (!acc[id]) acc[id] = []

    let busStop = await getStop(BusStopCode, stops)
    if (!busStop) return acc

    acc[id].push({
      stopNumber: StopSequence,
      distance: Distance,
      stopCode: BusStopCode,
      stopName: busStop.stopName,
      roadName: busStop.roadName,
      firstBus: {
        weekday: addColonToTime(WD_FirstBus),
        saturday: addColonToTime(SAT_FirstBus),
        sunday: addColonToTime(SUN_FirstBus)
      },
      lastBus: {
        weekday: addColonToTime(WD_LastBus),
        saturday: addColonToTime(SAT_LastBus),
        sunday: addColonToTime(SUN_LastBus)
      }
    })

    return acc
  })

  let bulkOperations = Object.keys(expandedData).map(id => {
    let stops = expandedData[id]
    let [fullService, direction] = id.split('.')

    let lastStop = stops.slice(-1)[0]

    function addOneMinute(time) {
      let hour = parseInt(time.slice(0, 2))
      let minute = parseInt(time.slice(2))
      minute += 1
      if (minute == 60) {
        minute = 0
        hour++
      }
      if (hour == 24) {
        hour = '00'
      }

      hour = '00' + hour
      minute = '00' + minute

      return `${hour.slice(-2)}${minute.slice(-2)}`
    }

    if (lastStop.stopName === 'Pan Pacific Hotel') {
      stops.push({
        stopNumber: lastStop.stopNumber + 1,
        distance: lastStop.distance + 0.3,
        stopCode: '02099',
        stopName: 'Marina Centre Terminal',
        roadName: 'Raffles Boulevard',
        firstBus: {
          weekday: addOneMinute(lastStop.firstBus.weekday),
          saturday: addOneMinute(lastStop.firstBus.saturday),
          sunday: addOneMinute(lastStop.firstBus.sunday)
        },
        lastBus: {
          weekday: addOneMinute(lastStop.lastBus.weekday),
          saturday: addOneMinute(lastStop.lastBus.saturday),
          sunday: addOneMinute(lastStop.lastBus.sunday)
        }
      })
    }

    if (lastStop.stopName === 'Opposite MAS Building') {
      stops.push({
        stopNumber: lastStop.stopNumber + 1,
        distance: lastStop.distance + 0.2,
        stopCode: '03239',
        stopName: 'Shenton Way Terminal',
        roadName: 'Shenton Way',
        firstBus: {
          weekday: addOneMinute(lastStop.firstBus.weekday),
          saturday: addOneMinute(lastStop.firstBus.saturday),
          sunday: addOneMinute(lastStop.firstBus.sunday)
        },
        lastBus: {
          weekday: addOneMinute(lastStop.lastBus.weekday),
          saturday: addOneMinute(lastStop.lastBus.saturday),
          sunday: addOneMinute(lastStop.lastBus.sunday)
        }
      })
    }

    if (lastStop.stopCode === '11389') { // Block 46, BNV Ter
      stops.push({
        stopNumber: lastStop.stopNumber + 1,
        distance: lastStop.distance + 0.2,
        stopCode: '11379',
        stopName: 'Buona Vista Terminal',
        roadName: 'North Buona Vista Road',
        firstBus: {
          weekday: addOneMinute(lastStop.firstBus.weekday),
          saturday: addOneMinute(lastStop.firstBus.saturday),
          sunday: addOneMinute(lastStop.firstBus.sunday)
        },
        lastBus: {
          weekday: addOneMinute(lastStop.lastBus.weekday),
          saturday: addOneMinute(lastStop.lastBus.saturday),
          sunday: addOneMinute(lastStop.lastBus.sunday)
        }
      })
    }

    if (lastStop.stopCode === '46008')
      stops[stops.length - 1].stopCode = '46009'

    if (stops[0].stopCode === '46008')
      stops[0].stopCode = '46009'

    stops = stops.filter((stop, i, a) => {
      if (a[i - 1]) return a[i - 1].stopCode !== stop.stopCode
      return true
    }).map((stop, i) => {
      stop.stopNumber = i + 1
      return stop
    })

    return {
      updateOne: {
        filter: {
          fullService,
          direction: parseInt(direction)
        },
        update: {
          $set: { stops }
        }
      }
    }
  })

  await services.bulkWrite(bulkOperations, {
    ordered: false
  })

  await services.deleteDocuments({
    stops: {
      $exists: false
    }
  })

  console.log('Completed updating in ' + bulkOperations.length + ' bus services')
  process.exit()
})
