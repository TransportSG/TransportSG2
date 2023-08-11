const DatabaseConnection = require('../../database/DatabaseConnection')
const ltaAPI = require('../../lta-api')
const utils = require('../../utils')
const config = require('../../config')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
  let services = database.getCollection('services')
  services.createIndex({
    fullService: 1,
    serviceNumber: 1,
    serviceVariant: 1,
    operator: 1,
    category: 1,
    direction: 1,
    originCode: 1,
    destinationCode: 1,
    loopingPoint: 1
  }, {name: 'service index', unique: 1})

  let data = await ltaAPI.paginatedRequest('/BusServices')

  let expandedData = data.map(busService => {
    let loopingPoint = utils.expandStopName(busService.LoopDesc)
    if (busService.ServiceNo === '34A')
      loopingPoint = ''
    if (busService.ServiceNo === '36' || busService.ServiceNo === '36A' || busService.ServiceNo === '36B')
      loopingPoint = 'Tomlinson Road'
    if (busService.ServiceNo === '62A')
      loopingPoint = ''
    if (busService.ServiceNo === '180')
      loopingPoint = 'Petir Road'
    if (busService.ServiceNo === '291')
      loopingPoint = ['Tampines Street 81', 'Tampines Street 32']
    if (busService.ServiceNo === '293')
      loopingPoint = ['Tampines Street 71', 'Tampines Avenue 7']
    if (busService.ServiceNo === '358')
      loopingPoint = ['Pasir Ris Drive 10', 'Pasir Ris Drive 4']
    if (busService.ServiceNo === '359')
      loopingPoint = ['Pasir Ris Street 71', 'Pasir Ris Street 11']
    if (busService.ServiceNo === '811')
      loopingPoint = ['Yishun Avenue 5', 'Yishun Avenue 1']
    if (busService.ServiceNo === '812')
      loopingPoint = ['Yishun Avenue 4', 'Yishun Avenue 3']
    if (busService.ServiceNo === '859')
      loopingPoint = 'Yishun Avenue 2'
    if (busService.ServiceNo === '911')
      loopingPoint = ['Woodlands Avenue 2', 'Woodlands Centre Road']
    if (busService.ServiceNo === '912')
      loopingPoint = ['Woodlands Avenue 7', 'Woodlands Centre Road']
    if (busService.ServiceNo === '913')
      loopingPoint = ['Woodlands Circle', 'Woodlands Avenue 3']
    if (busService.ServiceNo === '964')
      loopingPoint = 'Woodlands Link'
    if (busService.ServiceNo.startsWith('972'))
      loopingPoint = 'Orchard Road'
    if (busService.ServiceNo === '983')
      loopingPoint = {
        actual: 'Upper Bukit Timah Road',
        display: 'Jelebu Road'
      }

    if (busService.DestinationCode === '02089') // Pan Pacific Hotel
      busService.DestinationCode = '02099'

    if (busService.OriginCode === '02101') // After Singapore Flyer
      busService.OriginCode = '02099'

    if (busService.OriginCode === '46008') // Woodlands Temporary Interchange (Looping)
      busService.OriginCode = '46009'

    if (busService.DestinationCode === '46008') // Woodlands Temporary Interchange (Looping)
      busService.DestinationCode = '46009'

    if (busService.DestinationCode === '03218') // Opposite MAS Building
      busService.DestinationCode = '03239'

    if (busService.DestinationCode === '11389') // Block 46 (BNV Ter)
      busService.DestinationCode = '11379'

    return {
      mode: 'bus',
      fullService: busService.ServiceNo,
      serviceNumber: utils.getServiceNumber(busService.ServiceNo),
      serviceVariant: utils.getServiceVariant(busService.ServiceNo),
      operator: busService.Operator,
      category: busService.Category,
      direction: busService.Direction,
      originCode: busService.OriginCode,
      destinationCode: busService.DestinationCode,
      loopingPoint,
      frequency: {
        morningPeak: utils.extractFrequency(busService.AM_Peak_Freq),
        morningOffpeak: utils.extractFrequency(busService.AM_Offpeak_Freq),
        afternoonPeak: utils.extractFrequency(busService.PM_Peak_Freq),
        afternoonOffpeak: utils.extractFrequency(busService.PM_Offpeak_Freq)
      }
    }
  })

  await services.deleteDocuments({ mode: 'bus' })
  await services.bulkWrite(expandedData.map(busService => ({
    insertOne: {
      document: busService
    }
  })), {
    ordered: false
  })

  console.log('Completed loading in ' + expandedData.length + ' bus services')
  process.exit()
})
