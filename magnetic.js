document.addEventListener('DOMContentLoaded', function(event) {
  var button = document.getElementById('add');
  button.addEventListener('click', function() {
    var magnet = document.getElementById('magnet');
    var url = magnet.value;

    console.log(url);

    sendRequest({
      url: url,
      server: "http://synk.local:9091/transmission/rpc",
      id: '',
      retry: 3
    });
  });

  function sendRequest(config) {
    var error = false;
    var rpc = {
      "method": "torrent-add",
      "arguments": {
        "filename": config.url
      },
    };
    var req = new XMLHttpRequest();
    //TODO cache this value
    req.open('POST', config.server, true);
    req.setRequestHeader('X-Transmission-Session-Id', config.id);
    req.addEventListener('load', function () {
      var status = document.getElementById('status');
      status.innerText = req.responseText;

      if(req.status == 409) {
        console.log('Magnetic: received new session id');
        config.id = req.getResponseHeader('X-Transmission-Session-Id');
        if(--config.retry) {
          console.log('Magnetic: resending request');
          sendRequest(config);
        } else {
          console.log('Magnetic: giving up after 3 attempts');
        }
      }
    });
    req.addEventListener('error', function () {
      console.log('Magnetic: error');
    });

    req.send(JSON.stringify(rpc));
  }
});
