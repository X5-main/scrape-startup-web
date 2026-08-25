/*
  Table-of-contents scroll-spy.

  On the desktop blog layout (≥ 1200px) the table of contents sits in the
  sticky sidebar while the body scrolls. This script bolds the TOC entry for
  the section currently in view by adding `.is-active` to its link.

  Each TOC link is an `<a href="#section-id">`; we match it to the heading with
  that id in the body. As the page scrolls, the active section is the last
  heading whose top has passed an offset line near the top of the viewport.

  Below the desktop breakpoint the TOC collapses into the stacked column, so we
  clear all active state and do nothing.
*/
(function () {
  var DESKTOP = '(min-width: 1200px)';
  var OFFSET = 120; // px from the top of the viewport that marks "current"

  var links = [];
  var sections = [];

  function collect() {
    links = [];
    sections = [];
    var anchors = document.querySelectorAll('.table-of-contents-list a[href^="#"]');
    Array.prototype.forEach.call(anchors, function (a) {
      var id = a.getAttribute('href').slice(1);
      var target = id && document.getElementById(id);
      if (target) {
        links.push(a);
        sections.push(target);
      }
    });
  }

  function clearActive() {
    links.forEach(function (a) {
      a.classList.remove('is-active');
    });
  }

  function update() {
    if (!window.matchMedia(DESKTOP).matches) {
      clearActive();
      return;
    }
    if (!sections.length) return;

    var activeIndex = 0;
    sections.forEach(function (section, i) {
      if (section.getBoundingClientRect().top - OFFSET <= 0) {
        activeIndex = i;
      }
    });

    // At the very bottom of the page, highlight the final section even if its
    // heading never reached the offset line (short last section).
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      activeIndex = sections.length - 1;
    }

    links.forEach(function (a, i) {
      a.classList.toggle('is-active', i === activeIndex);
    });
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      update();
    });
  }

  collect();
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  // Re-run once webfonts settle, since they shift heading positions.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update);
  }
})();
