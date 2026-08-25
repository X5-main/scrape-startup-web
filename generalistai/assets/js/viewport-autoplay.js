(function () {
  'use strict';

  function init() {
    var videos = Array.from(document.querySelectorAll('video[data-viewport-autoplay]'));
    if (!videos.length || typeof IntersectionObserver === 'undefined') return;

    var visibility = new Map();

    function sync(video) {
      if (!document.hidden && visibility.get(video)) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visibility.set(entry.target, entry.isIntersecting);
        sync(entry.target);
      });
    }, { threshold: 0.01 });

    videos.forEach(function (video) {
      visibility.set(video, false);
      observer.observe(video);
    });

    document.addEventListener('visibilitychange', function () {
      videos.forEach(sync);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
