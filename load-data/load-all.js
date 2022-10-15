const path = require('path')
const utils = require('../utils')

function l(p) {
  return path.join(__dirname, p)
}

async function main() {
  await utils.spawnProcess('node', [l('bus/load-all.js')])
  await utils.spawnProcess('node', [l('mrt/load-stations.js')])
}

// If appears to be run as a script, run, otherwise expose as a module
if (process.argv[1] && process.argv[1] === __filename) main()
else module.exports = main
