import path from 'path'
import utils from '../utils.js'
import url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function l(p) {
  return path.join(__dirname, p)
}

async function main() {
  await utils.spawnProcess('node', [l('bus/load-all.mjs')])
  await utils.spawnProcess('node', [l('mrt/load-stations.mjs')])
}

main()