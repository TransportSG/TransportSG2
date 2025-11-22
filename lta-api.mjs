import config from './config.json' with { type: 'json' }
import utils from './utils.mjs'

const { ltaAccountKey } = config

async function makeRequest(url) {
  let data = await utils.request('https://datamall2.mytransport.sg/ltaodataservice' + url, {
    headers: {
      AccountKey: ltaAccountKey,
      Accept: 'application/json'
    }
  })

  let parsed = JSON.parse(data)

  return parsed.value || parsed.Services
}

export async function paginatedRequest(url, limit=Infinity, skip=0) {
  let completedData = []

  while (true) {
    let data = await makeRequest(url + '?$skip=' + skip)
    if (data.length === 0 || (skip += 500) > limit) break
    completedData = completedData.concat(data)
  }

  return completedData
}

export default makeRequest
