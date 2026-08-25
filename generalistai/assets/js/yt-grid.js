// Lazy-loading "More videos" grid used at the bottom of /blog/gen-1.
// Reads a JSON manifest of YouTube videos from a `data-source` URL on
// the host element, renders each as a clickable thumbnail facade, then
// swaps to a YouTube iframe on click. Saves a few MB of upfront iframe
// JS on initial page load when there are 16 thumbnails.
(function () {
  var PLAY_SVG =
    '<svg viewBox="0 0 68 48" aria-hidden="true">' +
    '<path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,0.13,34,0,34,0S12.21,0.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="#212121" opacity="0.85"/>' +
    '<path d="M 45,24 27,14 27,34" fill="#fff"/>' +
    '</svg>';

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function extractId(url) {
    var m = String(url || '').match(/(?:v=|youtu\.be\/|\/embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  function init(grid) {
    var src = grid.getAttribute('data-source');
    if (!src) return;

    fetch(src, { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !Array.isArray(data.videos)) return;
        grid.innerHTML = data.videos.map(function (v) {
          var id = extractId(v.url);
          if (!id) return '';
          var title = escapeHtml(v.title || '');
          return '<button class="yt-facade" type="button" data-yt-id="' + id + '" ' +
            'data-yt-title="' + title + '" aria-label="Play video: ' + title + '">' +
            '<img class="yt-facade-thumb" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" ' +
            'alt="" loading="lazy" decoding="async">' +
            '<span class="yt-facade-play">' + PLAY_SVG + '</span>' +
            '</button>';
        }).join('');
      })
      .catch(function (err) { console.error('yt-grid fetch failed:', err); });

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('.yt-facade');
      if (!btn) return;
      var id = btn.getAttribute('data-yt-id');
      var title = btn.getAttribute('data-yt-title') || '';
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3';
      iframe.title = title;
      iframe.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('allowfullscreen', '');
      btn.parentNode.replaceChild(iframe, btn);
    });
  }

  function boot() {
    document.querySelectorAll('.yt-facade-grid[data-source]').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
