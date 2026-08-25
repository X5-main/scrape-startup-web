/**
 * <video-player src="/path/to/config.json"></video-player>
 * <video-player theme="dark" src="/path/to/config.json"></video-player>
 *
 * Custom element (Web Component) for the custom video player UI.
 * All markup + behavior is encapsulated. Consumers only need:
 *
 *   <link rel="stylesheet" href="/assets/css/custom-video-player.css" />
 *   <script src="/assets/js/custom-video-player.js" defer></script>
 *   <video-player src="/assets/videos/homepage/gen1-teaser.json"></video-player>
 *   <video-player video-src="/path/to/video.mp4" player-title="Demo" autoplay loop has-audio="false"></video-player>
 *
 * Attributes:
 *   src           — URL to the JSON config
 *   video-src     — Direct video URL, for simple inline instances without JSON
 *   player-title  — Title pill text for direct video-src instances
 *   theme         — "light" (default) | "dark"
 *
 * The JSON config shape:
 *   { title, videoPath, description, tags[], posterPath, loop, autoplay,
 *     hasAudio, allowFullscreen, showControls, downloadPath, youtubeUrl,
 *     overlays: [{ start, end, text[] }] }
 *
 * Public instance API (methods on each <video-player> element):
 *   el.setOverlayConfig(config)       — replace full config
 *   el.getOverlayConfig()             — deep-copy of current config
 *   el.setTitle(text)                 — update the paused-state title pill
 *   el.setDownloadHref(href, filename)— update the download link
 *   el.setYoutubeUrl(url)             — update the youtube link
 */
(function () {
  'use strict';

  /* ——— Internal HTML template for the player's inner DOM ——— */
  var TEMPLATE = [
    '<video playsinline preload="metadata"></video>',
    '<button type="button" class="pill centerPlay" data-role="center-play" aria-label="Play video">',
      '<svg viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true">',
        '<path d="M13.94,49.75l-3.81-2.13V7.62l3.81-2.13,32.5,20v4.26L13.94,49.75ZM15.12,12.1v31.05l25.23-15.53L15.12,12.1Z"/>',
      '</svg>',
      '<span>Play Video</span>',
    '</button>',
    '<div class="pill chromeBar">',
      '<div class="chromeLeft">',
        '<button type="button" class="btn btnPlay" data-role="play" aria-label="Play">',
          '<svg class="iconPlay" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true">',
            '<path d="M13.94,49.75l-3.81-2.13V7.62l3.81-2.13,32.5,20v4.26L13.94,49.75ZM15.12,12.1v31.05l25.23-15.53L15.12,12.1Z"/>',
          '</svg>',
          '<svg class="iconPause" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true">',
            '<path d="M10.12,7.88l-2.25,2.25v35l2.25,2.25h12.5l2.25-2.25V10.12l-2.25-2.25h-12.5ZM20.38,42.88h-8V12.38h8v30.5ZM45.12,7.88h-12.5l-2.25,2.25v35l2.25,2.25h12.5l2.25-2.25V10.12l-2.25-2.25ZM42.88,42.88h-8V12.38h8v30.5Z"/>',
          '</svg>',
        '</button>',
        '<span class="time" data-time="current">0:00</span>',
      '</div>',
      '<div class="timelineWrap">',
        '<div class="timeline">',
          '<div class="track"><div class="fill" data-role="fill"></div></div>',
          '<input type="range" class="scrub" data-role="scrub" min="0" max="1000" step="1" value="0" aria-label="Seek">',
        '</div>',
      '</div>',
      '<div class="chromeRight">',
        '<span class="time" data-time="duration">0:00</span>',
        '<div class="actions">',
          '<button type="button" class="btn" data-role="mute" aria-label="Mute">',
            '<svg class="iconVolumeOn" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M14.19,18.12H5.12l-2,2v15l2,2h9.06l11.9,14.28,3.54-1.28V5.12l-3.54-1.28-11.9,14.28ZM25.62,44.6l-8.96-10.76-1.54-.72H7.12v-11h8l1.54-.72,8.96-10.76v33.95ZM33.12,32.62h4v-10h-4v10ZM40.62,37.62h4v-20h-4v20ZM48.12,12.62v30h4V12.62h-4Z"/></svg>',
            '<svg class="iconVolumeMuted" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M14.19,18.12H5.12l-2,2v15l2,2h9.06l11.9,14.28,3.54-1.28V5.12l-3.54-1.28-11.9,14.28ZM25.62,44.6l-8.96-10.76-1.54-.72H7.12v-11h8l1.54-.72,8.96-10.76v33.95ZM51.11,21.54l-2.83-2.83-5.87,5.87-5.44-5.44-2.83,2.83,5.44,5.44-5.87,5.87,2.83,2.83,5.87-5.87,5.87,5.87,2.83-2.83-5.87-5.87,5.87-5.87Z"/></svg>',
          '</button>',
          '<button type="button" class="btn" data-role="fullscreen" aria-label="Enter fullscreen">',
            '<svg class="iconEnterFullscreen" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M21.03,31.03l-11.41,11.41v-9.82h-4v15l2,2h15v-4h-9.82l11.41-11.41-3.18-3.18ZM45.38,32.62v12.75h-12.75v4.5h15l2.25-2.25v-15h-4.5ZM9.88,9.88h12.75v-4.5H7.62l-2.25,2.25v15h4.5v-12.75ZM34.22,24.22l11.41-11.41v9.82h4V7.62l-2-2h-15v4h9.82l-11.41,11.41,3.18,3.18Z"/></svg>',
            '<svg class="iconExitFullscreen" viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M7.62,30.62v4h9.82l-11.41,11.41,3.18,3.18,11.41-11.41v9.82h4v-15l-2-2H7.62ZM47.62,24.62v-4h-9.82l11.41-11.41-3.18-3.18-11.41,11.41V7.62h-4v15l2,2h15ZM45.38,32.62v12.75h-12.75v4.5h15l2.25-2.25v-15h-4.5ZM9.88,9.88h12.75v-4.5H7.62l-2.25,2.25v15h4.5v-12.75Z"/></svg>',
          '</button>',
        '</div>',
      '</div>',
    '</div>',
    '<div class="pills pillsPlaying" data-role="pills-playing" aria-hidden="true"></div>',
    '<div class="pills pillsPaused" aria-hidden="true">',
      '<span class="pill title" data-role="title">Video</span>',
    '</div>',
    '<div class="links" aria-hidden="true">',
      '<a class="pill link youtube" data-role="youtube" href="#" target="_blank" rel="noopener noreferrer" hidden>',
        '<svg viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M35.38,45.38H9.88v-25.5h15.25v-4.5H7.62l-2.25,2.25v30l2.25,2.25h30l2.25-2.25v-17.5h-4.5v15.25ZM47.62,5.62h-17.5v4h12.32l-23.91,23.91,3.18,3.18,23.91-23.91v12.32h4V7.62l-2-2Z"/></svg>',
        '<span>Watch on Youtube</span>',
      '</a>',
      '<a class="pill link download" data-role="download" href="#" hidden>',
        '<svg viewBox="0 0 55.25 55.25" fill="currentColor" aria-hidden="true"><path d="M47.62,35.12v10H7.62v-10H2.62v12.5l2.5,2.5h45l2.5-2.5v-12.5h-5ZM29.05,39.04l12.49-12.49-2.83-2.83-8.59,8.59V5.12h-5v27.16l-8.58-8.58-2.83,2.83,12.51,12.51h2.83Z"/></svg>',
        '<span>Download Video</span>',
      '</a>',
    '</div>'
  ].join('');

  /**
   * Initializes the player on a root element that already contains the template
   * markup. All DOM queries are scoped to root — supports multiple instances.
   * The config URL is read from root's `data-config` attribute.
   */
  function initCustomVideo(root) {
    var video = root.querySelector('video');
    var btnPlay = root.querySelector('[data-role="play"]');
    var btnCenterPlay = root.querySelector('[data-role="center-play"]');
    var scrub = root.querySelector('[data-role="scrub"]');
    var fill = root.querySelector('[data-role="fill"]');
    var elCurrent = root.querySelector('[data-time="current"]');
    var elDuration = root.querySelector('[data-time="duration"]');
    var pillsPlaying = root.querySelector('[data-role="pills-playing"]');
    var pillTitle = root.querySelector('[data-role="title"]');
    var btnMute = root.querySelector('[data-role="mute"]');
    var btnFullscreen = root.querySelector('[data-role="fullscreen"]');
    var btnDownload = root.querySelector('[data-role="download"]');
    var btnYoutube = root.querySelector('[data-role="youtube"]');

    var dragging = false;
    var progressRafId = null;
    // Lazy-autoplay state: only play autoplay videos while they are on-screen,
    // pause them whenever they leave the viewport, and respect manual pauses.
    var visibilityObserver = null;
    var isVisible = false;
    var userInteracted = false;
    var EMPTY_CONFIG = { title: '', overlays: [], loop: false, autoplay: false, hasAudio: true, allowFullscreen: true, showControls: true };

    function normalizeString(val) {
      return val != null && String(val).trim() !== '' ? String(val).trim() : '';
    }

    function boolAttr(name, fallback) {
      if (!root.hasAttribute(name)) return fallback;
      var value = root.getAttribute(name);
      if (value == null || value === '') return true;
      return !/^(false|0|no)$/i.test(String(value).trim());
    }

    function configFromAttributes() {
      var videoPath = normalizeString(root.getAttribute('video-src') || root.getAttribute('data-video-src'));
      if (!videoPath) return null;
      return {
        title: normalizeString(root.getAttribute('player-title') || root.getAttribute('data-title') || root.getAttribute('title')),
        videoPath: videoPath,
        posterPath: normalizeString(root.getAttribute('poster-path') || root.getAttribute('poster')),
        loop: boolAttr('loop', false),
        autoplay: boolAttr('autoplay', false),
        hasAudio: boolAttr('has-audio', true),
        allowFullscreen: boolAttr('allow-fullscreen', true),
        showControls: boolAttr('show-controls', true),
        downloadPath: normalizeString(root.getAttribute('download-path') || root.getAttribute('download')),
        youtubeUrl: normalizeString(root.getAttribute('youtube-url')),
        overlays: []
      };
    }

    function normalizeConfig(cfg) {
      if (!cfg || typeof cfg !== 'object') cfg = {};
      cfg.title = typeof cfg.title === 'string' ? cfg.title : (cfg.title != null ? String(cfg.title) : '');
      cfg.videoPath = normalizeString(cfg.videoPath);
      cfg.loop = cfg.loop === true;
      cfg.autoplay = cfg.autoplay === true;
      cfg.hasAudio = cfg.hasAudio !== false;
      cfg.allowFullscreen = cfg.allowFullscreen !== false;
      cfg.showControls = cfg.showControls !== false;
      cfg.downloadPath = normalizeString(cfg.downloadPath);
      cfg.youtubeUrl = normalizeString(cfg.youtubeUrl);
      cfg.posterPath = normalizeString(cfg.posterPath);
      cfg.description = normalizeString(cfg.description);
      cfg.tags = Array.isArray(cfg.tags) ? cfg.tags.map(function (t) { return String(t); }) : [];
      cfg.overlays = sortSegments(cfg.overlays);
      return cfg;
    }

    function sortSegments(segments) {
      if (!segments || !segments.length) return [];
      return segments.slice().sort(function (a, b) {
        return (Number(a.start) || 0) - (Number(b.start) || 0);
      });
    }

    var overlayConfig = normalizeConfig(JSON.parse(JSON.stringify(EMPTY_CONFIG)));

    function fetchConfig() {
      var url = root.getAttribute('data-config');
      if (!url) {
        var attrConfig = configFromAttributes();
        if (!attrConfig) { console.warn('video-player: no src, data-config, or video-src attribute on element'); return; }
        overlayConfig = normalizeConfig(attrConfig);
        video.src = overlayConfig.videoPath;
        applyAll();
        return;
      }
      fetch(url).then(function (res) {
        if (!res.ok) { console.warn('video-player: config not found at', url); return; }
        return res.json();
      }).then(function (json) {
        if (!json) return;
        overlayConfig = normalizeConfig(json);
        if (overlayConfig.videoPath) video.src = overlayConfig.videoPath;
        applyAll();
      }).catch(function (err) {
        console.warn('video-player: error loading config', err);
      });
    }

    function applyAll() {
      applyVideoOptions();
      applyTopLinks();
      syncMutedClass();
      syncFullscreenAria();
      renderOverlayPills(overlayTextsAtTime(overlayConfig.overlays, video.currentTime || 0));
      if (video.paused) {
        updatePausedTitle();
      } else {
        updateOverlayPills();
      }
      tryAutoplay();
    }

    /* ——— Fullscreen helpers ——— */

    function getFullscreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement;
    }

    function requestFullscreenEl(el) {
      if (el.requestFullscreen) return el.requestFullscreen();
      if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
      return Promise.reject();
    }

    function exitFullscreenDoc() {
      if (document.exitFullscreen) return document.exitFullscreen();
      if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    }

    /* ——— Apply config to DOM ——— */

    function applyPoster() {
      if (overlayConfig.posterPath) {
        video.setAttribute('poster', overlayConfig.posterPath);
      } else {
        video.removeAttribute('poster');
      }
    }

    function applyVideoOptions() {
      video.loop = overlayConfig.loop === true;
      applyPoster();
      if (overlayConfig.hasAudio === false) {
        btnMute.hidden = true;
        video.muted = true;
      } else {
        btnMute.hidden = false;
      }
      if (overlayConfig.allowFullscreen === false) {
        btnFullscreen.hidden = true;
        if (getFullscreenElement() === root) {
          exitFullscreenDoc();
        }
      } else {
        btnFullscreen.hidden = false;
      }
      root.classList.toggle('noControls', overlayConfig.showControls === false);
      // Lets the CSS delay the paused-state chrome (title pill, center play)
      // on autoplay players, so it doesn't flash during the brief paused
      // window before autoplay starts or when panels swap videos in/out.
      root.classList.toggle('isAutoplay', overlayConfig.autoplay === true);
    }

    function applyTopLinks() {
      var path = overlayConfig.downloadPath;
      if (path) {
        btnDownload.hidden = false;
        btnDownload.href = path;
        var base = path.split(/[/\\]/).pop() || 'download';
        base = base.split('?')[0];
        btnDownload.setAttribute('download', base);
      } else {
        btnDownload.hidden = true;
        btnDownload.removeAttribute('download');
        btnDownload.setAttribute('href', '#');
      }

      var y = overlayConfig.youtubeUrl;
      if (y) {
        btnYoutube.hidden = false;
        btnYoutube.href = y;
      } else {
        btnYoutube.hidden = true;
        btnYoutube.setAttribute('href', '#');
      }
    }

    function tryAutoplay() {
      if (overlayConfig.autoplay !== true) return;
      video.muted = true;
      // Defer actual play() until the element scrolls into view. This keeps
      // pages with many autoplay videos from contending for network and
      // decoder resources (which causes stalls and freezes during seek).
      setupVisibilityObserver();
    }

    function setupVisibilityObserver() {
      if (visibilityObserver) return;
      if (typeof IntersectionObserver === 'undefined') {
        // Fallback: just play immediately on browsers without IO.
        isVisible = true;
        syncAutoplayVisibility();
        return;
      }
      visibilityObserver = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          isVisible = entries[i].isIntersecting;
          syncAutoplayVisibility();
        }
      }, { threshold: 0.01 });
      visibilityObserver.observe(root);
    }

    function syncAutoplayVisibility() {
      if (overlayConfig.autoplay !== true) return;
      if (!document.hidden && isVisible) {
        if (!userInteracted && video.paused) {
          video.muted = true;
          video.play().catch(function () {});
        }
      } else if (!video.paused) {
        video.pause();
      }
    }

    document.addEventListener('visibilitychange', syncAutoplayVisibility);

    /* ——— Overlay pills ——— */

    function overlayTextsAtTime(segments, t) {
      if (!segments || !segments.length) return null;
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var start = Number(seg.start);
        if (isNaN(start)) start = 0;
        var end = seg.end;
        if (end === null || end === undefined) {
          end = Infinity;
        } else {
          end = Number(end);
          if (isNaN(end)) end = Infinity;
        }
        if (t >= start && t < end) {
          return Array.isArray(seg.text) ? seg.text : [];
        }
      }
      return null;
    }

    function renderOverlayPills(texts) {
      while (pillsPlaying.firstChild) {
        pillsPlaying.removeChild(pillsPlaying.firstChild);
      }
      if (!texts) return;
      for (var i = 0; i < texts.length; i++) {
        var span = document.createElement('span');
        span.className = 'pill overlay';
        span.textContent = String(texts[i]);
        pillsPlaying.appendChild(span);
      }
    }

    function updatePausedTitle() {
      var t = overlayConfig.title && overlayConfig.title.trim() !== ''
        ? overlayConfig.title
        : '';
      if (t) {
        pillTitle.textContent = t;
        pillTitle.hidden = false;
      } else {
        pillTitle.textContent = '';
        pillTitle.hidden = true;
      }
    }

    function updateOverlayPills() {
      if (video.paused) return;
      var texts = overlayTextsAtTime(overlayConfig.overlays, video.currentTime);
      if (texts) renderOverlayPills(texts);
    }

    /* ——— Timeline / progress ——— */

    function formatTime(sec) {
      if (!isFinite(sec) || sec < 0) return '0:00';
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function stopProgressLoop() {
      if (progressRafId != null) {
        cancelAnimationFrame(progressRafId);
        progressRafId = null;
      }
    }

    function applyProgressFromVideo() {
      if (!video.duration || dragging) return;
      var t = video.currentTime;
      var d = video.duration;
      scrub.value = String((t / d) * 1000);
      fill.style.width = (t / d) * 100 + '%';
      elCurrent.textContent = formatTime(t);
    }

    function progressLoop() {
      progressRafId = null;
      if (video.paused || dragging || !video.duration) return;
      applyProgressFromVideo();
      progressRafId = requestAnimationFrame(progressLoop);
    }

    function startProgressLoop() {
      stopProgressLoop();
      if (!video.paused && !dragging && video.duration) {
        progressRafId = requestAnimationFrame(progressLoop);
      }
    }

    /* ——— UI state ——— */

    function setPlayingUi(playing) {
      root.classList.toggle('isPlaying', playing);
      btnPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      if (playing) {
        updateOverlayPills();
      } else {
        updatePausedTitle();
      }
    }

    function togglePlay() {
      userInteracted = true;
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    }

    function syncMutedClass() {
      if (btnMute.hidden) return;
      root.classList.toggle('isMuted', video.muted);
      btnMute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    }

    function syncFullscreenAria() {
      if (btnFullscreen.hidden) return;
      var fs = getFullscreenElement() === root;
      btnFullscreen.setAttribute('aria-label', fs ? 'Exit fullscreen' : 'Enter fullscreen');
    }

    /* ——— Event listeners (all scoped to root or its children) ——— */

    btnPlay.addEventListener('click', function (e) { e.stopPropagation(); togglePlay(); });
    btnCenterPlay.addEventListener('click', function (e) { e.stopPropagation(); userInteracted = true; if (video.paused) video.play().catch(function () {}); });

    btnMute.addEventListener('click', function (e) {
      e.stopPropagation();
      if (overlayConfig.hasAudio === false) return;
      video.muted = !video.muted;
      syncMutedClass();
    });

    video.addEventListener('volumechange', syncMutedClass);

    btnFullscreen.addEventListener('click', function (e) {
      e.stopPropagation();
      if (overlayConfig.allowFullscreen === false) return;
      if (!getFullscreenElement()) {
        requestFullscreenEl(root).catch(function () {});
      } else {
        exitFullscreenDoc();
      }
    });

    function onFullscreenChange() { syncFullscreenAria(); }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    video.addEventListener('click', function (e) { e.preventDefault(); togglePlay(); });
    video.addEventListener('play', function () { setPlayingUi(true); startProgressLoop(); });
    video.addEventListener('pause', function () { stopProgressLoop(); setPlayingUi(false); applyProgressFromVideo(); });

    video.addEventListener('loadedmetadata', function () {
      elDuration.textContent = formatTime(video.duration);
      applyProgressFromVideo();
      tryAutoplay();
      if (video.paused) { updatePausedTitle(); } else { updateOverlayPills(); startProgressLoop(); }
    });

    video.addEventListener('timeupdate', function () { updateOverlayPills(); });

    video.addEventListener('ended', function () {
      stopProgressLoop();
      setPlayingUi(false);
      scrub.value = '0';
      fill.style.width = '0%';
      elCurrent.textContent = formatTime(0);
      updatePausedTitle();
    });

    scrub.addEventListener('pointerdown', function () { dragging = true; userInteracted = true; stopProgressLoop(); });
    scrub.addEventListener('pointerup', function () { dragging = false; applyProgressFromVideo(); if (!video.paused) startProgressLoop(); });
    scrub.addEventListener('pointercancel', function () { dragging = false; applyProgressFromVideo(); if (!video.paused) startProgressLoop(); });

    scrub.addEventListener('input', function () {
      if (!video.duration) return;
      var t = (Number(scrub.value) / 1000) * video.duration;
      video.currentTime = t;
      fill.style.width = (t / video.duration) * 100 + '%';
      elCurrent.textContent = formatTime(t);
      if (!video.paused) updateOverlayPills();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); togglePlay(); }
    });

    /* ——— Per-instance public API (attached to the element itself) ——— */

    root.setOverlayConfig = function (config) {
      overlayConfig = normalizeConfig(config);
      if (overlayConfig.videoPath && video.src !== overlayConfig.videoPath) video.src = overlayConfig.videoPath;
      applyAll();
    };
    root.getOverlayConfig = function () {
      return JSON.parse(JSON.stringify(overlayConfig));
    };
    root.setTitle = function (text) {
      overlayConfig.title = text != null ? String(text) : '';
      if (video.paused) updatePausedTitle();
    };
    root.setDownloadHref = function (href, filename) {
      overlayConfig.downloadPath = href != null && String(href).trim() !== '' ? String(href).trim() : '';
      applyTopLinks();
      if (filename && !btnDownload.hidden) btnDownload.setAttribute('download', filename);
    };
    root.setYoutubeUrl = function (url) {
      overlayConfig.youtubeUrl = url != null && String(url).trim() !== '' ? String(url).trim() : '';
      applyTopLinks();
    };

    /* ——— Boot: fetch config, then apply ——— */
    fetchConfig();
  }

  /* ——— Custom element registration ——— */

  class VideoPlayer extends HTMLElement {
    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      this.innerHTML = TEMPLATE;

      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');

      // Map the public `src` attribute to the internal `data-config` convention
      // so the existing fetch logic keeps working unchanged.
      var src = this.getAttribute('src');
      if (src) this.setAttribute('data-config', src);

      initCustomVideo(this);
    }
  }

  if (!customElements.get('video-player')) {
    customElements.define('video-player', VideoPlayer);
  }
})();
