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
    return d.toISOString().slice(0, 10);
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
  };
})(typeof window !== 'undefined' ? window : this);
