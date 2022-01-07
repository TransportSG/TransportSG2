
const moment = require('moment')
require('moment-timezone')
moment.tz.setDefault('Asia/Singapore')
const request = require('request-promise')

const daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']

String.prototype.format = (function (i, safe, arg) {
  function format () {
    var str = this; var len = arguments.length + 1
    for (i = 0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg
      str = str.replace(RegExp('\\{' + (i - 1) + '\\}', 'g'), safe)
    }
    return str
  }
  format.native = String.prototype.format
  return format
}())

module.exports = {
  encodeName: name => name.toLowerCase().replace(/[^\w\d ]/g, '-').replace(/  */g, '-').replace(/--+/g, '-'),
  expandStopName: name => {
    if (name === name.toUpperCase() && name.includes(' ')) {
      name = module.exports.titleCase(name, anyLength=true)
    }

    let isLikelySaint = name.includes('Church') || name.includes('Convent')

    name = name.replace(/\/(\w)/, txt => {
      let match = txt.match(/\/(\w)/)
      return '/' + match[1].toUpperCase()
    })

    name = name.replace(/(\b)rd(\b)/gi, '$1Road$2')
    .replace(/Mt\.?(\b)/g, 'Mount$1')
    .replace(/Pde(\b)/g, 'Parade$1')
    .replace(/Cl(\b)/g, 'Close$1')
    .replace(/(\b)dr(\b)/gi, '$1Drive$2')
    .replace(/Ave?(\b)/g, 'Avenue$1')
    .replace(/Gr(\b)/g, 'Grove$1')
    .replace(/Ct(\b)/g, 'Court$1')
    .replace(/Cr(\b)/g, 'Cresent$1')
    .replace(/Hwy(\b)/g, 'Highway$1')
    .replace(/Fwy(\b)/g, 'Freeway$1')
    .replace(/Tce(\b)/g, 'Terrace$1')
    .replace(/Crst(\b)/g, 'Cresent$1')
    .replace(/(\b)pl(\b)/gi, 'Place$2')
    .replace(/Bl?vd(\b)/g, 'Boulevard$1')
    .replace(/Cres(\b)/g, 'Cresent$1')
    .replace(/Crse(\b)/g, 'Cresent$1')
    .replace(/Ctr(\b)/g, 'Centre$1')
    .replace(/Lt(\b)/g, 'Little$1')
    .replace(/Lwr(\b)/g, 'Lower$1')
    .replace(/Prom(\b)/g, 'Promenade$1')
    .replace(/Sch(\b)/g, 'School$1')
    .replace(/Pri? Sch(\b)/g, 'Primary School$1')
    .replace(/Pri? School(\b)/g, 'Primary School$1')
    .replace(/Sec Sch(\b)/g, 'Secondary School$1')
    .replace(/Sec School(\b)/g, 'Secondary School$1')
    .replace(/Esp(\b)/g, 'Esplande$1')
    .replace(/Cct(\b)/g, 'Circuit$1')
    .replace(/Mount\./g, 'Mount')
    .replace(/Sq(\b)/g, 'Square$1')
    .replace(/Sth(\b)/g, 'South$1')
    .replace(/Nth(\b)/g, 'North$1')
    .replace(/Gdn(s?)(\b)/g, 'Garden$1$2')
    .replace(/Cir(\b)/g, 'Circle$1')
    .replace(/Con(\b)/g, 'Concourse$1')
    .replace(/Gra(\b)/g, 'Grange$1')
    .replace(/Grn(\b)/g, 'Green$1')
    .replace(/Gtwy(\b)/g, 'Gateway$1')
    .replace(/Uni(\b)/g, 'University$1')
    .replace(/Plza(\b)/g, 'Plaza$1')
    .replace(/Psge(\b)/g, 'Passage$1')
    .replace(/Rdge(\b)/g, 'Ridge$1')
    .replace(/Strp(\b)/g, 'Strip$1')
    .replace(/Trk(\b)/g, 'Track$1')
    .replace(/Vsta(\b)/g, 'Vista$1')
    .replace(/Pkwy(\b)/g, 'Parkway$1')
    .replace(/(\b)opp(\b)/gi, '$1Opposite$2')
    .replace(/Aft(\b)/g, 'After$1')
    .replace(/Bef(\b)/g, 'Before$1')
    .replace(/(\b)blk(\b)/gi, '$1Block$2')
    .replace(/Ch(\b)/g, 'Church$1')
    .replace(/B(T|t)(\b)/g, 'Bukit$2')
    .replace(/Jln(\b)/g, 'Jalan$1')
    .replace(/P(K|k)(\b)/g, 'Park$2')
    .replace(/Tg(\b)/g, 'Tanjong$1')
    .replace(/Lib(\b)/g, 'Library$1')
    .replace(/Insp(\b)/g, 'Inspection$1')
    .replace(/Sub-Stn(\b)/g, 'Substation$1')
    .replace(/Warehse(\b)/g, 'Warehouse$1')
    .replace(/Hse(\b)/g, 'House$1')
    .replace(/Hme(\b)/g, 'Home$1')
    .replace(/Stn(\b)/g, 'Station$1')
    .replace(/Int(\b)/g, 'Interchange$1')
    .replace(/Checkpt(\b)/g, 'Checkpoint$1')
    .replace(/Pt(\b)/g, 'Point$1')
    .replace(/Twr(s?)(\b)/g, 'Tower$1$2')
    .replace(/LP (\b)/g, 'Lamp Post $1')
    .replace(/Lp (\b)/g, 'Lamp Post $1')
    .replace(/(\b)cc(\b)/gi, '$1Community Centre$2')
    .replace(/Comm(\b)/g, 'Community')
    .replace(/Swim Cplx(\b)/g, 'Swimming Complex$1')
    .replace(/Cplx(\b)/g, 'Complex$1')
    .replace(/Presby(\b)/g, 'Presbyterian$1')
    .replace(/Ctrl(\b)/g, 'Central$1')
    .replace(/CP(\b)/g, 'Carpark$1')
    .replace(/Poly(\b)/g, 'Polytechnic$1')
    .replace(/Veh(\b)/g, 'Vehicle$1')
    .replace(/Ind$/g, 'Industries')
    .replace(/Ind(\b)/g, 'Industrial$1')
    .replace(/Est(\b)/g, 'Estate$1')
    .replace(/W'(L|l)ands/g, 'Woodlands')
    .replace(/S'(G|g)oon/g, 'Serangoon')
    .replace(/S'(P|p)ore/g, 'Singapore')
    .replace(/A'(S|s)pace/g, 'Aerospace')
    .replace(/C'(W|w)ealth/g, 'Commonwealth')
    .replace(/Temp(\b)/g, 'Temporary$1')
    .replace(/Ter(\b)/g, 'Terminal$1')
    .replace(/Mqe(\b)/g, 'Mosque$1')
    .replace(/Hosp(\b)/g, 'Hopsital$1')
    .replace(/Cath(\b)/g, 'Cathedral$1')
    .replace(/Bldg(\b)/g, 'Building$1')
    .replace(/Natl(\b)/g, 'National$1')
    .replace(/Instn(\b)/g, 'Instution$1')
    .replace(/Trspt(\b)/g, 'Transport$1')
    .replace(/Mfg(\b)/g, 'Manufacturing$1')
    .replace(/Jnr(\b)/g, 'Junior$1')
    .replace(/Wk(\b)/g, 'Walk$1')
    .replace(/Terr(\b)/g, 'Terrace$1')
    .replace(/Ac(\b)/g, 'Academy$1')
    .replace(/Ters(\b)/g, 'Terminals$1')
    .replace(/Cp(\b)/g, 'Carpark$1')
    .replace(/Ably(\b)/g, 'Assembly$1')
    .replace(/Lor(\b)/g, 'Lorong$1')
    .replace(/Ptb(\d)(\b)/g, 'PTB$2$1')
    .replace(/Fty(\b)/g, 'Factory$1')
    .replace(/Pharma(\b)/g, 'Pharmaceutical$1')
    .replace(/Devt(\b)/g, 'Development$1')
    .replace(/Constrn(\b)/g, 'Construction$1')
    .replace(/(\b)fc(\b)/gi, '$1Foodcourt$2')
    .replace(/Sci(\b)/g, 'Science$1')
    .replace(/Reg(\b)/g, 'Regional')
    .replace(/Off(\b)/g, 'Office$1')
    .replace(/Tp(\b)/g, 'Temple$1')
    .replace(/Engrg(\b)/g, 'Engineering$1')
    .replace(/ST Aero(\b)/g, 'ST Aerospace$1')
    .replace(/Hts(\b)/g, 'Heights$1')
    .replace(/Intl(\b)/g, 'International$1')
    .replace(/Cck(\b)/g, 'Choa Chu Kang$1')
    .replace(/Bet Blks(\b)/g, 'Between Blocks$1')
    .replace(/Blks(\b)/g, 'Blocks$1')
    .replace(/Bet House(\b)/g, 'Between House$1')
    .replace(/No\. /g, 'Number ')
    .replace(/Mscp(\b)/g, 'Multi Story Carpark$1')
    .replace(/Mque(\b)/g, 'Mosque$1')
    .replace(/Upp(\b)/g, 'Upper$1')
    .replace(/Biz(\b)/g, 'Business$1')
    .replace(/Chr(\b)/g, 'Christian$1')
    .replace(/Christ(\b)/g, 'Christian$1')
    .replace(/Eng(\b)/g, 'English$1')
    .replace(/Assn(\b)/g, 'Association$1')
    .replace(/Sg(\b)/g, 'Sungei$1')
    .replace(/Kg(\b)/g, 'Kampong$1')
    .replace(/Cemy(\b)/g, 'Cemetery$1')
    .replace(/Svc(\b)/g, 'Service$1')
    .replace(/Slf(\b)/g, 'SLF$1')
    .replace(/Shun LI(\b)/g, 'Shun Li$1')
    .replace(/Trg(\b)/g, 'Training$1')
    .replace(/Mkt(\b)/g, 'Market$1')
    .replace('P/G', 'Playground')
    .replace('Holland V ', 'Holland Village ')
    .replace(/Mohd(\b)/, 'Mohammed$1')
    .replace(/Coll(\b)/, 'College$1')
    .replace(/Br(\b)/, 'Bridge$1')
    .replace(/Govt(\b)/, 'Government$1')
    .replace(/Blk(\d+)/, 'Block $1')
    .replace('(Pr)', '(Primary)')
    .replace('(Sec)', '(Secondary)')
    .replace(/Meth(\b)/g, 'Methodist$1')
    .replace(/KINS(\b)/g, 'Kins$1')
    .replace(/Rv(\b)/g, 'RV$1')
    .replace(/Adm(\b)/g, 'Administration$1')
    .replace(/Div(\b)/g, 'Divison$1')
    .replace(/(\w{4,}) St(\b)/, txt => {
      let match = txt.match(/(\w{4,}) St(\b)/)
      if (['Opposite', 'Before', 'After'].includes(match[1])) return txt
      if (isLikelySaint) return txt
      return match[1] + ' Street' + match[2]
    })
    .replace(/(\b)St(\b)/, '$1St.$1')
    .replace(/St. (\d*)/, 'Street $1')
    .replace('St..', 'St. ')
    .replace(/(\b)ST$/, '$1Street')
    .replace('Street.', 'Street')
    .replace(/(\w)'S/g, '$1\'s')
    .replace(/Acs(\b)/, 'ACS$1')
    .replace(/Bke(\b)/, 'BKE$1')
    .replace(/Sutd(\b)/, 'SUTD$1')
    .replace(/(\b)nuh(\b)/i, '$1NUH$2')
    .replace(/(\b)ppis(\b)/i, '$1PPIS$2')
    .replace(/(\b)chij(\b)/i, '$1CHIJ$2')
    .replace(/Msd(\b)/, 'MSD$1')
    .replace(/Nafa(\b)/, 'NAFA$1')
    .replace('Street Kinetics', 'ST Kinetics')
    .replace('NEWEST', 'NEWest')
    .replace('Met YMCA', 'Metropolitan YMCA')
    .replace('Kh Plaza', 'KH Plaza')
    .replace('Ite', 'ITE')
    .replace('Sbst', 'SBST')
    .replace('UWCSEA', 'United World College of South East Asia')
    .replace(/(\b)S Army(\b)/, '$1Salvation Army$2')
    .replace(/(\b)Vadapathira K(\b)/, '$1Vadapathira Kaliamman$2')
    .replace(/(\b)Snr(\b)/, '$1Senior$2')
    .replace(/(\b)Waseda S(\b)/, '$1Waseda Shibuya$2')
    .replace(/(\b)Princess E(\b)/, '$1Princess Elizabeth$2')
    .replace(/(\b)Hougang G\.(\b)/, '$1Hougang Green$2')
    .replace(/(\b)Shop Mall(\b)/, '$1Shopping Mall$2')

    if (name === name.toUpperCase() && name.length > 5) {
      name = name.slice(0, 1) + name.slice(1).toLowerCase()
    }

    if (name === 'Sp Sma') name = 'SP SMA'
    if (name === 'Hougang G. Shop Mall') name = 'Hougang Green Shopping Mall'

    return name.replace(/  +/g, ' ').trim()
  },
  pad: (data, length, filler='0') => Array(length).fill(filler).concat([...data.toString()]).slice(-length).join(''),
  getYYYYMMDD: time => {
    return time.format('YYYYMMDD')
  },
  getYYYYMMDDNow: () => module.exports.getYYYYMMDD(module.exports.now()),
  now: () => moment.tz('Asia/Singapore'),
  request: async (...options) => {
    let start = +new Date()
    let url = typeof options[0] === 'string' ? options[0] : options[0].url

    try {
      let body = await request(...options)

      let end = +new Date()
      let diff = end - start
      console.log(`${diff}ms ${url}`)

      return body
    } catch (e) {
      let end = +new Date()
      let diff = end - start
      console.log(`${diff}ms ${url}`)

      throw e
    }
  },
  getDistanceFromLatLon: (lat1, lon1, lat2, lon2) => {
    var R = 6371 // Radius of the earth in km
    var dLat = module.exports.deg2rad(lat2-lat1)
    var dLon = module.exports.deg2rad(lon2-lon1)
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(module.exports.deg2rad(lat1)) * Math.cos(module.exports.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    var d = R * c // Distance in km
    return Math.floor(d * 1000) // distance in m
  },
  deg2rad: deg => {
    return deg * (Math.PI/180)
  },
  titleCase: (str, anyLength=false, minLength=2) => str.replace(/\w\S*/g, txt => {
    if (txt.length > minLength || anyLength)
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    return txt
  }).replace(/\b\w/g, txt => {
    let punctuation = (txt.match(/(\b)/)||[,''])[1]
    let text = txt.slice(punctuation.length)
    if (text.length > minLength || anyLength)
      return punctuation + text.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()

    return txt
  }),
  getServiceNumber: service => {
    if (service.match(/^[A-Z]{2}/)) return service.slice(0, 2)
    return service.match(/(\d+)/)[1]
  },
  getServiceVariant: service => {
    if (service.match(/^[A-Z]{2}/)) return service.slice(2)
    return service.match(/([A-Za-z]?)$/)[1]
  },
  extractFrequency: minMax => {
    if (minMax && minMax !== '-') {
      if (!minMax.includes('-')) {
        return {min: parseInt(minMax), max: parseInt(minMax)}
      }

      let parts = minMax.replace(/ /g, '').split('-')

      return {min: parseInt(parts[0]), max: parseInt(parts[1])}
    } else return {min: '-', max: '-'}
  },
  prettyTimeToArrival: time => {
    const timeDifference = moment.utc(time.diff(module.exports.now()))
    let prettyTime

    if (+timeDifference <= 60000) prettyTime = 'Now'
    else {
      let minutesToDeparture = timeDifference.get('hours') * 60 + timeDifference.get('minutes')
      prettyTime = minutesToDeparture + ' m'
    }

    return prettyTime
  }
}
