import { MongoDatabaseConnection } from '@transportme/database'
import config from '../../config.json' with { type: 'json' }

const database = new MongoDatabaseConnection(config.databaseURL, config.databaseName)

await database.connect()

let services = database.getCollection('services')

let allGWServices = await services.distinct('serviceNumber', {
  serviceVariant: {
    $in: ['G', 'W']
  },
  fullService: {
    $not: {
      $in: ["67W"]
    }
  }
})

await services.deleteDocuments({
  fullService: {
    $in: allGWServices
  }
})

console.log('Completed trimming ' + allGWServices.length + ' GW bus services')
process.exit()