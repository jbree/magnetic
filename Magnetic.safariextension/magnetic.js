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
      id: getSessionId(),
      retry: 3
    });
  }
});

// get the X-Transmission-Session-Id in user settings.
function setSessionId(id) {
  safari.extension.settings.sessionId = id;
}
// get the X-Transmission-Session-Id stored in the user settings.
function getSessionId() {
  return safari.extension.settings.sessionId;
}

function sendRequest(config) {
  var error = false;
  var rpc = {
    "method": "torrent-add",
    "arguments": {
      "filename": config.url
    },
  };
  var req = new XMLHttpRequest();
  req.open('POST', config.server, true);
  req.setRequestHeader('X-Transmission-Session-Id', config.id);
  req.addEventListener('load', function () {
    if(req.status === 409) {
      // 409 means we have the wrong session id. store it in settings and retry.
      console.log('Magnetic: received new session id');
      setSessionId(req.getResponseHeader('X-Transmission-Session-Id'));
      config.id = getSessionId();

      if(--config.retry) {
        console.log('Magnetic: resending request');
        sendRequest(config);
      } else {
        console.log('Magnetic: giving up after 3 attempts');
      }
    } else if(req.status === 200) {
      var res = JSON.parse(req.response);
      console.log('Magnetic: Server response \'' + res.result + '\'');
    }
  });
  req.addEventListener('error', function () {
    console.log('Magnetic: error');
  });

  req.send(JSON.stringify(rpc));
}
