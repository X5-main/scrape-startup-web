/*
  Clickable position rows. Each row in the careers table carries a data-href
  pointing at its job listing; clicking (or pressing Enter on) the row navigates
  there. The hover/focus styling lives in styles.css.
*/
(function () {
  var rows = document.querySelectorAll('.careers-table tbody tr[data-href]');

  Array.prototype.forEach.call(rows, function (row) {
    var href = row.getAttribute('data-href');

    // Expose the row as a link to keyboard and assistive tech.
    row.setAttribute('role', 'link');
    row.setAttribute('tabindex', '0');

    row.addEventListener('click', function () {
      window.location.href = href;
    });

    row.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        window.location.href = href;
      }
    });
  });

  // ---- Filtering -----------------------------------------------------------
  // The sidebar <select>s carry data-filter="department|location|type". Each
  // row carries data-department / data-type / data-locations ("SFO|BOS"). We
  // hide rows that don't match every active filter, then update the count.
  var selects = document.querySelectorAll('.careers-filters select[data-filter]');
  var count = document.querySelector('.careers-count');
  var empty = document.querySelector('.careers-empty');
  var clearFilters = document.querySelector('[data-clear-filters]');
  if (!selects.length || !rows.length) return;

  function applyFilters() {
    var dept = '';
    var loc = '';
    var type = '';
    Array.prototype.forEach.call(selects, function (sel) {
      var kind = sel.getAttribute('data-filter');
      if (kind === 'department') dept = sel.value;
      else if (kind === 'location') loc = sel.value;
      else if (kind === 'type') type = sel.value;
    });

    var hasFilters = !!(dept || loc || type);

    var visible = 0;
    Array.prototype.forEach.call(rows, function (row) {
      var locs = (row.getAttribute('data-locations') || '').split('|');
      var match =
        (!dept || row.getAttribute('data-department') === dept) &&
        (!type || row.getAttribute('data-type') === type) &&
        (!loc || locs.indexOf(loc) !== -1);
      row.hidden = !match;
      if (match) visible++;
    });

    if (count) {
      var total = parseInt(count.getAttribute('data-total'), 10);
      var noun = visible === 1 ? 'position' : 'positions';
      count.textContent =
        visible === total ? total + ' open ' + noun : visible + ' of ' + total + ' open ' + noun;
    }
    if (empty) empty.hidden = visible !== 0;
    if (clearFilters) clearFilters.hidden = !hasFilters;
  }

  Array.prototype.forEach.call(selects, function (sel) {
    sel.addEventListener('change', applyFilters);
  });
  if (clearFilters) {
    clearFilters.addEventListener('click', function () {
      Array.prototype.forEach.call(selects, function (sel) {
        sel.value = '';
      });
      applyFilters();
    });
  }
  applyFilters();
})();
