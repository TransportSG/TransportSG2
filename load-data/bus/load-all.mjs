import path from 'path'
import utils from '../../utils.js'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function l(p) {
  return path.join(__dirname, p)
}

async function main() {
  await utils.spawnProcess('node', [l('load-bus-stops.mjs')])
  await utils.spawnProcess('node', [l('load-bus-services.mjs')])
  await utils.spawnProcess('node', [l('load-bus-service-stops.mjs')])
  await utils.spawnProcess('node', [l('trim-bus-services.mjs')])
  await utils.spawnProcess('node', [l('load-bus-service-loop-points.mjs')])
}

main()