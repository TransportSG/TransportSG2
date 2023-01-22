const express = require('express')
const router = new express.Router()
const routePathUpdate = require('../../load-data/bus/load-route-paths')
const busDataUpdate = require('../../bus-csvs/load-all')
const path = require('path')
const utils = require('../../utils')

function l(p) {
  return path.join(__dirname, '../../load-data', p)
}

router.get('/trigger-bus-stop-update', async (req, res) => {
  try {
    await utils.spawnProcess('node', [l('bus/load-bus-stops.js')])
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

router.get('/trigger-bus-service-update', async (req, res) => {
  try {
    await utils.spawnProcess('node', [l('bus/load-bus-services.js')])
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

router.get('/trigger-bus-service-stops-update', async (req, res) => {
  try {
    await utils.spawnProcess('node', [l('bus/load-bus-service-stops.js')])
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

router.get('/trigger-bus-service-cleanup', async (req, res) => {
  try {
    await utils.spawnProcess('node', [l('bus/trim-bus-services.js')])
    await utils.spawnProcess('node', [l('bus/load-bus-service-loop-points.js')])
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

router.get('/trigger-route-path-update', async (req, res) => {
  try {
    await routePathUpdate()
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

router.get('/trigger-bus-data-update', async (req, res) => {
  try {
    await busDataUpdate()
    res.json({
      status: 'ok'
    })
  } catch (e) {
    res.json({
      status: 'error',
      message: e.toString()
    })
  }
})

module.exports = router
