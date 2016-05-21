# Magnetic
A Safari extension to send magnet links to a Transmission RPC server

## Setup
Go to the [latest release](https://github.com/jbree/magnetic/releases) and
download the Magnetic.safariextz file. Double click to install it in Safari.

Once installed, go to Safari > Preferences > Extensions > Magnetic, and enter
the URL of your Transmission RPC server. If you're running the Transmission Web
client, it's probably already running and you don't even realize it. It looks
something like: `http://server.local:9091/transmission/rpc`.

## Usage
Magnetic will detect when you right-click or control-click on a magnet link and
offer you a menu item to send the magnet to your server.

A regular click will give you a popup option to handle the magnet
locally or send it to your specified server.

## Links
+ [Transmission](https://www.transmissionbt.com)
+ [Safari Extensions Development Guide](https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/Introduction/Introduction.html)
