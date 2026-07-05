(function () {
  'use strict';

  var cfg = window.IMCConfig;
  if (!cfg) return;

  /* ── Trust strip (above footer on every page) ── */
  var trustStrip = document.getElementById('trust-strip');
  if (trustStrip) {
    trustStrip.innerHTML =
      '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 text-center">' +
        '<p class="text-xs sm:text-base font-bold text-navy">' +
          cfg.licenseLabel + ' · #' + cfg.license +
        '</p>' +
        '<p class="text-[10px] sm:text-sm text-slate-charcoal mt-0.5 hide-mobile">' +
          cfg.insurance + ' serving ' + cfg.serviceRadius + '.' +
        '</p>' +
      '</div>';
  }

  /* ── Footer NAP (consistent punctuation) ── */
  var napPhone = document.querySelectorAll('[data-nap-phone]');
  var napEmail = document.querySelectorAll('[data-nap-email]');
  var napName = document.querySelectorAll('[data-nap-name]');
  var napLicense = document.querySelectorAll('[data-nap-license]');
  napPhone.forEach(function (el) {
    el.textContent = 'Phone: ' + cfg.phone;
    if (el.tagName === 'A') el.href = 'tel:' + cfg.phoneTel;
  });
  napEmail.forEach(function (el) {
    el.textContent = 'Email: ' + cfg.email;
    if (el.tagName === 'A') el.href = 'mailto:' + cfg.email;
  });
  napName.forEach(function (el) { el.textContent = cfg.legalName; });
  napLicense.forEach(function (el) { el.textContent = 'ESA / ECRA Licence #' + cfg.license; });

  /* ── Mobile sticky action bar ── */
  var stickyBar = document.getElementById('mobile-sticky-bar');
  if (stickyBar) {
    stickyBar.innerHTML =
      '<a href="tel:' + cfg.phoneTel + '" class="sticky-bar-call flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 text-sm">' +
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>' +
        'Call Emergency Dispatch' +
      '</a>' +
      '<a href="' + (document.body.dataset.bookingHref || 'index.html#booking') + '" class="sticky-bar-book flex-1 flex items-center justify-center gap-2 bg-navy hover:bg-navy-deep text-white font-bold py-3.5 text-sm border-l border-white/20">' +
        'Book Appointment' +
      '</a>';
    document.body.classList.add('has-sticky-bar');
  }

  /* ── Nav dropdowns (desktop) ── */
  document.querySelectorAll('.nav-dropdown').forEach(function (wrap) {
    var btn = wrap.querySelector('.nav-dropdown-btn');
    var menu = wrap.querySelector('.nav-dropdown-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (w) {
      w.classList.remove('open');
      var b = w.querySelector('.nav-dropdown-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* ── Google map embed src ── */
  var mapFrame = document.getElementById('service-map');
  if (mapFrame && cfg.googleMapsEmbed) mapFrame.src = cfg.googleMapsEmbed;

})();
