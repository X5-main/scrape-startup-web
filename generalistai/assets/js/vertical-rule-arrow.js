'use strict';

/**
 * Fade the downward-pointing arrowhead at the bottom of the right vertical
 * rule out when the user has scrolled to the very bottom of the page; fade
 * it back in as they scroll up. The arrow tells the reader "there's more
 * below", so once there isn't, it should disappear.
 *
 * scroll position vs page height is read inside requestAnimationFrame so
 * we never do layout work more than once per frame.
 */
(function () {
  var arrow = document.querySelector('.vertical-rule-arrow');
  if (!arrow) return;

  // 2px tolerance covers sub-pixel rounding + the ~1px iOS rubber-band gap.
  var BOTTOM_TOLERANCE = 2;
  var ticking = false;

  function update() {
    ticking = false;
    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - BOTTOM_TOLERANCE;
    arrow.classList.toggle('is-faded', atBottom);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
