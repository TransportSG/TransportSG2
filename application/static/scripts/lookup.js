function search(query) {
  $('#loading').style = 'display: block;'
  $.ajax({
    url: '/lookup',
    method: 'POST',
    data: { query }
  }, (err, status, content) => {
    $('#loading').style = 'display: none;'
    $('#search-results').innerHTML = content
  })
}

$.ready(() => {
  $.inputTimeout($('#textbar'), search)

  if ($('#textbar').value) search($('#textbar').value)
})

setTimeout(() => {
  if ($('#textbar') && $('#textbar').value) search($('#textbar').value)
}, 10)
