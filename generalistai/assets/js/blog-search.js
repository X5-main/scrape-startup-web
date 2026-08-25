// Client-side blog search for /blog. Pure DOM filtering — no server round-trip,
// no separate search index, no new route. Reads a pre-built lowercased haystack
// off each `.blog-entry`'s `data-search` attribute (composed in blog-card.ejs
// from title + abstract + author + category + date + body) and toggles the
// `hidden` attribute on cards whose haystack doesn't contain every whitespace-
// separated token of the current query.
//
// Tokenized AND on substrings gives "do what I mean" handling for hyphenated
// terms (`gen-1` is one token, matched literally) and avoids the hyphen-
// tokenizer flood the old prototype had to special-case.
//
// UX mirrors the old prototype's BlogSearchForm: explicit submit (not live
// filter), with a trailing button that morphs through three states based on
// whether the typed value matches the currently-applied query:
//
//   1. Input empty                   → no button (`hidden` on the button)
//   2. Value differs from applied    → "→" submit button (Enter or click applies)
//   3. Value equals applied (non-'') → "X"  clear  button (Enter is a no-op,
//                                            click clears + reruns the filter)
//
// URL state: every submit and clear pushes a new history entry that mirrors
// the applied query as `?q=...`. A shared link like /blog?q=pete (or
// /blog/research?q=pete on a category page) lands the visitor directly on
// the filtered results, and browser back/forward navigates between search
// states without a page reload.
//
// Note on event wiring: we DO NOT rely on the parent form's `submit` event.
// Across browsers there are subtle quirks around when a form's submit event
// fires (input type, button visibility, etc.) that bit us during development.
// Instead, we drive everything from two direct handlers — Enter-keydown on
// the input, and click on the button — and only use the surrounding <form>
// for semantics + as a backstop (preventDefault on submit so a stray event
// from the browser never navigates away).
(function () {
  var DEBUG = false; // flip to true to trace events in the console

  function log() {
    if (!DEBUG) return;
    var args = ['[blog-search]'].concat(Array.prototype.slice.call(arguments));
    try { console.log.apply(console, args); } catch (e) { /* ignore */ }
  }

  function init() {
    log('init: running');
    var form = document.querySelector('.blog-search-form');
    var input = document.querySelector('.blog-search');
    var button = document.querySelector('.blog-search-button');
    var iconSubmit = document.querySelector('.blog-search-icon[data-mode="submit"]');
    var iconClear = document.querySelector('.blog-search-icon[data-mode="clear"]');
    var list = document.querySelector('.blog-list');
    if (!form || !input || !button || !iconSubmit || !iconClear || !list) {
      log('init: missing element, aborting', { form: !!form, input: !!input, button: !!button, iconSubmit: !!iconSubmit, iconClear: !!iconClear, list: !!list });
      return;
    }

    var entries = Array.prototype.slice.call(list.querySelectorAll('.blog-entry'));
    if (!entries.length) return;
    log('init: ' + entries.length + ' entries, attaching listeners');

    var appliedQuery = '';

    var empty = document.createElement('p');
    empty.className = 'blog-empty';
    empty.setAttribute('data-search-empty', '');
    empty.hidden = true;
    list.appendChild(empty);

    // ---- URL ↔ filter sync ------------------------------------------------
    //
    // The query lives in `?q=` on the current path. We never change the path
    // itself (a category like /blog/research stays put when you search), so
    // a bookmark of /blog/research?q=pete still scopes the search to research
    // posts (the server renders category-filtered cards; we narrow further).

    function getQueryFromURL() {
      try { return new URL(window.location.href).searchParams.get('q') || ''; }
      catch (e) { return ''; }
    }

    function syncQueryToURL(query, mode) {
      // mode: 'push' (creates a history entry) or 'replace' (silently
      // updates the current entry, used on initial load to canonicalize).
      var url;
      try { url = new URL(window.location.href); }
      catch (e) { return; }
      if (query) url.searchParams.set('q', query);
      else url.searchParams.delete('q');
      var newUrl = url.pathname + (url.search || '') + (url.hash || '');
      // Only touch history when the URL is actually changing, so spurious
      // submits with the same query don't clutter the back stack.
      if (newUrl === window.location.pathname + window.location.search + window.location.hash) return;
      try {
        if (mode === 'replace') history.replaceState({ q: query }, '', newUrl);
        else history.pushState({ q: query }, '', newUrl);
        log('history.' + mode + 'State ->', newUrl);
      } catch (e) { /* old browsers / restricted contexts: ignore */ }
    }

    function updateButton() {
      var value = input.value.trim();
      if (value === '' && appliedQuery === '') {
        button.hidden = true;
        return;
      }
      button.hidden = false;
      if (value === appliedQuery && value !== '') {
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Clear search');
        iconSubmit.hidden = true;
        iconClear.hidden = false;
      } else {
        button.setAttribute('type', 'submit');
        button.setAttribute('aria-label', 'Search');
        iconSubmit.hidden = false;
        iconClear.hidden = true;
      }
    }

    function applyFilter() {
      var tokens = appliedQuery.toLowerCase().split(/\s+/).filter(Boolean);
      var visibleCount = 0;
      for (var i = 0; i < entries.length; i++) {
        var el = entries[i];
        var hay = el.getAttribute('data-search') || '';
        var match = true;
        for (var t = 0; t < tokens.length; t++) {
          if (hay.indexOf(tokens[t]) === -1) { match = false; break; }
        }
        el.hidden = !match;
        if (match) visibleCount++;
      }
      if (tokens.length > 0 && visibleCount === 0) {
        empty.textContent = 'No posts match \u201C' + appliedQuery + '\u201D.';
        empty.hidden = false;
      } else {
        empty.hidden = true;
      }
      log('applyFilter:', { query: appliedQuery, tokens: tokens, visible: visibleCount });
    }

    function doSubmit() {
      appliedQuery = input.value.trim();
      log('doSubmit:', appliedQuery);
      applyFilter();
      updateButton();
      syncQueryToURL(appliedQuery, 'push');
    }

    function clearSearch() {
      log('clearSearch');
      input.value = '';
      appliedQuery = '';
      applyFilter();
      updateButton();
      syncQueryToURL('', 'push');
      input.focus();
    }

    // Enter on the input runs submit directly — independent of any form
    // submit event quirks. preventDefault stops the form from submitting
    // (which would navigate to /blog?q=... and wipe state).
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        log('keydown Enter');
        e.preventDefault();
        doSubmit();
      }
    });

    // Click on the trailing button — direction depends on current mode.
    button.addEventListener('click', function (e) {
      log('button click, type=' + button.getAttribute('type'));
      e.preventDefault();
      var t = button.getAttribute('type');
      if (t === 'button') clearSearch();
      else doSubmit();
    });

    // Backstop: even though we don't rely on form submit, intercept it just
    // in case some browser triggers it anyway (e.g. via implicit submission),
    // so the page never navigates.
    form.addEventListener('submit', function (e) {
      log('form submit (backstop)');
      e.preventDefault();
      doSubmit();
    });

    input.addEventListener('input', updateButton);

    // Browser back/forward: re-read ?q= from the URL and re-apply, without
    // pushing a new history entry (the navigation itself is the history move).
    window.addEventListener('popstate', function () {
      var q = getQueryFromURL();
      log('popstate ->', q);
      input.value = q;
      appliedQuery = q;
      applyFilter();
      updateButton();
    });

    // Initial state: if the page was loaded with ?q=foo, pre-fill the input
    // and apply the filter so the visitor lands on the filtered results.
    var initialQuery = getQueryFromURL();
    if (initialQuery) {
      input.value = initialQuery;
      appliedQuery = initialQuery;
      applyFilter();
    }

    updateButton();
    log('init: ready' + (initialQuery ? ' (initial q=' + initialQuery + ')' : ''));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
