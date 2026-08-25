/*
  Sidenote-style footnote positioning.

  On the desktop blog layout (≥ 1200px) the footnotes live in their own
  column. This script positions each `.post-footnote` so its top aligns with
  the reference marker that points to it (an `<a href="#fn-id">` in the body),
  then nudges any that would collide downward so they never overlap.

  Full-width breakout figures/videos (`.post-full-width`) extend out of the
  content column and paint over the footnotes column (they have a solid
  background and sit above it). A note whose natural position falls within one
  of these would be hidden beneath the figure, so we treat those figures as
  obstacles and snap the note into the gap above the figure (keeping it near
  its marker) or, if there's no room, below it.

  On smaller screens the footnotes column collapses into the single stacked
  column, so we leave the notes in normal document flow.
*/
(function () {
  var DESKTOP = '(min-width: 1200px)';
  var GAP = 16; // minimum vertical gap (px) between stacked notes
  var OBSTACLE_MARGIN = 20; // clearance around full-width breakout figures

  function layout() {
    var column = document.querySelector('.post-footnotes');
    if (!column) return;

    var notes = Array.prototype.slice.call(
      column.querySelectorAll('.post-footnote')
    );
    if (!notes.length) return;

    // Always start from a clean, in-flow state.
    notes.forEach(function (note) {
      note.style.position = '';
      note.style.top = '';
      note.style.left = '';
      note.style.right = '';
    });
    column.style.position = '';

    // Stacked layout (tablet/mobile): leave notes in normal flow.
    if (!window.matchMedia(DESKTOP).matches) return;

    column.style.position = 'relative';
    var columnRect = column.getBoundingClientRect();
    var columnTop = columnRect.top;

    var bands = collectObstacles(columnRect, columnTop);

    // Read phase: find each note's desired top from its reference marker.
    var items = notes.map(function (note) {
      var ref = document.querySelector('a[href="#' + note.id + '"]');
      var offset = parseFloat(note.getAttribute('data-footnote-offset')) || 0;
      var target = ref
        ? ref.getBoundingClientRect().top - columnTop + offset
        : 0;
      return { note: note, target: Math.max(0, target) };
    });

    items.sort(function (a, b) {
      return a.target - b.target;
    });

    // Write phase: place each note, avoiding both previous notes and the
    // full-width figure bands.
    var prevBottom = 0;
    items.forEach(function (item) {
      var note = item.note;
      note.style.position = 'absolute';
      note.style.left = 'var(--footnote-inset-left, 10px)';
      note.style.right = 'var(--footnote-inset-right, 20px)';
      var height = note.offsetHeight;
      var top = resolveTop(item.target, height, prevBottom, bands);
      note.style.top = top + 'px';
      prevBottom = top + height + GAP;
    });
  }

  // Full-width breakout figures/videos that horizontally overlap the footnotes
  // column, returned as merged, sorted vertical bands (relative to the column
  // top) that notes must avoid.
  function collectObstacles(columnRect, columnTop) {
    var obstacles = [];
    var breakouts = document.querySelectorAll('.post-content .post-full-width');
    Array.prototype.forEach.call(breakouts, function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Only figures that actually reach into the footnotes column matter.
      if (r.right <= columnRect.left || r.left >= columnRect.right) return;
      obstacles.push({
        top: r.top - columnTop - OBSTACLE_MARGIN,
        bottom: r.bottom - columnTop + OBSTACLE_MARGIN,
      });
    });

    obstacles.sort(function (a, b) {
      return a.top - b.top;
    });

    // Merge overlapping/adjacent bands so a note is never trapped oscillating
    // between two figures that are effectively one obstacle.
    var bands = [];
    obstacles.forEach(function (o) {
      var last = bands[bands.length - 1];
      if (last && o.top <= last.bottom) {
        last.bottom = Math.max(last.bottom, o.bottom);
      } else {
        bands.push({ top: o.top, bottom: o.bottom });
      }
    });
    return bands;
  }

  // Choose a top that sits below the previous note, as close to the marker as
  // possible, and clear of every figure band. When the natural spot lands on a
  // figure, snap into the gap above it (if the marker is at/above the figure
  // and there's room) or drop below it otherwise.
  function resolveTop(target, height, prevBottom, bands) {
    var top = Math.max(target, prevBottom);
    for (var guard = 0; guard < 50; guard++) {
      var hit = null;
      for (var i = 0; i < bands.length; i++) {
        var b = bands[i];
        if (top < b.bottom && top + height > b.top) {
          hit = b;
          break;
        }
      }
      if (!hit) break;

      var above = hit.top - GAP - height;
      if (above >= prevBottom && target <= hit.bottom) {
        top = above; // fits above the figure — keep the note near its marker
      } else {
        top = hit.bottom + GAP; // otherwise place it below the figure
      }
    }
    return top;
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      layout();
    });
  }

  window.addEventListener('load', layout);
  window.addEventListener('resize', schedule);

  // Re-run once webfonts settle, since they change text height/positions.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }
})();
