$.ready(() => {
  $.inputTimeout($('#textbar'), query => {
    $.ajax({
      url: '/lookup',
      method: 'POST',
      data: { query }
    }, (err, status, content) => {
      $('#search-results').innerHTML = content
    })
  })
})
