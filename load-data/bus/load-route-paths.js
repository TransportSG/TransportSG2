const path = require('path')
const utils = require('../../utils')

function l(p) {
  return path.join(__dirname, p)
}

async function main() {
  await utils.spawnProcess('node', [l('load-bus-route-paths.js')])
  await utils.spawnProcess('node', [l('load-remaining-route-paths-onemap.js')])
  await utils.spawnProcess('node', [l('load-remaining-route-paths-trim-parent.js')])
}

// If appears to be run as a script, run, otherwise expose as a module
if (process.argv[1] && process.argv[1] === __filename) main()
else module.exports = main
