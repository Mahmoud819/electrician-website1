/**
 * IMC Electric — Shared availability & booking logic
 * Public site reads schedule; admin page writes to localStorage.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'imc_availability_v1';

  var DEFAULT = {
    busyLevel: 45,
    blockedSlots: {},
    electriciansOnDuty: ['Mike K.', 'Sarah L.', 'James R.'],
    updatedAt: new Date().toISOString(),
  };

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT));
  }

  function save(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function slotKey(dateStr, time) {
    return dateStr + '_' + time;
  }

  function isBlocked(data, dateStr, time) {
    return !!data.blockedSlots[slotKey(dateStr, time)];
  }

  function getBusyLabel(level) {
    if (level <= 35) return { text: 'Good Availability', color: 'green', desc: 'We can likely schedule you within 2–3 business days.' };
    if (level <= 65) return { text: 'Moderate Demand', color: 'amber', desc: 'Popular times filling up — book soon for your preferred slot.' };
    return { text: 'High Demand', color: 'red', desc: 'We\'re busy — call for fastest emergency or same-week service.' };
  }

  function generateTimeSlots() {
    return ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  }

  function nextBusinessDays(count) {
    var days = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    while (days.length < count) {
      d.setDate(d.getDate() + 1);
      var dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        days.push(new Date(d));
      }
    }
    return days;
  }

  function formatDateISO(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function parseDateISO(str) {
    var p = str.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  }

  function isWeekend(d) {
    var dow = d.getDay();
    return dow === 0 || dow === 6;
  }

  function isPastDay(d) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var cmp = new Date(d);
    cmp.setHours(0, 0, 0, 0);
    return cmp < today;
  }

  /** All Mon–Fri dates in a calendar month (month is 0-indexed). */
  function getBusinessDaysInMonth(year, month) {
    var days = [];
    var d = new Date(year, month, 1);
    while (d.getMonth() === month) {
      if (!isWeekend(d)) days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }

  function getMonthLabel(year, month) {
    return new Date(year, month, 1).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
  }

  /** Count open vs blocked slots for one day. */
  function dayAvailability(data, dateStr) {
    var slots = generateTimeSlots();
    var open = 0;
    var blocked = 0;
    slots.forEach(function (time) {
      if (isBlocked(data, dateStr, time)) blocked++;
      else open++;
    });
    return { open: open, blocked: blocked, total: slots.length };
  }

  function canNavigateMonth(year, month, direction) {
    var now = new Date();
    var target = new Date(year, month + direction, 1);
    var min = new Date(now.getFullYear(), now.getMonth(), 1);
    var max = new Date(now.getFullYear(), now.getMonth() + 3, 1);
    return target >= min && target <= max;
  }

  function formatDateDisplay(d) {
    return d.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function countAvailableSlots(data, days) {
    var slots = generateTimeSlots();
    var total = 0;
    var blocked = 0;
    days.forEach(function (day) {
      var key = formatDateISO(day);
      slots.forEach(function (time) {
        total++;
        if (isBlocked(data, key, time)) blocked++;
      });
    });
    return { total: total, blocked: blocked, available: total - blocked };
  }

  global.IMCAvailability = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT: DEFAULT,
    load: load,
    save: save,
    slotKey: slotKey,
    isBlocked: isBlocked,
    getBusyLabel: getBusyLabel,
    generateTimeSlots: generateTimeSlots,
    nextBusinessDays: nextBusinessDays,
    formatDateISO: formatDateISO,
    formatDateDisplay: formatDateDisplay,
    countAvailableSlots: countAvailableSlots,
    parseDateISO: parseDateISO,
    isWeekend: isWeekend,
    isPastDay: isPastDay,
    getBusinessDaysInMonth: getBusinessDaysInMonth,
    getMonthLabel: getMonthLabel,
    dayAvailability: dayAvailability,
    canNavigateMonth: canNavigateMonth,
  };
})(typeof window !== 'undefined' ? window : this);
