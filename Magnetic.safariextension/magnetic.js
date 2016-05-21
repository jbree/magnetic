/**
 * use the contextmenu event to add a context menu item if a magnet link
 * has been clicked
 */
safari.application.addEventListener('contextmenu', function (event) {
  if(event.userInfo && event.userInfo.magnet) {
    event.contextMenu.appendContextMenuItem('sendMagnet', "Send Magnet to Transmission");
  }
}, false);

/**
 * handle sendMagnet command from contextual menu
 */
safari.application.addEventListener('command', function (event) {
  if(event.command === 'sendMagnet') {
    sendMagnetToServer(event.userInfo.magnet);
  }
});

/**
 * handle sendMagnet messages
 */
safari.application.addEventListener('message', function (event) {
  if(event.name === 'sendMagnet') {
    sendMagnetToServer(event.message.magnet);
  }
});

function sendMagnetToServer(magnetURL) {
  var auth = null;
  if(safari.extension.settings.authEnabled) {
    var username = safari.extension.settings.username;
    var password = safari.extension.secureSettings.password;
    auth = btoa(username + ':' + password);
  }
  sendRequest({
    url: magnetURL,
    server: safari.extension.settings.server,
    auth: auth,
    id: getSessionId(),
    retry: 3
  });
}

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
  if(config.auth) {
    req.setRequestHeader('Authorization', 'Basic ' + config.auth);
  }
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
