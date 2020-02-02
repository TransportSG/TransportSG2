const {ltaAccountKey} = require('./config.json')
const utils = require('./utils')

async function makeRequest(url) {
  let data = await utils.request({
    url: 'http://datamall2.mytransport.sg/ltaodataservice' + url,
    headers: {
      AccountKey: ltaAccountKey,
      Accept: 'application/json'
    }
  })

  let parsed = JSON.parse(data)

  return parsed.value || parsed.Services
}

async function paginatedRequest(url, limit=Infinity, skip=0) {
  let completedData = []

  while (true) {
    let data = await makeRequest(url + '?$skip=' + skip)
    if (data.length === 0 || (skip += 500) > limit) break
    completedData = completedData.concat(data)
  }

  return completedData
}

module.exports = makeRequest
module.exports.paginatedRequest = paginatedRequest
