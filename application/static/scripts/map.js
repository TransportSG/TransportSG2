mapboxgl.accessToken = 'pk.eyJ1IjoidW5pa2l0dHkiLCJhIjoiY2p6bnVvYWJ4MDdlNjNlbWsxMzJwcjh4OSJ9.qhftGWgQBDdGlaz3jVGvUQ'
let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v10',
  zoom: 11,
  center: [103.8332, 1.3559]
})

map.on('load', function () {
  $.ajax({
    method: 'POST'
  }, (err, status, data) => {
    let {routeShapes, bbox} = data
    routeShapes.forEach((direction, i) => {
      map.addLayer({
        id: `shape-path.${i}`,
        type: 'line',
        source: {
          type: 'geojson',
          data: direction.geometry
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
          },
          paint: {
          'line-color': '#3caa2e',
          'line-width': 7
          }
      })
      console.log([bbox.geometry.coordinates[0][0], bbox.geometry.coordinates[0][2]])
      map.fitBounds([bbox.geometry.coordinates[0][0], bbox.geometry.coordinates[0][2]])
    })
  })
})
