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

  /* ── Booking calendar & busy meter ── */
  var calendarEl = document.getElementById('booking-calendar');
  var busyMeter = document.getElementById('busy-meter');
  var busyLabel = document.getElementById('busy-label');
  var busyDesc = document.getElementById('busy-desc');
  var bookingSlotInput = document.getElementById('booking-slot');
  var selectedDisplay = document.getElementById('selected-slot-display');
  var bookingForm = document.getElementById('booking-form');
  var selectedSlot = null;

  function renderAvailability() {
    if (!window.IMCAvailability || !calendarEl) return;
    var data = IMCAvailability.load();
    var days = IMCAvailability.nextBusinessDays(10);
    var slots = IMCAvailability.generateTimeSlots();
    var counts = IMCAvailability.countAvailableSlots(data, days);
    var computedBusy = data.busyLevel;
    if (counts.total > 0) {
      var slotBusy = Math.round((counts.blocked / counts.total) * 100);
      computedBusy = Math.max(data.busyLevel, slotBusy);
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
    if (busyDesc) busyDesc.textContent = label.desc;

    calendarEl.innerHTML = '';
    days.forEach(function (day) {
      var dateStr = IMCAvailability.formatDateISO(day);
      var dayBlock = document.createElement('div');
      dayBlock.className = 'border border-gray-200 rounded-xl p-4 bg-white';
      dayBlock.innerHTML = '<p class="font-semibold text-navy text-sm mb-3">' + IMCAvailability.formatDateDisplay(day) + '</p>';
      var grid = document.createElement('div');
      grid.className = 'flex flex-wrap gap-2';
      slots.forEach(function (time) {
        var blocked = IMCAvailability.isBlocked(data, dateStr, time);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = time;
        btn.className = 'slot-btn px-3 py-1.5 text-xs rounded-lg border border-gray-200 ' +
          (blocked ? 'blocked' : 'available');
        if (!blocked) {
          btn.addEventListener('click', function () {
            document.querySelectorAll('.slot-btn.selected').forEach(function (b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            selectedSlot = dateStr + ' at ' + time;
            bookingSlotInput.value = selectedSlot;
            selectedDisplay.textContent = 'Selected: ' + selectedSlot;
          });
        }
        grid.appendChild(btn);
      });
      dayBlock.appendChild(grid);
      calendarEl.appendChild(dayBlock);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      if (!bookingSlotInput.value) {
        e.preventDefault();
        alert('Please select an available time slot before submitting your booking.');
      }
    });
  }

  renderAvailability();
  window.addEventListener('storage', function (e) {
    if (e.key === IMCAvailability.STORAGE_KEY) renderAvailability();
  });
  setInterval(renderAvailability, 5000);

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
