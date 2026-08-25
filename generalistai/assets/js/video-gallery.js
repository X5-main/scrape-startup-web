// Simple thumbnail-driven gallery: clicking a .gallery-video swaps the
// main <video> source and updates the visible caption.
(function () {
  function init(root) {
    var thumbs = root.querySelectorAll('.gallery-video');
    var main = root.querySelector('.main-video-container video');
    var caption = root.querySelector('[data-video-caption]');
    if (!thumbs.length || !main) return;

    function activate(thumb) {
      var src = thumb.getAttribute('data-src') || thumb.currentSrc || (thumb.querySelector('source') && thumb.querySelector('source').src);
      var text = thumb.getAttribute('data-caption') || '';
      if (!src) return;

      var source = main.querySelector('source');
      if (source) source.src = src; else main.src = src;
      try { main.load(); main.play(); } catch (e) {}

      if (caption) caption.textContent = text;

      thumbs.forEach(function (t) { t.classList.remove('active'); });
      thumb.classList.add('active');
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () { activate(thumb); });
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(thumb); }
      });
    });
  }

  function boot() {
    document.querySelectorAll('.video-gallery-container').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
