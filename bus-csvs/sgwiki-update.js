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
      service = service || ''

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

  await async.forEachOfLimit(urls, 1, async (u, i) => {
    await new Promise(r => setTimeout(r, i * 500))
    await fetchURL(u, buses)
  })

  console.log('completed updating bus data - ' + busesUpdated + ' buses')
  process.exit()
})

let urls = [
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=261419',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=265883',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=270532',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=273759',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=287111',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=296214',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=309808',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=322064',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=322740',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=327194',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=332570',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=341439',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=346225',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=356161',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_3)&oldid=367114',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=254893',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=262133',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=264605',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=267371',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=273259',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=277051',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=281494',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=293113',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=300328',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=306578',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=325152',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=328693',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_2)&oldid=342741',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_1)&oldid=234862',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_1)&oldid=231946',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_1)&oldid=264395',
  'https://sgwiki.com/index.php?title=Volvo_Olympian_3-Axle_(Batch_1)&oldid=267264',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=271836',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=285541',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=317887',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=322598',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=327475',
  'https://sgwiki.com/index.php?title=Volvo_B10M_Mark_IV_(DM3500)&oldid=433170',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405_(Hispano_CAC)&oldid=254581',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405_(Hispano_CAC)&oldid=259287',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405_(Hispano_CAC)&oldid=280402',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405_(Hispano_CAC)&oldid=296150',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405G_(Hispano_Habit)&oldid=417128',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405G_(Hispano_Habit)&oldid=431837',
  'https://sgwiki.com/index.php?title=Mercedes-Benz_O405G_(Hispano_Habit)&oldid=431837'
]

// let urls = [
//   'https://sgwiki.com/wiki/BYD_C6',
//   'https://sgwiki.com/wiki/Yutong_ZK6128BEVG',
//   'https://sgwiki.com/wiki/BYD_K9_(Gemilang)',
//   'https://sgwiki.com/wiki/Volvo_B5LH',
//   'https://sgwiki.com/wiki/Volvo_B8L_(Wright_Eclipse_Gemini_3)',
//   'https://sgwiki.com/wiki/Volvo_B9TL_(CDGE)',
//   'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_1)',
//   'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_2)',
//   'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_3)',
//   'https://sgwiki.com/wiki/Volvo_B9TL_(Wright_Eclipse_Gemini_2)_(Batch_4)',
//   'https://sgwiki.com/wiki/Volvo_B10TL_(Volgren)',
//   'https://sgwiki.com/wiki/Volvo_B10TL_(CDGE)',
//   'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_SMRT)',
//   'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_1)',
//   'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_2)',
//   'https://sgwiki.com/wiki/Mercedes-Benz_O530_Citaro_(Batch_3)',
//   'https://sgwiki.com/wiki/MAN_NL323F_(Batch_1)',
//   'https://sgwiki.com/wiki/MAN_NL323F_(Batch_2)',
//   'https://sgwiki.com/wiki/MAN_NL323F_(Batch_3)',
//   'https://sgwiki.com/wiki/MAN_NL323F_(Batch_4)',
//   'https://sgwiki.com/wiki/MAN_ND323F_(Batch_1)',
//   'https://sgwiki.com/wiki/MAN_ND323F_(Batch_2)',
//   'https://sgwiki.com/wiki/MAN_ND323F_(Batch_3)',
//   'https://sgwiki.com/wiki/MAN_ND323F_(Batch_4)',
//   'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_1)',
//   'https://sgwiki.com/wiki/Scania_K230UB_(Euro_IV_Batch_2)',
//   'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_1)',
//   'https://sgwiki.com/wiki/Scania_K230UB_(Euro_V_Batch_2)',
//   'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_1)',
//   'https://sgwiki.com/wiki/Alexander_Dennis_Enviro500_(Batch_2)',
//   'https://sgwiki.com/wiki/MAN_NG363F',
//   'https://sgwiki.com/wiki/Mercedes-Benz_OC500LE',
//   'https://sgwiki.com/wiki/Mercedes-Benz_O405G_(Hispano_Habit)'
// ]
