(function () {
  'use strict';

  var EMAIL = 'elkhalil86@gmail.com';

  /* ── Mobile menu ── */
  var menuToggle = document.getElementById('menu-toggle');
  var menuClose = document.getElementById('menu-close');
  var mobileMenu = document.getElementById('mobile-menu');
  var backdrop = document.getElementById('menu-backdrop');

  function closeMenu() {
    mobileMenu.classList.remove('open');
    backdrop.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function openMenu() {
    mobileMenu.classList.add('open');
    backdrop.classList.add('open');
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-nav-link').forEach(function (l) {
    l.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Header scroll ── */
  var header = document.getElementById('site-header');
  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ── FAQ accordion ── */
  document.querySelectorAll('.faq-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    var chevron = document.createElement('span');
    chevron.className = 'faq-chevron text-gold ml-2';
    chevron.textContent = '▼';
    btn.appendChild(chevron);
  });

  /* ── Star rating ── */
  var ratingInput = document.getElementById('rating-value');
  var starBtns = document.querySelectorAll('.star-btn');
  var ratingForm = document.getElementById('rating-form');

  starBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = parseInt(btn.getAttribute('data-value'), 10);
      ratingInput.value = val;
      starBtns.forEach(function (s) {
        s.classList.toggle('active', parseInt(s.getAttribute('data-value'), 10) <= val);
      });
    });
  });

  if (ratingForm) {
    ratingForm.addEventListener('submit', function (e) {
      if (!ratingInput.value) {
        e.preventDefault();
        alert('Please select a star rating before submitting.');
      }
    });
  }

  /* ── Electrician dropdown from availability data ── */
  var electricianSelect = document.getElementById('electrician-select');
  if (electricianSelect && window.IMCAvailability) {
    var data = IMCAvailability.load();
    data.electriciansOnDuty.forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      electricianSelect.appendChild(opt);
    });
  }

  /* ── Monthly booking calendar & busy meter ── */
  var calendarEl = document.getElementById('booking-calendar');
  var busyMeter = document.getElementById('busy-meter');
  var busyLabel = document.getElementById('busy-label');
  var busyDesc = document.getElementById('busy-desc');
  var bookingSlotInput = document.getElementById('booking-slot');
  var selectedDisplay = document.getElementById('selected-slot-display');
  var bookingForm = document.getElementById('booking-form');
  var bookingConfirmPanel = document.getElementById('booking-confirm-panel');
  var bookingHint = document.getElementById('booking-hint');

  var viewYear = new Date().getFullYear();
  var viewMonth = new Date().getMonth();
  var selectedDateStr = null;
  var WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function hideBookingConfirm() {
    if (bookingConfirmPanel) bookingConfirmPanel.classList.remove('visible');
    if (bookingHint) bookingHint.hidden = false;
    if (bookingSlotInput) bookingSlotInput.value = '';
    if (selectedDisplay) selectedDisplay.textContent = '';
    document.querySelectorAll('#booking-time-slots .slot-btn.selected').forEach(function (b) {
      b.classList.remove('selected');
    });
  }

  function showBookingConfirm(slot) {
    if (bookingSlotInput) bookingSlotInput.value = slot;
    if (selectedDisplay) selectedDisplay.textContent = slot;
    if (bookingHint) bookingHint.hidden = true;
    if (bookingConfirmPanel) {
      bookingConfirmPanel.classList.add('visible');
      setTimeout(function () {
        bookingConfirmPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }

  function updateBusyMeter(data) {
    if (!window.IMCAvailability) return;
    var days = IMCAvailability.getBusinessDaysInMonth(viewYear, viewMonth);
    var futureDays = days.filter(function (d) { return !IMCAvailability.isPastDay(d); });
    var counts = IMCAvailability.countAvailableSlots(data, futureDays.length ? futureDays : days);
    var computedBusy = data.busyLevel;
    if (counts.total > 0) {
      computedBusy = Math.max(data.busyLevel, Math.round((counts.blocked / counts.total) * 100));
    }
    var label = IMCAvailability.getBusyLabel(computedBusy);
    if (busyMeter) {
      busyMeter.style.width = computedBusy + '%';
      busyMeter.className = 'busy-meter-fill h-full rounded-full ' +
        (label.color === 'green' ? 'bg-green-500' : label.color === 'amber' ? 'bg-gold' : 'bg-red-500');
    }
    if (busyLabel) {
      busyLabel.textContent = label.text + ' (' + computedBusy + '%)';
      busyLabel.className = 'text-sm font-bold ' +
        (label.color === 'green' ? 'text-green-600' : label.color === 'amber' ? 'text-amber-600' : 'text-red-600');
    }
    if (busyDesc) busyDesc.textContent = label.desc + ' — showing ' + IMCAvailability.getMonthLabel(viewYear, viewMonth) + '.';
  }

  function renderTimeSlots(data, dateStr) {
    var panel = document.getElementById('booking-time-slots');
    if (!panel) return;
    panel.classList.remove('hidden');
    var d = IMCAvailability.parseDateISO(dateStr);
    panel.querySelector('.cal-slots-date').textContent =
      d.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    var grid = panel.querySelector('.cal-slots-grid');
    grid.innerHTML = '';
    IMCAvailability.generateTimeSlots().forEach(function (time) {
      var blocked = IMCAvailability.isBlocked(data, dateStr, time);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = time;
      btn.className = 'slot-btn px-3 py-1.5 text-xs rounded-lg border border-gray-200 ' + (blocked ? 'blocked' : 'available');
      if (!blocked) {
        btn.addEventListener('click', function () {
          document.querySelectorAll('#booking-time-slots .slot-btn.selected').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          var slot = dateStr + ' at ' + time;
          showBookingConfirm(slot);
        });
      }
      grid.appendChild(btn);
    });
  }

  function selectCalendarDay(dateStr, cell) {
    selectedDateStr = dateStr;
    hideBookingConfirm();
    document.querySelectorAll('.cal-day-selected').forEach(function (c) { c.classList.remove('cal-day-selected'); });
    if (cell) cell.classList.add('cal-day-selected');
    renderTimeSlots(IMCAvailability.load(), dateStr);
    if (bookingHint) bookingHint.textContent = 'Now pick a time below.';
  }

  function renderMonthCalendar() {
    if (!window.IMCAvailability || !calendarEl) return;
    var data = IMCAvailability.load();
    updateBusyMeter(data);

    var first = new Date(viewYear, viewMonth, 1);
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    var startPad = (first.getDay() + 6) % 7;

    var html =
      '<div class="cal-header">' +
        '<button type="button" class="cal-nav-btn" id="cal-prev" aria-label="Previous month">‹</button>' +
        '<span class="cal-month-label">' + IMCAvailability.getMonthLabel(viewYear, viewMonth) + '</span>' +
        '<button type="button" class="cal-nav-btn" id="cal-next" aria-label="Next month">›</button>' +
      '</div>' +
      '<div class="cal-weekdays">' + WEEKDAYS.map(function (w) { return '<span class="cal-weekday">' + w + '</span>'; }).join('') + '</div>' +
      '<div class="cal-grid" id="cal-grid"></div>' +
      '<div id="booking-time-slots" class="cal-slots-panel hidden">' +
        '<p class="text-sm font-semibold text-navy mb-1">Available times</p>' +
        '<p class="cal-slots-date text-xs text-slate-muted mb-3"></p>' +
        '<div class="cal-slots-grid flex flex-wrap gap-2"></div>' +
      '</div>';

    calendarEl.innerHTML = html;

    var grid = document.getElementById('cal-grid');
    for (var i = 0; i < startPad; i++) {
      var empty = document.createElement('div');
      empty.className = 'cal-day cal-day-empty';
      grid.appendChild(empty);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(viewYear, viewMonth, day);
      var dateStr = IMCAvailability.formatDateISO(date);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cal-day';
      var dayNum = document.createElement('span');
      dayNum.textContent = day;
      cell.appendChild(dayNum);

      if (IMCAvailability.isWeekend(date)) {
        cell.className += ' cal-day-weekend';
        cell.disabled = true;
      } else if (IMCAvailability.isPastDay(date)) {
        cell.className += ' cal-day-past';
        cell.disabled = true;
      } else {
        var avail = IMCAvailability.dayAvailability(data, dateStr);
        if (avail.open === 0) {
          cell.className += ' cal-day-full';
          cell.disabled = true;
        } else {
          cell.className += ' cal-day-open';
          if (selectedDateStr === dateStr) cell.className += ' cal-day-selected';
          var dot = document.createElement('span');
          dot.className = 'cal-day-dot' + (avail.open <= 3 ? ' cal-day-dot-busy' : '');
          cell.appendChild(dot);
          (function (ds, el) {
            el.addEventListener('click', function () { selectCalendarDay(ds, el); });
          })(dateStr, cell);
        }
      }
      grid.appendChild(cell);
    }

    var prevBtn = document.getElementById('cal-prev');
    var nextBtn = document.getElementById('cal-next');
    prevBtn.disabled = !IMCAvailability.canNavigateMonth(viewYear, viewMonth, -1);
    nextBtn.disabled = !IMCAvailability.canNavigateMonth(viewYear, viewMonth, 1);
    prevBtn.addEventListener('click', function () {
      if (!IMCAvailability.canNavigateMonth(viewYear, viewMonth, -1)) return;
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      selectedDateStr = null;
      hideBookingConfirm();
      if (bookingHint) bookingHint.textContent = 'Tap a day, then choose a time — your details form will appear here.';
      renderMonthCalendar();
    });
    nextBtn.addEventListener('click', function () {
      if (!IMCAvailability.canNavigateMonth(viewYear, viewMonth, 1)) return;
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      selectedDateStr = null;
      hideBookingConfirm();
      if (bookingHint) bookingHint.textContent = 'Tap a day, then choose a time — your details form will appear here.';
      renderMonthCalendar();
    });

    if (selectedDateStr) renderTimeSlots(data, selectedDateStr);
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      if (!bookingSlotInput.value) {
        e.preventDefault();
        alert('Please select a day and time slot before submitting your booking.');
      }
    });
  }

  renderMonthCalendar();
  window.addEventListener('storage', function (e) {
    if (e.key === IMCAvailability.STORAGE_KEY) renderMonthCalendar();
  });
  setInterval(renderMonthCalendar, 8000);

  /* ── Collapsible section toggles ── */
  function setCollapsibleState(btn, panel, open) {
    if (open) {
      panel.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
    var chevron = btn.querySelector('.embed-chevron');
    if (chevron) chevron.textContent = open ? 'Close ▴' : 'Open ▾';
  }

  function openCollapsiblePanel(panelId, scrollTo) {
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var btn = document.querySelector('.embed-toggle[data-target="' + panelId + '"]');
    if (btn && !panel.classList.contains('open')) setCollapsibleState(btn, panel, true);
    else if (btn) setCollapsibleState(btn, panel, true);
    else panel.classList.add('open');
    if (scrollTo !== false) {
      var section = panel.closest('section') || panel;
      setTimeout(function () {
        section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  document.querySelectorAll('.embed-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');
      var panel = document.getElementById(targetId);
      if (!panel) return;
      var open = !panel.classList.contains('open');
      setCollapsibleState(btn, panel, open);
    });
  });

  document.querySelectorAll('.footer-embed-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-target');
      var panel = document.getElementById(targetId);
      if (!panel) return;
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var chevron = btn.querySelector('.footer-embed-chevron');
      if (chevron) chevron.textContent = open ? 'Close ▴' : 'Contact us ▾';
    });
  });

  /* ── Projects show-more (mobile) ── */
  var projectsToggle = document.getElementById('projects-toggle');
  var projectsGrid = document.getElementById('projects-grid');
  if (projectsToggle && projectsGrid) {
    projectsToggle.addEventListener('click', function () {
      var expanded = projectsGrid.classList.toggle('expanded');
      projectsToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      projectsToggle.textContent = expanded ? 'Show fewer projects' : 'Show 4 more projects';
    });
  }

  /* Hash deep-link — open matching collapsible section */
  var hashPanelMap = {
    map: 'map-panel',
    about: 'about-panel',
    quote: 'contact-quote-panel',
    contact: 'contact-quote-panel',
    rating: 'rating-panel',
    emergency: 'emergency-details'
  };

  function activateHashSections() {
    var hash = window.location.hash.replace('#', '');
    if (hashPanelMap[hash]) {
      openCollapsiblePanel(hashPanelMap[hash]);
    }
    if (hash === 'support') {
      var supportBtn = document.querySelector('.footer-embed-toggle[data-target="footer-support-panel"]');
      var supportPanel = document.getElementById('footer-support-panel');
      if (supportPanel && !supportPanel.classList.contains('open') && supportBtn) supportBtn.click();
      if (supportPanel) supportPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (hash === 'areas') {
      var areasEl = document.getElementById('areas');
      if (areasEl) areasEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (hash === 'faq') {
      var faqBtn = document.querySelector('.footer-embed-toggle[data-target="footer-faq-panel"]');
      var faqPanel = document.getElementById('footer-faq-panel');
      if (faqPanel && !faqPanel.classList.contains('open') && faqBtn) faqBtn.click();
      if (faqPanel) faqPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  window.addEventListener('hashchange', activateHashSections);
  activateHashSections();

  /* ── Fade-in ── */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { obs.observe(el); });
  }

})();
