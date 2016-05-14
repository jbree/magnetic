safari.application.addEventListener('contextmenu', function (event) {
  console.log(event);
  if(event.userInfo && event.userInfo.magnet) {
    event.contextMenu.appendContextMenuItem('sendMagnet', "Send Magnet to Transmission");
    console.log(event.userInfo.magnet);
  }
}, false);
