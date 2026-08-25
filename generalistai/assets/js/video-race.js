// Side-by-side video "race" timer used on /blog/gen-1 to compare task
// completion speeds. For each .video-race container:
//   - Pre-buffers all <video> elements so they don't stall mid-playback
//     when fighting for bandwidth.
//   - Starts every video simultaneously when the container is fully in view.
//   - Per-video stopwatch (one [data-timer] sibling per video) that ticks
//     while the clip plays and freezes (with a check icon) when it ends.
//   - After all videos finish, waits `data-restart-delay` seconds and resets.
(function () {
  function init(container) {
    var restartDelay = parseFloat(container.getAttribute('data-restart-delay') || '5') * 1000;
    var videos = Array.prototype.slice.call(container.querySelectorAll('video'));
    var timerEls = Array.prototype.slice.call(container.querySelectorAll('[data-timer]'));
    var timerValues = Array.prototype.slice.call(container.querySelectorAll('[data-timer] .timer-value'));
    var timerIcons = Array.prototype.slice.call(container.querySelectorAll('[data-timer] .timer-icon'));
    if (!videos.length || timerEls.length !== videos.length) return;

    var rafId = null;
    var started = false;
    var loaded = false;
    var finishedCount = 0;
    var frozen = videos.map(function () { return false; });

    function formatTime(sec) {
      var str = sec.toFixed(1);
      if (sec < 10) str = '0' + str;
      return str + 's';
    }

    function updateTimers() {
      for (var i = 0; i < videos.length; i++) {
        if (!frozen[i]) timerValues[i].textContent = formatTime(videos[i].currentTime);
      }
      if (finishedCount < videos.length) rafId = requestAnimationFrame(updateTimers);
    }

    function onEnded(idx) {
      return function () {
        frozen[idx] = true;
        timerEls[idx].classList.add('stopped');
        timerIcons[idx].textContent = '\u2705';
        finishedCount++;
        if (finishedCount >= videos.length) {
          if (rafId) cancelAnimationFrame(rafId);
          setTimeout(resetAndWait, restartDelay);
        }
      };
    }

    function resetAndWait() {
      started = false;
      finishedCount = 0;
      for (var i = 0; i < videos.length; i++) {
        frozen[i] = false;
        videos[i].currentTime = 0;
        videos[i].pause();
        timerValues[i].textContent = formatTime(0);
        timerIcons[i].textContent = '\u23F1\uFE0F';
        timerEls[i].classList.remove('stopped');
      }
      checkVisibility();
    }

    function startPlayback() {
      if (started) return;
      started = true;
      finishedCount = 0;
      for (var i = 0; i < videos.length; i++) {
        frozen[i] = false;
        timerEls[i].classList.remove('stopped');
        timerIcons[i].textContent = '\u23F1\uFE0F';
        videos[i].play();
      }
      rafId = requestAnimationFrame(updateTimers);
    }

    function isFullyInView() {
      var rect = container.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }

    function checkVisibility() {
      if (started || !loaded) return;
      if (isFullyInView()) startPlayback();
    }

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    videos.forEach(function (v, i) { v.addEventListener('ended', onEnded(i)); });

    var preload = isIOS
      ? videos.map(function (v) {
          return new Promise(function (resolve) {
            if (v.readyState >= 2) { resolve(); return; }
            v.addEventListener('loadeddata', resolve, { once: true });
            v.load();
          });
        })
      : videos.map(function (v) {
          return fetch(v.currentSrc || v.src)
            .then(function (r) { return r.blob(); })
            .then(function (blob) {
              v.src = URL.createObjectURL(blob);
              return new Promise(function (resolve) {
                v.addEventListener('loadeddata', resolve, { once: true });
              });
            });
        });

    Promise.all(preload).then(function () { loaded = true; checkVisibility(); });

    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) checkVisibility();
    }, { threshold: 1.0 });
    io.observe(container);
    window.addEventListener('scroll', checkVisibility, { passive: true });
  }

  function boot() {
    document.querySelectorAll('.video-race').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
