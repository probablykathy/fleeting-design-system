/*
  Sidebar active-link state.

  The original file was one scrolling page, so it used a scroll-spy to
  highlight the current section in the TOC. This site is multi-page, so that
  scroll-spy is replaced with a path match: whichever sidebar link points at
  the current page gets .on. Same visual result (.on is the same class the
  original TOC used), different trigger.
*/
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var here = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.side-nav .nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var file = href.split('/').pop();
      if (file === here) link.classList.add('on');
    });
  });
})();
