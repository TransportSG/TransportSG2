const csvParse = require('csv-parse')
const fs = require('fs')
const async = require('async')
const utils = require('../utils')
const DatabaseConnection = require('../database/DatabaseConnection')
const config = require('../config')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

let operator = process.argv[2]
let fileData = fs.readFileSync('data/' + operator + '.csv').toString()
let header = 'id,checksum,make,model,bodywork,operator,vin,lifespanExpiry,roadTaxExpiry,livery,notes,depot,service,batch,gearbox,eds,chair,door,aircon,advertisement,registrationDate\n'
fileData = header + fileData.slice(fileData.indexOf('\n') + 1)

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
      await buses.insertDocument(busData)
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
