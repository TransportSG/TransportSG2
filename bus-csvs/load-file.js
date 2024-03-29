const csvParse = require('csv-parse')
const fs = require('fs')
const async = require('async')
const path = require('path')
const utils = require('../utils')
const DatabaseConnection = require('../database/DatabaseConnection')
const config = require('../config')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

let publicBusRegos = ['TIB', 'SBS', 'SMB', 'SG']

let operator = process.argv[2]
let fileData = fs.readFileSync(path.join(__dirname, 'data', operator + '.csv')).toString()
let header = 'id,checksum,make,model,bodywork,operator,vin,lifespanExpiry,roadTaxExpiry,livery,notes,depot,service,batch,gearbox,eds,chair,door,aircon,advertisement,registrationDate\n'
let privateHeader = 'id,checksum,make,model,bodywork,operator,vin,lifespanExpiry,livery,notes,depot,service,batch,gearbox,eds,chair,door,aircon,advertisement,registrationDate\n'

fileData = (publicBusRegos.includes(operator) ? header : privateHeader) + fileData.slice(fileData.indexOf('\n') + 1)

database.connect({
  poolSize: 100
}, async err => {
  let buses = database.getCollection('buses')

  buses.createIndex({
    regoPrefix: 1,
    id: 1
  }, {name: 'rego parts index', unique: true})
  buses.createIndex({
    rego: 1
  }, {name: 'rego index', unique: true})
  buses.createIndex({
    id: 1
  }, {name: 'id index'})
  buses.createIndex({
    depot: 1,
    service: 1
  }, {name: 'deployment index'})
  buses.createIndex({
    vin: 1
  }, {name: 'vin index'})
  buses.createIndex({
    operator: 1
  }, {name: 'operator index'})
  buses.createIndex({
    advertisement: 1
  }, {name: 'advertisement index'})

  async function updateBusData(busData) {
    let search = {
      rego: busData.rego
    }

    let status
    let {service} = busData
    if (service.includes('(R)')) {
      busData.service = service.replace('(R)', '').trim()
      status = 'Retired'
    } else if (service.includes('(L)')) {
      busData.service = service.replace('(L)', '').trim()
      status = 'Layup'
    } else if (service.includes('(A)')) {
      busData.service = service.replace('(A)', '').trim()
      status = 'Accident'
    } else if (busData.operator === 'LTA Storage') {
      status = 'In Storage'
    } else if (service === 'Not Registered') {
      busData.depot = busData.service = ''
      status = 'Unregistered'
    }

    busData.status = status

    let databaseBus = await buses.findDocument(search)

    if (databaseBus) {
      if (databaseBus.advertisement && !busData.advertisement) {
        delete busData.advertisement
      }
      if (databaseBus.depot && !busData.depot) {
        delete busData.depot
      }
      if (databaseBus.service && !busData.service) {
        delete busData.service
      }
      await buses.updateDocument(search, {
        $set: busData
      })
    } else {
      await buses.createDocument(busData)
    }
  }

  async function parseBusData(busData) {
    if (busData.make === '') return
    busData = {
      regoPrefix: operator,
      rego: operator + busData.id + busData.checksum,
      ...busData
    }

    await updateBusData(busData)
  }

  let csvData = await new Promise(r => csvParse(fileData, {
    columns: true,
    trim: true,
    skip_empty_lines: true
  }, (err, o) => r(o)))

  await async.forEach(csvData, async busData => {
    await parseBusData(busData)
  })

  console.log('completed loading bus data - ' + csvData.length + ' lines')
  process.exit()
})
