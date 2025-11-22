import crypto from 'crypto'
import TimedCache from 'timed-cache'
import utils from '../../utils.mjs'

const departuresCache = new TimedCache({ defaultTtl: 1000 * 60 })

const host = 'connectv3.smrt.wwprojects.com'
const hashKey = 'q/t+NNAkQZNlq/aAD6PlexImwQTxwgT2MahfTa9XRLA='

const hawkKey = 'h42325aqx6krj5z2uzm5e8wwqr2wchk5xq704n1e'

let lineDestinations = {
  'East West Line': ['Pasir Ris', 'Tanah Merah', 'Changi Airport', 'Boon Lay', 'Joo Koon', 'Tuas Link'],
  'North South Line': ['Jurong East', 'Kranji', 'Ang Mo Kio', 'Marina Bay', 'Marina South Pier']
}

let depots = {
  'Bishan Depot': ['Kranji', 'Ang Mo Kio', 'Marina Bay', 'Marina South Pier'],
  'Ulu Pandan Depot': ['Jurong East'],
  'Ulu Pandan Depot': ['Boon Lay'],
  'Changi Depot': ['Pasir Ris', 'Tanah Merah', 'Changi Airport'],
  'Tuas Depot': ['Joo Koon', 'Tuas Link']
}

function genRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length)
}

function getBaseString(path, timestamp, method, hash, nonce) {
  return `hawk.1.header
${timestamp}
${nonce}
${method}
${path}
${host}
443
${hash}

`
}

function getMAC(baseString) {
  let hmac = crypto.createHmac('sha256', hawkKey)
  hmac.write(baseString)
  hmac.end()

  return Buffer.from(hmac.read()).toString('base64')
}

async function getDepartures(stationData) {
  let {codedStopName} = stationData

  if (departuresCache.get(codedStopName)) return departuresCache.get(codedStopName)

  let timestamp = (new Date() / 1000 | 0) + 700
  let nonce = genRandomString(12).toUpperCase()

  let {stopName} = stationData

  let path = `/smrt/api/train_arrival_time_by_id/?station=${encodeURI(stopName)}`
  let baseString = getBaseString(path, timestamp, 'GET', hashKey, nonce)
  let mac = getMAC(baseString)

  let headers = {
    'Connection': 'Keep-Alive',
    'User-Agent': 'SMRT Connect/3.0 Android/7.0',
    'Connection': 'Keep-Alive',
    'Content-Type': 'text/plain',
    'Referer': 'https://connectv3.smrt.wwprojects.com/smrt/',
    'Authorization': `Hawk id="ww-connectv3-android",mac="${mac}",hash="${hashKey}",ts="${timestamp}",nonce="${nonce}"`
  }

  let url = 'https://' + host + path
  let body = JSON.parse(await utils.request(url, {
    headers
  }))

  let departures = []

  body.results.forEach(platform => {
    let minToFirstTrain = platform.next_train_arr
    if (minToFirstTrain === 'Arr') minToFirstTrain = 0.5

    let minToNextTrain = platform.subseq_train_arr
    if (minToNextTrain === 'Arr') minToNextTrain = 0.5

    let platformNumber = platform.platform_ID.slice(-1)
    let isCCLPlatform = platform.platform_ID.length === 6 && platform.platform_ID[0] === 'C'
    let isTELPlatform = platform.platform_ID.length === 6 && platform.platform_ID[0] === 'T'

    let routeName
    if (isCCLPlatform) routeName = 'Circle Line'
    else if (isTELPlatform) routeName = 'Thomson-East Coast Line'
    else
      Object.keys(lineDestinations).forEach(line => {
        if (lineDestinations[line].includes(platform.next_train_destination) ||
            lineDestinations[line].includes(platform.subseq_train_destination))
          routeName = line
      })

    if (!routeName) routeName = 'no-line'

    let codedLineName = routeName.toLowerCase().replace(/[^\w\d ]/g, '-').replace(/  */g, '-').replace(/--+/g, '-')

    let firstTrain = {
      estimatedDepartureTime: utils.now().add(minToFirstTrain, 'minutes'),
      platform: platformNumber,
      isCCLPlatform,
      destination: platform.next_train_destination,
      routeName,
      codedLineName
    }

    let nextTrain = {
      estimatedDepartureTime: utils.now().add(minToNextTrain, 'minutes'),
      platform: platformNumber,
      isCCLPlatform,
      destination: platform.subseq_train_destination,
      routeName,
      codedLineName
    }

    departures.push(firstTrain)
    departures.push(nextTrain)
  })

  let trainsSeen = []

  departures = departures.filter(departure => {
    if (departure.destination === '') return false
    let id = departure.estimatedDepartureTime.format('HH:mm') + departure.routeName + departure.destination
    if (!trainsSeen.includes(id)) {
      trainsSeen.push(id)
      return true
    }
    return false
  })

  departures.sort((a, b) => a.estimatedDepartureTime - b.estimatedDepartureTime).map(departure => {
    if (departure.destination === stopName) departure.destination = 'Do not board' // ccl? gotta investigate but whoops wrong country
    if (departure.destination === 'Do not board') {
      departure.routeName = 'no-line'
      departure.codedLineName = 'no-line'
    }

    departure.destination = departure.destination.replace('(Interchange)', '').trim()

    let {routeName, destination} = departure
    if (routeName === 'no-line') {
      // if (departure.isCCLPlatform)
      //   departure.stopsAt = [stopName, 'Kim Chuan Depot']
      // else {
      //   let depot = 'Depot'
      //   Object.keys(depots).forEach(depotName => {
      //     if (depots[depotName].includes(stopName))
      //       depot = depotName
      //   })
      //   departure.stopsAt = [stopName, depot]
      // }

      return departure
    }

    // let lineData = lines.filter(line => line.routeName === routeName)[0]
    //
    // let lineStops = lineData.stops.map(stop => stop.stopName)
    //
    // let startingIndex = lineStops.indexOf(stopName)
    // let endingIndex = lineStops.indexOf(destination)
    //
    // if (startingIndex > endingIndex) {
    //   lineStops.reverse()
    //   startingIndex = lineStops.indexOf(stopName)
    //   endingIndex = lineStops.indexOf(destination)
    // }
    //
    // let stopsAt = lineStops.slice(startingIndex, endingIndex + 1)
    // departure.stopsAt = stopsAt

    return departure
  })

  departuresCache.put(codedStopName, departures)
  return departures
}

export default getDepartures
