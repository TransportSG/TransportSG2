const async = require('async')
const utils = require('../utils')
const DatabaseConnection = require('../database/DatabaseConnection')
const config = require('../config')
const cheerio = require('cheerio')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

let busesUpdated = 0

async function fetchURL(url, buses) {
  let data = await utils.request({
    url,
    method: 'POST'
  })

  let $ = cheerio.load(data)

  let tables = Array.from($('table.toccolours'))
  await async.forEach(tables, async table => {
    let rows = Array.from($('tr', table)).slice(1)
    let lastAdvert = 'N/A'

    await async.forEach(rows, async row => {
      let parts = Array.from($('td', row))
      let rego = $(parts[0]).text().trim()
      let deployment = $(parts[1]).text().trim()
      let advert = $(parts[2]).text().trim()
      if (!advert) advert = lastAdvert
      else lastAdvert = advert

      let [depot, service] = deployment.split(' ')

      let update = {
        rego,
        depot,
        service,
        advertisement: advert
      }

      await buses.updateDocument({
        rego
      }, {
        $set: update
      })

      busesUpdated++
    })
  })
}

database.connect({
  poolSize: 100
}, async err => {
  let buses = database.getCollection('buses')

  await async.forEachOf(urls, async (u, i) => {
    await new Promise(r => setTimeout(r, i * 500))
    await fetchURL(u, buses)
  })

  console.log('completed updating bus data - ' + busesUpdated + ' buses')
  process.exit()
})


let urls = [
  'https://sgwiki.com/wiki/BYD_C6'
  'https://sgwiki.com/wiki/Yutong_ZK6128BEVG'
  'https://sgwiki.com/wiki/BYD_K9_(Gemilang)',
  'https://sgwiki.com/wiki/Volvo_B5LH',
  'https://sgwiki.com/wiki/Volvo_B8L_(Wright_Eclipse_Gemini_3)',
  'https://sgwiki.com/wiki/Volvo_B9TL_(CDGE)',
  'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_1)',
  'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_2)',
  'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_3)',
  'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_4)',
  'https://sgwiki.com/wiki/Volvo_B10TL_(Volgren)',
  'https://sgwiki.com/wiki/Volvo_B10TL_(CDGE)',
  'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_SMRT)',
  'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_1)',
  'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_2)',
  'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_3)',
  'https://sgwiki.com/wiki/MAN_NL323F_(Batch_1)',
  'https://sgwiki.com/wiki/MAN_NL323F_(Batch_2)',
  'https://sgwiki.com/wiki/MAN_NL323F_(Batch_3)',
  'https://sgwiki.com/wiki/MAN_NL323F_(Batch_4)',
  'https://sgwiki.com/wiki/MAN_ND323F_(Batch_1)',
  'https://sgwiki.com/wiki/MAN_ND323F_(Batch_2)',
  'https://sgwiki.com/wiki/MAN_ND323F_(Batch_3)',
  'https://sgwiki.com/wiki/MAN_ND323F_(Batch_4)',
  'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_1)',
  'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_2)',
  'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_1)',
  'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_2)',
  'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_1)',
  'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_2)',
  'https://sgwiki.com/wiki/MAN_NG363F',
  'https://sgwiki.com/wiki/Mercedes-Benz_OC500LE',
  'https://sgwiki.com/wiki/Mercedes-Benz_O405G_(Hispano_Habit)'
]
