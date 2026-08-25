'use strict';

(function () {
  var ratios = [
    { css: '4 / 3', value: 4 / 3 },
    { css: '3 / 2', value: 3 / 2 },
    { css: '16 / 9', value: 16 / 9 },
  ];

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function readNumber(styles, name, fallback) {
    var value = parseInt(styles.getPropertyValue(name), 10);
    return Number.isFinite(value) ? value : fallback;
  }

  function measureLength(container, value, fallback) {
    var probe = document.createElement('div');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.width = value;
    container.appendChild(probe);

    var width = probe.getBoundingClientRect().width;
    probe.remove();

    return Number.isFinite(width) && width > 0 ? width : fallback;
  }

  function relativeRect(rect, parentRect) {
    return {
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      right: rect.right - parentRect.left,
      bottom: rect.bottom - parentRect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function expandRect(rect, distance) {
    return {
      left: rect.left - distance,
      top: rect.top - distance,
      right: rect.right + distance,
      bottom: rect.bottom + distance,
    };
  }

  function overlaps(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function createCandidate(bounds, minWidth, maxWidth, edgeBleed) {
    var ratio = randomItem(ratios);
    var width = randomBetween(minWidth, maxWidth);
    var height = width / ratio.value;
    var left = randomBetween(-edgeBleed, bounds.width - width + edgeBleed);
    var top = randomBetween(-edgeBleed, bounds.height - height + edgeBleed);

    return {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height,
      width: width,
      height: height,
      ratio: ratio.css,
    };
  }

  function canPlace(candidate, placed, contentClearance, photoGap) {
    if (overlaps(candidate, contentClearance)) return false;

    return placed.every(function (rect) {
      return !overlaps(candidate, expandRect(rect, photoGap));
    });
  }

  function place(container) {
    var photos = Array.prototype.slice.call(container.querySelectorAll('.home-cta-photo'));
    var content = container.querySelector('.home-cta-content');
    if (!photos.length) return;

    var containerRect = container.getBoundingClientRect();
    var styles = window.getComputedStyle(container);
    var minWidth = measureLength(container, styles.getPropertyValue('--cta-photo-min-width'), 80);
    var maxWidth = measureLength(container, styles.getPropertyValue('--cta-photo-max-width'), 208);
    var contentDistance = measureLength(
      container,
      styles.getPropertyValue('--cta-photo-content-distance'),
      20
    );
    var photoGap = measureLength(container, styles.getPropertyValue('--cta-photo-gap'), 12);
    var edgeBleed = measureLength(container, styles.getPropertyValue('--cta-photo-edge-bleed'), 16);
    var minCount = readNumber(styles, '--cta-photo-min-count', 5);
    var maxCount = readNumber(styles, '--cta-photo-max-count', 7);
    var count = Math.min(
      photos.length,
      randomInt(Math.min(minCount, maxCount), Math.max(minCount, maxCount))
    );
    var contentRect = content
      ? relativeRect(content.getBoundingClientRect(), containerRect)
      : { left: containerRect.width / 2, top: containerRect.height / 2, right: containerRect.width / 2, bottom: containerRect.height / 2 };
    var contentClearance = expandRect(contentRect, contentDistance);
    var placed = [];

    maxWidth = Math.max(minWidth, Math.min(maxWidth, containerRect.width * 0.45));

    photos.forEach(function (photo) {
      photo.classList.remove('is-placed');
      photo.removeAttribute('style');
    });

    shuffle(photos).slice(0, count).forEach(function (photo) {
      var candidate = null;

      for (var attempt = 0; attempt < 140; attempt++) {
        var next = createCandidate(containerRect, minWidth, maxWidth, edgeBleed);
        if (canPlace(next, placed, contentClearance, photoGap)) {
          candidate = next;
          break;
        }
      }

      if (!candidate) return;

      placed.push(candidate);
      photo.style.setProperty('--cta-photo-left', candidate.left.toFixed(1) + 'px');
      photo.style.setProperty('--cta-photo-top', candidate.top.toFixed(1) + 'px');
      photo.style.setProperty('--cta-photo-width', candidate.width.toFixed(1) + 'px');
      photo.style.setProperty('--cta-photo-ratio', candidate.ratio);
      photo.classList.add('is-placed');
    });
  }

  function boot() {
    var collages = Array.prototype.slice.call(document.querySelectorAll('[data-interested-collage]'));
    collages.forEach(place);

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        collages.forEach(place);
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
