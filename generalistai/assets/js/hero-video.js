'use strict';

/**
 * Homepage hero reel.
 *
 * Reads the playlist embedded in the page (data/index-hero-videos.json),
 * shuffles it on every load so the order is fresh, and reorders so that no two
 * clips of the same task sit next to each other (e.g. shirt-fold-1 is never
 * directly before/after shirt-fold-2). The clips then play back-to-back like
 * one video with jump cuts, looping the same randomized sequence forever.
 *
 * Playback is double-buffered across two stacked <video> layers: while one
 * plays, the next clip is preloaded (and its first frame decoded) in the
 * hidden layer, then swapped in instantly. That gives a clean jump cut with no
 * poster/black flash between clips.
 */

(function () {
  var reel = document.querySelector('[data-hero-reel]');
  var dataEl = document.querySelector('[data-hero-videos]');
  if (!reel || !dataEl) return;

  var layers = reel.querySelectorAll('video');
  if (layers.length < 2) return;

  var playlist;
  try {
    playlist = JSON.parse(dataEl.textContent || '[]');
  } catch (e) {
    return;
  }
  if (!Array.isArray(playlist) || playlist.length === 0) return;

  // "task" = the clip's filename without its trailing "-<number>" and
  // extension, so shirt-fold-1.mp4 and shirt-fold-2.mp4 share the task
  // "shirt-fold" and are treated as the same kind of clip.
  function taskOf(item) {
    var file = String(item.video || '').split('/').pop();
    return file.replace(/\.[^.]+$/, '').replace(/-\d+$/, '');
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function noAdjacentSameTask(arr) {
    for (var i = 1; i < arr.length; i++) {
      if (taskOf(arr[i]) === taskOf(arr[i - 1])) return false;
    }
    return true;
  }

  // Greedy fallback that guarantees a valid order when one exists: always
  // place a clip from the task with the most remaining clips, excluding the
  // task we just placed. Buckets and ties are randomized to keep variety.
  function greedyArrange(items) {
    var buckets = {};
    items.forEach(function (item) {
      var key = taskOf(item);
      (buckets[key] = buckets[key] || []).push(item);
    });
    Object.keys(buckets).forEach(function (k) {
      buckets[k] = shuffle(buckets[k]);
    });

    var result = [];
    var lastTask = null;
    for (var n = 0; n < items.length; n++) {
      var keys = Object.keys(buckets).filter(function (k) {
        return buckets[k].length > 0 && k !== lastTask;
      });
      if (keys.length === 0) {
        keys = Object.keys(buckets).filter(function (k) {
          return buckets[k].length > 0;
        });
        if (keys.length === 0) break;
      }
      keys.sort(function (a, b) { return buckets[b].length - buckets[a].length; });
      var top = keys.filter(function (k) {
        return buckets[k].length === buckets[keys[0]].length;
      });
      var chosen = top[Math.floor(Math.random() * top.length)];
      result.push(buckets[chosen].pop());
      lastTask = chosen;
    }
    return result;
  }

  function buildSequence(items) {
    for (var attempt = 0; attempt < 200; attempt++) {
      var candidate = shuffle(items);
      if (noAdjacentSameTask(candidate)) return candidate;
    }
    return greedyArrange(items);
  }

  var sequence = buildSequence(playlist);
  var index = 0; // currently playing clip
  var activeLayer = 0;
  var indexVideosLoaded = false;
  var prefetched = false;
  var objectUrlPromises = {};
  var layerReady = [false, false];
  var layerPromises = [null, null];

  // Download the whole clip before assigning it to a <video>. The poster stays
  // visible until the first two clips are fully available, which avoids starting
  // playback from a half-buffered MP4 on slow connections.
  function fetchClipUrl(clip) {
    if (!clip || !clip.video) return Promise.reject(new Error('Missing clip'));
    if (objectUrlPromises[clip.video]) return objectUrlPromises[clip.video];

    objectUrlPromises[clip.video] = fetch(clip.video, { cache: 'force-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to fetch clip');
        return res.blob();
      })
      .then(function (blob) {
        return URL.createObjectURL(blob);
      })
      .catch(function () {
        // Last-resort fallback: direct video URL. The poster still prevents an
        // empty box, and waitForReady keeps us from swapping before decode starts.
        return clip.video;
      });

    return objectUrlPromises[clip.video];
  }

  function waitForReady(layer) {
    return new Promise(function (resolve) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        layer.removeEventListener('canplaythrough', finish);
        layer.removeEventListener('canplay', finish);
        layer.removeEventListener('loadeddata', finish);
        layer.removeEventListener('error', finish);
        resolve();
      }

      if (layer.readyState >= 3) return finish();
      layer.addEventListener('canplaythrough', finish);
      layer.addEventListener('canplay', finish);
      layer.addEventListener('loadeddata', finish);
      layer.addEventListener('error', finish);
    });
  }

  function setLayerClip(layer, clip, src) {
    if (clip.poster) layer.poster = clip.poster;
    layer.preload = 'auto';
    layer.src = src;
    layer.load();
  }

  function prepareLayer(layerIndex, clip) {
    var layer = layers[layerIndex];
    layerReady[layerIndex] = false;
    layerPromises[layerIndex] = fetchClipUrl(clip)
      .then(function (src) {
        setLayerClip(layer, clip, src);
        return waitForReady(layer);
      })
      .then(function () {
        layerReady[layerIndex] = true;
      });
    return layerPromises[layerIndex];
  }

  function activate(layer) {
    var p = layer.play();
    if (p && typeof p.catch === 'function') return p.catch(function () {});
    return p || Promise.resolve();
  }

  function loadIndexVideos() {
    if (indexVideosLoaded) return;
    indexVideosLoaded = true;

    var videos = document.querySelectorAll('[data-index-video]');
    videos.forEach(function (video) {
      var src = video.getAttribute('data-src');
      if (!src || video.src) return;
      video.src = src;
      video.preload = 'metadata';
      video.load();
      var p = video.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    });
  }

  function afterHeroStarted() {
    loadIndexVideos();

    if (prefetched) return;
    prefetched = true;
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;

    fetchClipUrl(sequence[2 % sequence.length]);
    var warm = function () { prefetchAll(sequence.slice(3)); };
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warm, { timeout: 3000 });
    } else {
      window.setTimeout(warm, 1500);
    }
  }

  layers.forEach(function (layer) {
    layer.muted = true;
    layer.loop = false;
    layer.addEventListener('ended', function () {
      // Only the visible layer drives advancement.
      if (layer !== layers[activeLayer]) return;

      var nextLayer = activeLayer === 0 ? 1 : 0;
      var incoming = layers[nextLayer];

      function swap() {
        try { incoming.currentTime = 0; } catch (e) {}
        activate(incoming);
        incoming.classList.add('is-active');
        layer.classList.remove('is-active');

        activeLayer = nextLayer;
        index = (index + 1) % sequence.length;

        // Fully download and decode the clip after this one into the now-hidden
        // layer before the next swap can occur.
        prepareLayer(activeLayer === 0 ? 1 : 0, sequence[(index + 1) % sequence.length]);
      }

      if (layerReady[nextLayer]) {
        swap();
      } else if (layerPromises[nextLayer]) {
        layerPromises[nextLayer].then(swap);
      }
    });
  });

  // Warm the HTTP cache for every clip in the background so each jump cut
  // pulls from cache instantly. We only decode two clips at a time (the two
  // <video> layers), but we download all of them up front. Reading each
  // response to completion is what actually populates the cache; a small
  // concurrency pool fetches them quickly without starving the playing clip.
  function prefetchAll(clips) {
    var urls = [];
    var seen = {};
    function add(url) {
      if (url && !seen[url]) {
        seen[url] = true;
        urls.push(url);
      }
    }
    clips.forEach(function (c) { add(c && c.video); });

    var i = 0;
    var POOL = 1;
    function next() {
      if (i >= urls.length) return;
      var url = urls[i++];
      fetch(url, { cache: 'force-cache' })
        .then(function (res) { return res.blob(); })
        .catch(function () {})
        .then(next);
    }
    for (var k = 0; k < Math.min(POOL, urls.length); k++) next();
  }

  // Kick things off only after the first two clips are fully downloaded and
  // ready. Until then the high-priority poster stays visible.
  layers[0].addEventListener('playing', afterHeroStarted, { once: true });
  Promise.all([
    prepareLayer(0, sequence[0]),
    prepareLayer(1, sequence[1 % sequence.length]),
  ]).then(function () {
    try { layers[0].currentTime = 0; } catch (e) {}
    activate(layers[0]).then(afterHeroStarted);
  });

  // Fallback: if autoplay stalls, still load the lower videos after the page
  // has had a chance to paint the hero poster.
  window.addEventListener('load', function () {
    window.setTimeout(loadIndexVideos, 3000);
  }, { once: true });
})();
