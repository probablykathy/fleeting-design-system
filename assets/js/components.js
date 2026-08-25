/*
  Component interactions — ported from the original single-file catalogue.

  The original script assumed every element existed exactly once on the one
  page it lived on (e.g. document.getElementById('openDialog').onclick = ...
  would throw if #openDialog were ever absent). This site loads the same
  script on every page, and most pages contain only a handful of the 53
  components' markup — so every block below is guarded: it does nothing if
  its elements aren't present on the current page, instead of throwing and
  aborting the rest of the file. The behavior itself, wherever its markup
  does exist, is unchanged from the original.
*/
document.addEventListener('DOMContentLoaded', function () {

  // Accordion
  document.querySelectorAll('.acc-trig').forEach(function (t) {
    t.onclick = function () { t.parentElement.classList.toggle('open'); };
  });

  // Collapsible
  (function () {
    var trig = document.getElementById('collToggle');
    var body = document.getElementById('collBody');
    if (!trig || !body) return;
    body.style.maxHeight = '0px';
    body.style.overflow = 'hidden';
    trig.onclick = function () {
      var open = body.style.maxHeight && body.style.maxHeight !== '0px';
      body.style.maxHeight = open ? '0px' : '100px';
      body.style.overflow = 'hidden';
      body.style.transition = 'max-height .25s ease';
      trig.textContent = open ? 'Show environment details' : 'Hide environment details';
    };
  })();

  // Checkbox / Radio / Switch / Toggle / Toggle group
  document.querySelectorAll('[data-cbx]').forEach(function (c) {
    c.onclick = function () { c.classList.toggle('on'); };
  });
  document.querySelectorAll('[data-rdo]').forEach(function (r) {
    r.onclick = function () {
      var g = r.dataset.rdo;
      document.querySelectorAll('[data-rdo="' + g + '"]').forEach(function (x) { x.classList.remove('on'); });
      r.classList.add('on');
    };
  });
  document.querySelectorAll('[data-sw]').forEach(function (s) {
    s.onclick = function () { s.classList.toggle('on'); };
  });
  document.querySelectorAll('[data-tgl]').forEach(function (t) {
    t.onclick = function () { t.classList.toggle('on'); };
  });
  document.querySelectorAll('.tglgroup').forEach(function (group) {
    group.querySelectorAll('.tgl-btn').forEach(function (b) {
      b.onclick = function () {
        group.querySelectorAll('.tgl-btn').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
      };
    });
  });

  // Tabs (per-instance, scoped to each .tabslist rather than one hardcoded id
  // — the original wired a single #tabsDemo; scoping by instance lets more
  // than one Tabs example exist on a page without them fighting over state)
  document.querySelectorAll('.tabslist').forEach(function (list) {
    var panelHost = list.parentElement;
    list.querySelectorAll('.tabstrig').forEach(function (t) {
      t.onclick = function () {
        list.querySelectorAll('.tabstrig').forEach(function (x) { x.classList.remove('on'); });
        t.classList.add('on');
        panelHost.querySelectorAll('.tabpanel').forEach(function (p) {
          p.classList.toggle('on', p.dataset.panel === t.dataset.tab);
        });
      };
    });
  });

  // Dropdown menu
  var ddWrap = document.getElementById('ddWrap'), ddTrig = document.getElementById('ddTrig'), ddMenu = document.getElementById('ddMenu');
  if (ddWrap && ddTrig && ddMenu) {
    ddTrig.onclick = function (e) { e.stopPropagation(); ddMenu.classList.toggle('open'); };
  }

  // Menubar
  document.querySelectorAll('.mb-item').forEach(function (item) {
    var trig = item.querySelector('.mb-trig');
    if (!trig) return;
    trig.onclick = function (e) {
      e.stopPropagation();
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.mb-item').forEach(function (x) { x.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    };
  });

  // Navigation menu
  document.querySelectorAll('#navMenu>div').forEach(function (item) {
    var btn = item.querySelector('button');
    if (!btn) return;
    btn.onclick = function (e) {
      e.stopPropagation();
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('#navMenu>div').forEach(function (x) { x.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    };
  });

  // Popover
  var popWrap = document.getElementById('popWrap'), popTrig = document.getElementById('popTrig');
  if (popWrap && popTrig) {
    popTrig.onclick = function (e) { e.stopPropagation(); popWrap.classList.toggle('open'); };
  }

  // Select (custom)
  var selWrap = document.getElementById('selWrap'), selTrig = document.getElementById('selTrig'), selVal = document.getElementById('selVal');
  if (selWrap && selTrig) {
    selTrig.onclick = function (e) { e.stopPropagation(); selWrap.classList.toggle('open'); };
    selWrap.querySelectorAll('.select-opt').forEach(function (o) {
      o.onclick = function () {
        if (selVal) selVal.textContent = o.textContent;
        selWrap.classList.remove('open');
      };
    });
  }

  // Context menu
  var ctxZone = document.getElementById('ctxZone'), ctxMenu = document.getElementById('ctxMenu');
  if (ctxZone && ctxMenu) {
    ctxZone.addEventListener('contextmenu', function (e) {
      e.preventDefault();
      ctxMenu.style.left = e.offsetX + 'px';
      ctxMenu.style.top = e.offsetY + 'px';
      ctxMenu.classList.add('open');
    });
  }

  // Global outside-click close — rewritten to close by class rather than by
  // a fixed list of ids, so it safely covers whichever of the above widgets
  // are present on the current page.
  document.addEventListener('click', function () {
    document.querySelectorAll('.menu.open').forEach(function (m) { m.classList.remove('open'); });
    document.querySelectorAll('.mb-item.open, #navMenu>div.open').forEach(function (x) { x.classList.remove('open'); });
    document.querySelectorAll('.pop-wrap.open').forEach(function (x) { x.classList.remove('open'); });
    document.querySelectorAll('.select.open').forEach(function (x) { x.classList.remove('open'); });
    document.querySelectorAll('.datepick.open').forEach(function (x) { x.classList.remove('open'); });
  });

  // Calendar (shared builder — used by both a standalone Calendar and a
  // Date Picker's popover calendar). "Now" is pinned the same way the
  // original demo pinned it.
  function buildCalendar(el, onPick) {
    if (!el) return;
    var now = new Date(2026, 7, 25);
    var viewM = now.getMonth(), viewY = now.getFullYear();
    function render() {
      var first = new Date(viewY, viewM, 1);
      var startDow = first.getDay();
      var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
      var monthName = first.toLocaleString('en', { month: 'long' });
      var html = '<div class="ch"><button data-nav="-1">‹</button><span>' + monthName + ' ' + viewY + '</span><button data-nav="1">›</button></div><div class="cal-grid">';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
      for (var i = 0; i < startDow; i++) html += '<button class="mut" disabled></button>';
      for (var d2 = 1; d2 <= daysInMonth; d2++) {
        var isToday = d2 === now.getDate() && viewM === now.getMonth();
        html += '<button class="' + (isToday ? 'today' : '') + '" data-day="' + d2 + '">' + d2 + '</button>';
      }
      html += '</div>';
      el.innerHTML = html;
      el.querySelectorAll('[data-nav]').forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          viewM += +b.dataset.nav;
          if (viewM < 0) { viewM = 11; viewY--; }
          if (viewM > 11) { viewM = 0; viewY++; }
          render();
        };
      });
      el.querySelectorAll('[data-day]').forEach(function (b) {
        b.onclick = function (ev) {
          ev.stopPropagation();
          el.querySelectorAll('[data-day]').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          if (onPick) onPick(monthName + ' ' + b.dataset.day + ', ' + viewY);
        };
      });
    }
    render();
  }
  buildCalendar(document.getElementById('cal1'));
  var dpVal = document.getElementById('dpVal'), dpWrap = document.getElementById('dpWrap');
  buildCalendar(document.getElementById('cal2'), function (val) {
    if (dpVal) dpVal.textContent = val;
    if (dpWrap) dpWrap.classList.remove('open');
  });
  var dpTrig = document.getElementById('dpTrig');
  if (dpTrig && dpWrap) {
    dpTrig.onclick = function (e) { e.stopPropagation(); dpWrap.classList.toggle('open'); };
  }

  // Command palette filter
  var cmdInput = document.getElementById('cmdInput');
  if (cmdInput) {
    cmdInput.addEventListener('input', function (e) {
      var q = e.target.value.toLowerCase();
      document.querySelectorAll('.cmdk .itm').forEach(function (i) {
        i.classList.toggle('hide', !i.dataset.k.includes(q));
      });
    });
  }

  // Direction toggle (RTL / LTR) — lives on Usage > Guidelines now
  var dirToggle = document.getElementById('dirToggle'), dirDemo = document.getElementById('dirDemo');
  if (dirToggle && dirDemo) {
    dirToggle.onclick = function () {
      dirDemo.setAttribute('dir', dirDemo.getAttribute('dir') === 'ltr' ? 'rtl' : 'ltr');
    };
  }

  // Dialog
  var openDialog = document.getElementById('openDialog'), dialogOverlay = document.getElementById('dialogOverlay'), closeDialog = document.getElementById('closeDialog');
  if (openDialog && dialogOverlay) openDialog.onclick = function () { dialogOverlay.classList.add('open'); };
  if (closeDialog && dialogOverlay) closeDialog.onclick = function () { dialogOverlay.classList.remove('open'); };
  if (dialogOverlay) {
    dialogOverlay.onclick = function (e) { if (e.target.id === 'dialogOverlay') e.currentTarget.classList.remove('open'); };
  }

  // Alert dialog
  var openAlertDialog = document.getElementById('openAlertDialog'), alertDialogOverlay = document.getElementById('alertDialogOverlay');
  var cancelAlertDialog = document.getElementById('cancelAlertDialog'), confirmAlertDialog = document.getElementById('confirmAlertDialog');
  if (openAlertDialog && alertDialogOverlay) openAlertDialog.onclick = function () { alertDialogOverlay.classList.add('open'); };
  if (cancelAlertDialog && alertDialogOverlay) cancelAlertDialog.onclick = function () { alertDialogOverlay.classList.remove('open'); };
  if (confirmAlertDialog && alertDialogOverlay) {
    confirmAlertDialog.onclick = function () { alertDialogOverlay.classList.remove('open'); fireToastMsg('— attempt closed'); };
  }

  // Drawer
  var openDrawer = document.getElementById('openDrawer'), closeDrawer = document.getElementById('closeDrawer');
  var drawerPanel = document.getElementById('drawerPanel'), drawerScrim = document.getElementById('drawerScrim');
  if (openDrawer && drawerPanel && drawerScrim) openDrawer.onclick = function () { drawerPanel.classList.add('open'); drawerScrim.classList.add('open'); };
  if (closeDrawer && drawerPanel && drawerScrim) closeDrawer.onclick = function () { drawerPanel.classList.remove('open'); drawerScrim.classList.remove('open'); };
  if (drawerScrim && drawerPanel) drawerScrim.onclick = function () { drawerPanel.classList.remove('open'); drawerScrim.classList.remove('open'); };

  // Toast
  var toastTimer;
  window.fireToastMsg = function (msg) {
    var t = document.getElementById('toastEl');
    if (!t) return;
    if (msg) t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };
  var fireToast = document.getElementById('fireToast');
  if (fireToast) {
    fireToast.onclick = function () { window.fireToastMsg('✓ attempt-2 promoted · audit entry recorded'); };
  }
});
