const path = require('path')
const utils = require('../../utils')

function l(p) {
  return path.join(__dirname, p)
}

async function main() {
  await utils.spawnProcess('node', [l('load-bus-stops.js')])
  await utils.spawnProcess('node', [l('load-bus-services.js')])
  await utils.spawnProcess('node', [l('load-bus-service-stops.js')])
  await utils.spawnProcess('node', [l('trim-bus-services.js')])
  await utils.spawnProcess('node', [l('load-bus-service-loop-points.js')])
}

// If appears to be run as a script, run, otherwise expose as a module
if (process.argv[1] && process.argv[1] === __filename) main()
else module.exports = main
