// use the contextmenu event to add a context menu item if a magnet link
// has been clicked
safari.application.addEventListener('contextmenu', function (event) {
  if(event.userInfo && event.userInfo.magnet) {
    event.contextMenu.appendContextMenuItem('sendMagnet', "Send Magnet to Transmission");
  }
}, false);

// when the sendMagnet command is received, send the request to the
// user's specified transmission server.
safari.application.addEventListener('command', function (event) {
  if(event.command === 'sendMagnet') {
    sendRequest({
      url: event.userInfo.magnet,
      server: safari.extension.settings.server,
      id: '',
      retry: 3
    });
  }
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
    if(req.status === 409) {
      console.log('Magnetic: received new session id');
      config.id = req.getResponseHeader('X-Transmission-Session-Id');
      if(--config.retry) {
        console.log('Magnetic: resending request');
        sendRequest(config);
      } else {
        console.log('Magnetic: giving up after 3 attempts');
      }
    }
    if(req.status === 200) {
      var res = JSON.parse(req.response);
      console.log('Magnetic: Server response \'' + res.result + '\'');
    }
  });
  req.addEventListener('error', function () {
    console.log('Magnetic: error');
  });

  req.send(JSON.stringify(rpc));
}
