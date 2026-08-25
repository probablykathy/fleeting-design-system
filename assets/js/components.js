/*
  Component interactions — ported from the source single-file catalogue.

  The source script assumes every element exists exactly once on the one
  page it lives on (e.g. document.getElementById('openDialog').onclick = ...
  would throw if #openDialog were ever absent). This site loads the same
  script on every page, and most pages contain only a handful of the 53
  components' markup — so every block below is guarded: it does nothing if
  its elements aren't present on the current page, instead of throwing and
  aborting the rest of the file. The behavior itself, wherever its markup
  does exist, is unchanged from the source.

  Re-synced against the "Update components and states" revision: the Alert
  Dialog block now wires the three progress/success/failure overlays (the
  old single confirm dialog's ids are gone, not reintroduced); added the
  range-picker Calendar, Input OTP verify/shake/success, and the Slider's
  floating tooltip.
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

  // Range calendar — a second, independent builder (not a parameterization
  // of buildCalendar above), matching how the source implements it: start/end
  // click-to-pick state that buildCalendar's single-date model doesn't have.
  function buildRangeCalendar(el, labelEl) {
    if (!el) return;
    var now = new Date(2026, 7, 25);
    var viewM = now.getMonth(), viewY = now.getFullYear();
    var start = null, end = null;
    function fmt(y, m, d) { return new Date(y, m, d).toLocaleDateString('en', { month: 'short', day: 'numeric' }); }
    function render() {
      var first = new Date(viewY, viewM, 1);
      var startDow = first.getDay();
      var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
      var monthName = first.toLocaleString('en', { month: 'long' });
      var html = '<div class="ch"><button data-nav="-1">‹</button><span>' + monthName + ' ' + viewY + '</span><button data-nav="1">›</button></div><div class="cal-grid">';
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) { html += '<div class="dow">' + d + '</div>'; });
      for (var i = 0; i < startDow; i++) html += '<button class="mut" disabled></button>';
      for (var d = 1; d <= daysInMonth; d++) {
        var cls = '';
        var cur = new Date(viewY, viewM, d).getTime();
        if (start && cur === start.getTime()) cls = 'range-start';
        else if (end && cur === end.getTime()) cls = 'range-end';
        else if (start && end && cur > start.getTime() && cur < end.getTime()) cls = 'in-range';
        html += '<button class="' + cls + '" data-day="' + d + '">' + d + '</button>';
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
          var picked = new Date(viewY, viewM, +b.dataset.day);
          if (!start || (start && end)) { start = picked; end = null; }
          else if (picked.getTime() < start.getTime()) { end = start; start = picked; }
          else { end = picked; }
          render();
          if (labelEl) {
            if (start && !end) labelEl.textContent = 'From ' + fmt(start.getFullYear(), start.getMonth(), start.getDate()) + ' — pick an end date';
            else if (start && end) labelEl.textContent = fmt(start.getFullYear(), start.getMonth(), start.getDate()) + ' → ' + fmt(end.getFullYear(), end.getMonth(), end.getDate());
          }
        };
      });
    }
    render();
  }
  buildRangeCalendar(document.getElementById('cal3'), document.getElementById('rangeLabel'));

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

  // Icon gallery filter (Foundations > Icons) — same substring-match pattern as the Command palette filter above
  var iconSearch = document.getElementById('iconSearch'), iconCount = document.getElementById('iconCount');
  if (iconSearch) {
    var allIconCards = document.querySelectorAll('.icon-card');
    function applyIconFilter() {
      var q = iconSearch.value.toLowerCase();
      var shown = 0;
      allIconCards.forEach(function (c) {
        var match = c.dataset.name.includes(q);
        c.classList.toggle('hide', !match);
        if (match) shown++;
      });
      if (iconCount) iconCount.textContent = shown + ' of ' + allIconCards.length + ' icons';
    }
    iconSearch.addEventListener('input', applyIconFilter);
    applyIconFilter();
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

  // Alert dialog — three independent flows (progress / success / failure),
  // replacing the single confirm dialog the source used to have. The old
  // #alertDialogOverlay / #confirmAlertDialog / #cancelAlertDialog ids are
  // gone from the source and are intentionally not reintroduced here.
  var openAD_progress = document.getElementById('openAD_progress'), adProgressOverlay = document.getElementById('adProgressOverlay');
  var closeAD_progress = document.getElementById('closeAD_progress'), adProgressBar = document.getElementById('adProgressBar'), adProgressLabel = document.getElementById('adProgressLabel');
  if (openAD_progress && adProgressOverlay && adProgressBar && adProgressLabel) {
    openAD_progress.onclick = function () {
      adProgressOverlay.classList.add('open');
      adProgressBar.style.width = '0%';
      adProgressLabel.textContent = '0%';
      var p = 0;
      clearInterval(window._adTimer);
      window._adTimer = setInterval(function () {
        p = Math.min(100, p + Math.random() * 18);
        adProgressBar.style.width = p + '%';
        adProgressLabel.textContent = Math.round(p) + '%';
        if (p >= 100) clearInterval(window._adTimer);
      }, 350);
    };
  }
  if (closeAD_progress && adProgressOverlay) {
    closeAD_progress.onclick = function () { clearInterval(window._adTimer); adProgressOverlay.classList.remove('open'); };
  }

  var openAD_success = document.getElementById('openAD_success'), adSuccessOverlay = document.getElementById('adSuccessOverlay'), closeAD_success = document.getElementById('closeAD_success');
  if (openAD_success && adSuccessOverlay) openAD_success.onclick = function () { adSuccessOverlay.classList.add('open'); };
  if (closeAD_success && adSuccessOverlay) closeAD_success.onclick = function () { adSuccessOverlay.classList.remove('open'); };

  var openAD_fail = document.getElementById('openAD_fail'), adFailOverlay = document.getElementById('adFailOverlay'), closeAD_fail = document.getElementById('closeAD_fail'), retryAD_fail = document.getElementById('retryAD_fail');
  if (openAD_fail && adFailOverlay) openAD_fail.onclick = function () { adFailOverlay.classList.add('open'); };
  if (closeAD_fail && adFailOverlay) closeAD_fail.onclick = function () { adFailOverlay.classList.remove('open'); };
  if (retryAD_fail && adFailOverlay && openAD_progress) {
    retryAD_fail.onclick = function () { adFailOverlay.classList.remove('open'); openAD_progress.click(); };
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

  // Input OTP: auto-advance between digits, verify against a fixed code,
  // shake + clear on a wrong entry, success border on the right one.
  (function () {
    var box = document.getElementById('otpBox');
    var verifyBtn = document.getElementById('otpVerify');
    var msg = document.getElementById('otpMsg');
    if (!box || !verifyBtn || !msg) return;
    var inputs = [].slice.call(box.querySelectorAll('input'));
    var CODE = '123456';
    inputs.forEach(function (inp, i) {
      inp.addEventListener('input', function () {
        inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, 1);
        box.classList.remove('shake', 'success');
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
      });
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace' && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
      });
    });
    verifyBtn.onclick = function () {
      var entered = inputs.map(function (i) { return i.value; }).join('');
      if (entered.length < 6) {
        msg.textContent = 'Enter all 6 digits';
        msg.style.color = 'hsl(var(--muted-foreground))';
        return;
      }
      if (entered === CODE) {
        box.classList.remove('shake');
        box.classList.add('success');
        msg.textContent = '✓ verified';
        msg.style.color = 'hsl(var(--chart-ok))';
      } else {
        box.classList.remove('success');
        box.classList.remove('shake');
        void box.offsetWidth;
        box.classList.add('shake');
        msg.textContent = 'Wrong code — try 1 2 3 4 5 6';
        msg.style.color = 'hsl(var(--destructive))';
        inputs.forEach(function (i) { i.value = ''; });
        inputs[0].focus();
      }
    };
  })();

  // Slider: floating tooltip tracks the thumb
  (function () {
    var wrap = document.getElementById('sliderWrap');
    var input = document.getElementById('sliderInput');
    var tip = document.getElementById('sliderTip');
    if (!wrap || !input || !tip) return;
    function place() {
      var min = +input.min, max = +input.max, val = +input.value;
      var pct = (val - min) / (max - min);
      var thumb = 16;
      var trackWidth = input.offsetWidth - thumb;
      var left = thumb / 2 + pct * trackWidth;
      tip.style.left = left + 'px';
      tip.textContent = val;
    }
    input.addEventListener('input', place);
    addEventListener('resize', place);
    place();
  })();
});
