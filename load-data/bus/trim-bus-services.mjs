import DatabaseConnection from '../../database/DatabaseConnection.js'
import config from '../../config.json' with { type: 'json' }

const database = new DatabaseConnection(config.databaseURL, config.databaseName)

database.connect({
  poolSize: 100
}, async err => {
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
})
