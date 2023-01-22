const async = require('async')
const path = require('path')
const utils = require('../utils')

function l(p) {
  return path.join(__dirname, p)
}

let toLoad = [ "SBS", "SMB", "SG", "TIB", "PA", "PC", "CB", "PD", "PH", "PZ", "SH", "RU", "RD", "WB", "WC", "YN", "XD" ]

async function main() {
  await utils.spawnProcess('node', [l('update-data.js')])
  await async.forEachSeries(toLoad, async operator => {
    await utils.spawnProcess('node', [l('load-file.js'), operator])
  })

  await utils.spawnProcess('node', [l('sgwiki-update.js')])
}

// If appears to be run as a script, run, otherwise expose as a module
if (process.argv[1] && process.argv[1] === __filename) main()
else module.exports = main
