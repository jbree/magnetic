var magneticInject = (function () {
  var isOpen = false;
  var popup;
  var magnetMatch = /^(magnet:(?:[\?]|[\/\/]).*)/g;
  (function injectPopup() {
    popup = document.createElement('div');
    popup.className = 'magnetic';
    popup.id = 'wrapper';
    popup.innerHTML =
    '<div id="notch"></div>' +
    '<img src="' + safari.extension.baseURI + 'Icon-128.png">' +
    '<span id="links">' +
    '  <p><a href="" id="magnetic-plugin-enabled">Send to Server</a></p>' +
    '  <p><a href="" id="magnetic-plugin-disabled">Download Locally</a></p>' +
    '</span>';
  }());
  /**
   * determine if an anchor with a magnet URL was clicked.
   * if so, pass the magnet URL to the extension
   */
  document.addEventListener('contextmenu', function (event) {
    var target = findAnchorNode(event.target);

    if(target) {
      // match strings beginning with `magnet:?` or `magnet://`
      var url = target.href.match(magnetMatch);
      if(url) {
        // set context info for global extension to grab magnet url
        safari.self.tab.setContextMenuEventUserInfo(event, {magnet:url[0]});
      }
    }
  });


  /**
   * hijack click events so we can:
   * 1) open the popup when a magnet link is clicked
   * 2) close the popup when outside the panel is clicked
   * 3) handle popup link clicks
   */
  document.addEventListener('click', function (event) {
    // close the popup if the user clicks outside of it
    if(isOpen && !isRelative(popup, event.target)) {
      popup.style.visibility = "hidden";
      isOpen = false;
    }

    var target = findAnchorNode(event.target);
    // if the click is on an anchor node
    if(target) {
      // match strings beginning with `magnet:?` or `magnet://`
      var url = target.href.match(magnetMatch);

      // if the url is a magnet
      if(url) {
        if(target.id === 'magnetic-plugin-disabled') {

          console.log('download the magnet normally');
        } else if (target.id === 'magnetic-plugin-enabled') {
          // send this to the extension to handle
          console.log('send magnet to the extension');
          safari.self.tab.dispatchMessage('sendMagnet',{magnet:url[0]});
          event.preventDefault();

        } else {
          // create the popup links
          // popup = document.getElementById('wrapper');
          target.parentElement.appendChild(popup);
          wrapper.style.left = (event.clientX - 40 + document.body.scrollLeft + document.documentElement.scrollLeft) + 'px';
          wrapper.style.top = (event.clientY + 24 + document.body.scrollTop + document.documentElement.scrollTop) + 'px';
          wrapper.style.visibility = "visible";
          isOpen = true;
          console.log(event);
          var nativeLink = document.getElementById('magnetic-plugin-disabled');
          var serverLink = document.getElementById('magnetic-plugin-enabled');
          nativeLink.href = url;
          serverLink.href = url;

          // hijack the click so the link isn't handled by
          // local BT client
          event.preventDefault();
        }

        // console.log(url);
      }
    }
  });

  /**
   * given a DOM element, return the first 'A' anchor tag in its
   * heirarchy, or null if one doesn't exist
   *
   * @param {DOMElement} element the element to start searching from
   */
  function findAnchorNode (element) {
    if(element.nodeName === 'A') {
      return element;
    } else if(element.parentElement.nodeName === 'BODY') {
      return null;
    } else {
      return findAnchorNode(element.parentElement);
    }
  }

  /**
   * determine if one DOM element is an ancestor of another
   *
   * @param {DOMElement} ancestor
   * @param {DOMElement} descendant
   * @return true if ancestor is equal to or is an ancestor of descendant,
   * false otherwise, and false if either parameters are falsy
   */
  function isRelative(ancestor, descendant) {
    if(descendant && ancestor) {
      if(ancestor === descendant) {
        return true;
      } else {
        return isRelative(ancestor, descendant.parentElement);
      }
    }
    return false;
  }
}() );
