/**
 * Live Google Reviews — loads via Places API when googleReviewsApiKey is set in config.js.
 * Connects site schema to verified GBP feedback loop.
 */
(function () {
  'use strict';

  var container = document.getElementById('google-reviews-widget');
  if (!container) return;

  var cfg = window.IMCConfig || {};
  var apiKey = cfg.googleReviewsApiKey;
  var placeId = cfg.googlePlaceId;

  function renderFallback() {
    container.innerHTML =
      '<div class="bg-white rounded-2xl border border-gray-200 p-8 text-center">' +
        '<p class="text-4xl text-gold mb-3">★★★★★</p>' +
        '<p class="font-bold text-navy text-lg mb-2">Verified Google Reviews</p>' +
        '<p class="text-slate-muted text-sm mb-6 max-w-md mx-auto">Connect your Google Business Profile Place ID and API key in <code class="text-xs bg-slate-100 px-1 rounded">js/config.js</code> to stream live five-star reviews here — search engines will read the validated schema link to your GBP.</p>' +
        '<a href="' + (cfg.googleBusinessUrl || '#') + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center bg-gold hover:bg-gold-dark text-navy font-bold px-6 py-3 rounded-xl">View Our Google Reviews</a>' +
      '</div>';
  }

  if (!apiKey || !placeId) {
    renderFallback();
    return;
  }

  fetch('https://places.googleapis.com/v1/places/' + placeId + '?fields=reviews,rating,userRatingCount&key=' + apiKey, {
    headers: { 'X-Goog-FieldMask': 'reviews,rating,userRatingCount' },
  })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data.reviews || !data.reviews.length) { renderFallback(); return; }
      var html = '<div class="grid md:grid-cols-2 gap-6">';
      data.reviews.slice(0, 4).forEach(function (rev) {
        html +=
          '<article class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm" itemscope itemtype="https://schema.org/Review">' +
            '<div class="text-gold mb-2">★★★★★</div>' +
            '<p class="text-slate-muted text-sm leading-relaxed" itemprop="reviewBody">' + (rev.text || rev.originalText || '').substring(0, 400) + '</p>' +
            '<p class="mt-3 text-xs font-semibold text-slate-charcoal"><span itemprop="author">' + (rev.authorAttribution && rev.authorAttribution.displayName || 'Google User') + '</span> · Verified Google Review</p>' +
          '</article>';
      });
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(renderFallback);
})();
