const async = require('async')
const utils = require('../utils')
const fs = require('fs')
const path = require('path')

let toDownload = {
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=819371872&single=true&output=csv": "SBS",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=2137214531&single=true&output=csv": "SMB",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1503277849&single=true&output=csv": "SG",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4Rt5p8Gq6HUWmtNkWkqYl0jkGxrEtCh9li2ibacMwLDJ0GpvinwnRayddrf8zJMXMuYH1zpPH_dPZ/pub?gid=1534016276&single=true&output=csv": "TIB",

  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1276928138&single=true&output=csv": "PA",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1216385463&single=true&output=csv": "PC",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1415588182&single=true&output=csv": "CB",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1118081745&single=true&output=csv": "PD",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1885202379&single=true&output=csv": "PH",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1531514622&single=true&output=csv": "PZ",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=199506525&single=true&output=csv": "SH",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1649578794&single=true&output=csv": "RU",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=901630868&single=true&output=csv": "RD",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=167450199&single=true&output=csv": "WB",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=658385261&single=true&output=csv": "WC",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=1918182098&single=true&output=csv": "YN",
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTG--QjuvdDF8gwuoz9JRkRnGZ3Scn9_WGXrs12xjoHSkNAiK_hZRE5MdFq_riGKCF2uKOLKY0VPN_P/pub?gid=760284212&single=true&output=csv": "XD",
}

fs.mkdir(path.join(__dirname, 'data'), () => {
  async.forEachLimit(Object.keys(toDownload), 5, async url => {
    let filename = toDownload[url]
    let data = await utils.request(url, { timeout: 1000 * 30 })
    await new Promise(resolve => {
      fs.writeFile(path.join(__dirname, 'data', filename + '.csv'), data, resolve)
    })
  })
})