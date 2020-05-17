const express = require('express')
const utils = require('../../utils')
const router = new express.Router()
const moment = require('moment')

let operatorCSS = {
  'SBS Transit': 'sbst',
  'SMRT Buses': 'smrt',
  'Tower Transit Singapore': 'ttsg',
  'Go Ahead Singapore': 'gasg',
  'LTA Storage': 'lta',
  'Trans Island Buses': 'tibs',
  'Singapore Bus Services': 'sbs',
  'Sentosa': 'sentosa',
}

async function findBusesByRegoNumber(number, db) {
  let buses = db.getCollection('buses')

  let busMatches = await buses.findDocuments({
    id: number
  }).toArray()

  return busMatches
}

function applyDeregDateInfo(bus) {
  if (!bus.lifespanExpiry) return bus
  let deregDate = moment.tz(bus.lifespanExpiry, 'DDMMMYYYY', 'Asia/Singapore')
  deregDate.add(1, 'day')
  let now = utils.now()

  let msDiff = deregDate.diff(now)

  let difference = moment.duration(msDiff)

  let years = Math.abs(difference.years())
  let months = Math.abs(difference.months())
  let days = Math.abs(difference.days())

  let joining = []
  if (years) joining = joining.concat(years + ' years')
  if (months) joining = joining.concat(months + ' months')
  if (days) joining = joining.concat(days + ' days')

  bus.timeToDereg = joining.join(', ')

  if (msDiff === 0) bus.timeToDereg = 'Today'

  if (difference.years() < 0) bus.timeToDereg += ' ago'
  return bus
}

router.get('/', async (req, res) => {
  res.render('lookup/index')
})

router.post('/', async (req, res) => {
  let busMatches = await findBusesByRegoNumber(req.body.query, res.db)
  busMatches = busMatches.map(applyDeregDateInfo)

  res.render('lookup/results', {
    buses: busMatches,
    operatorCSS
  })
})

module.exports = router
