var magneticInject = (function () {
  document.addEventListener('contextmenu', function (event) {
    var target = findAnchorNode(event.target);

    if(target) {
      // match strings beginning with `magnet:?` or `magnet://`
      var url = target.href.match(/^(magnet:(?:[\?]|[\/\/]).*)/g);
      if(url) {
        // set context info for global extension to grab magnet url
        safari.self.tab.setContextMenuEventUserInfo(event, {magnet:url[0]});
        console.log(url);
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
}() );
