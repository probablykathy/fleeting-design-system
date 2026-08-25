/*
  Theme toggle + persistence.

  The original single-file catalogue set data-theme on <html> with no
  persistence — fine for one scrolling page, but across a multi-page site the
  theme would visibly reset to light on every navigation. This adds the
  minimum needed to fix that: a localStorage key, written on toggle, read by
  the pre-paint snippet in each page's <head> (before any CSS loads, so there
  is no flash of the wrong theme).

  Visual behavior of the toggle itself (.theme-tgl button / .on class) is
  unchanged from the original.
*/
(function () {
  var STORAGE_KEY = 'fleeting-theme';

  function applyToggleState(theme) {
    document.querySelectorAll('.theme-tgl button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.th === theme);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var current = document.documentElement.dataset.theme || 'light';
    applyToggleState(current);

    document.querySelectorAll('.theme-tgl button').forEach(function (b) {
      b.onclick = function () {
        var theme = b.dataset.th;
        document.documentElement.dataset.theme = theme;
        applyToggleState(theme);
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
      };
    });
  });
})();
