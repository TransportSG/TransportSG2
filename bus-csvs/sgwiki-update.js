const async = require('async')
const utils = require('../utils')
const DatabaseConnection = require('../database/DatabaseConnection')
const config = require('../config')
const cheerio = require('cheerio')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

let busesUpdated = 0
let basePage = 'https://sgwiki.com/wiki/Bus_Deployments'

async function getLinks() {
  let data = await utils.request(basePage)

  let $ = cheerio.load(data)

  let tables = Array.from($('table.toccolours'))

  return tables.map(table => {
    let rows = Array.from($('tr', table)).slice(1)
    return rows.map(row => {
      let parts = Array.from($('td', row))
      return 'https://sgwiki.com' + $('a', parts[0]).attr('href')
    })
  }).reduce((a, e) => a.concat(e), [])
  .filter((e, i, a) => a.indexOf(e) === i)
}

async function fetchURL(url, buses) {
  let data = await utils.request(url, {
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

  let urls = await getLinks()

  await async.forEachOf(urls, async (u, i) => {
    await new Promise(r => setTimeout(r, i * 500))
    await fetchURL(u, buses)
  })

  console.log('completed updating bus data - ' + busesUpdated + ' buses')
  process.exit()
})
