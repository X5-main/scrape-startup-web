// River AI — marketing-site analytics (Mixpanel).
//
// One dependency-free file, included by every page. It loads the Mixpanel
// browser SDK asynchronously and then sends a small, hand-curated set of named
// events. Autocapture stays off on purpose: a curated event surface keeps the
// Mixpanel project readable instead of filling it with anonymous DOM noise that
// nobody can interpret six months from now.
//
// Privacy posture mirrors the Console:
//   • no session replay (record_sessions_percent stays 0)
//   • no autocaptured text content, inputs, or clicks
//   • no PII — visitors here are anonymous and are never identified
//   • Do Not Track visitors are skipped before the SDK is even downloaded
//
// Page weight: nothing is fetched during parse. The tag is deferred and the SDK
// itself is requested from an idle callback, so it never competes with the hero
// shader or first paint.
//
// Adding a page: drop the shared tag in <head> and name the page explicitly —
//   <script src="/analytics.js?v=2" data-page="pricing" defer></script>
//
// The event catalogue. Every event also carries page, page_path and page_title.
//
//   Page Viewed            page_referrer, page_referrer_domain, utm_*, gclid
//   Link Clicked           link_kind (cta|nav|footer|content),
//                          link_destination (internal|outbound|email|phone|anchor),
//                          link_activation (primary_click|modified_click|middle_click),
//                          link_text, link_url, link_host, link_section
//   Video Play Clicked     video_id, video_section
//   Video Engagement Ended video_id, seconds_since_play
//   Code Tab Selected      tab_id, tab_label
//   Code Copied            code_kind, code_file, code_section
//   Stack Layer Clicked    stack_layer
//   Scroll Depth Reached   depth_percent (25|50|75|100)
//   Easter Egg Triggered   easter_egg

(function () {
  "use strict";

  // Public, write-only project token. Same class of value as the Console's:
  // it only permits sending events, so it belongs in the page source.
  var TOKEN = "90b6748e67aac354280ab990d1abee8d";
  var SDK_URL = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";

  var MAX_QUEUED_EVENTS = 50;
  var MAX_TEXT_LENGTH = 80;
  var SCROLL_MILESTONES = [25, 50, 75, 100];
  // Below this the page is barely taller than the viewport, so "scrolled 50%"
  // says nothing about engagement. Only measure depth on genuinely long pages.
  var MIN_SCROLLABLE_PX = 400;

  var MARKETING_PARAMS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
  ];

  // Elements the site treats as calls to action. Kept as one list so the event
  // stream stays stable when a CTA moves between pages.
  var CTA_SELECTOR = ".page-cta, .page-cta-outline, .cta-ghost, .log-link";

  var thisScript = document.currentScript;

  // ── Do Not Track ──────────────────────────────────────────────────
  // The SDK honours DNT on its own (ignore_dnt defaults to false), but bailing
  // here means DNT visitors never pay for the download either.
  var dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
  if (dnt === "1" || dnt === "yes") return;

  // ── Page identity ─────────────────────────────────────────────────
  // Each page declares its own name via data-page. The path-derived fallback
  // keeps a forgotten attribute from producing an unnamed event, but it is a
  // fallback: 404.html is served from whatever path was missing, so only the
  // explicit attribute can identify it.
  var PAGE = (function () {
    var declared = thisScript && thisScript.getAttribute("data-page");
    if (declared) return declared;
    var path = location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
    return path === "" ? "home" : path.replace(/^\//, "");
  })();

  // ── Transport ─────────────────────────────────────────────────────
  var queue = [];
  var ready = false;
  var unavailable = false;

  function flush() {
    var pending = queue;
    queue = [];
    for (var i = 0; i < pending.length; i++) {
      window.mixpanel.track(pending[i][0], pending[i][1], pending[i][2]);
    }
  }

  function giveUp() {
    // An ad blocker or offline visitor. Drop what we have and stop collecting,
    // so a long session cannot grow an unbounded queue.
    unavailable = true;
    queue = [];
  }

  function loadSdk() {
    // The CDN build is compiled in "snippet" mode: on load it looks for an
    // existing window.mixpanel placeholder, builds a real instance for every
    // [token, config, name] entry in its _i list, replays anything pushed onto
    // the placeholder, and finally swaps itself into window.mixpanel. That
    // handshake is the contract Mixpanel's own loader snippet implements.
    //
    // This is the same placeholder, minus the stubbed method queue: the
    // placeholder must be an array (the library replays its entries as queued
    // calls), but ours stays empty because track() below does its own queueing.
    if (window.mixpanel) return giveUp();
    var placeholder = [];
    placeholder.__SV = 1.2; // snippet version the library checks for compatibility
    placeholder._i = [
      [
        TOKEN,
        {
          persistence: "localStorage",
          // Every event below is sent by hand; autocapture would duplicate them
          // under generic names and add click/input noise we do not want.
          autocapture: false,
          track_pageview: false,
          // Explicit even though it is the default: the marketing site must
          // never start a session recording.
          record_sessions_percent: 0,
        },
        "mixpanel",
      ],
    ];
    window.mixpanel = placeholder;

    var el = document.createElement("script");
    el.async = true;
    el.src = SDK_URL;
    el.onload = function () {
      if (!window.mixpanel || typeof window.mixpanel.track !== "function") return giveUp();
      ready = true;
      flush();
    };
    el.onerror = giveUp;
    document.head.appendChild(el);
  }

  // Deferred already puts us after parsing; the idle callback additionally
  // keeps the request off the critical path of the hero shader on the homepage.
  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadSdk, { timeout: 1000 });
  } else {
    window.setTimeout(loadSdk, 0);
  }

  // ── Event helpers ─────────────────────────────────────────────────
  function baseProps() {
    return {
      page: PAGE,
      page_path: location.pathname,
      page_title: document.title,
    };
  }

  function track(name, props, options) {
    if (unavailable) return;
    var payload = baseProps();
    for (var key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) payload[key] = props[key];
    }
    if (ready) {
      window.mixpanel.track(name, payload, options || {});
    } else if (queue.length < MAX_QUEUED_EVENTS) {
      queue.push([name, payload, options || {}]);
    }
  }

  function text(el) {
    var label = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!label) label = el.getAttribute("aria-label") || "";
    return label.slice(0, MAX_TEXT_LENGTH);
  }

  // Nearest meaningful region, so "which docs link" is answerable without
  // guessing from the URL alone.
  function sectionOf(el) {
    var region = el.closest("section, nav, footer, main, header");
    if (!region) return "page";
    if (region.id) return region.id;
    var tag = region.tagName.toLowerCase();
    if (tag !== "section") return tag;
    return (region.className || "").split(/\s+/)[0] || "section";
  }

  // ── Page Viewed ───────────────────────────────────────────────────
  (function trackPageView() {
    var props = {
      page_referrer: document.referrer || "",
      page_referrer_domain: (function () {
        if (!document.referrer) return "";
        try {
          return new URL(document.referrer).hostname;
        } catch (err) {
          return "";
        }
      })(),
    };
    try {
      var params = new URLSearchParams(location.search);
      for (var i = 0; i < MARKETING_PARAMS.length; i++) {
        var value = params.get(MARKETING_PARAMS[i]);
        if (value) props[MARKETING_PARAMS[i]] = value;
      }
    } catch (err) {
      /* URLSearchParams is unavailable — page views still report everything else. */
    }
    track("Page Viewed", props);
  })();

  // ── Link clicks ───────────────────────────────────────────────────
  // One event for every link, classified by props, rather than a separate event
  // per region. "All outbound clicks" and "footer clicks only" are then both a
  // single breakdown in Mixpanel instead of a union of event names.
  function linkKind(anchor) {
    if (anchor.closest("nav")) return "nav";
    if (anchor.closest("footer")) return "footer";
    if (anchor.matches(CTA_SELECTOR)) return "cta";
    if (anchor.matches(".page-back")) return "nav";
    return "content";
  }

  function linkDestination(anchor, url) {
    var href = anchor.getAttribute("href") || "";
    if (/^mailto:/i.test(href)) return "email";
    if (/^tel:/i.test(href)) return "phone";
    if (href.charAt(0) === "#") return "anchor";
    if (!url) return "internal";
    if (url.host !== location.host) return "outbound";
    if (url.hash && url.pathname === location.pathname) return "anchor";
    return "internal";
  }

  function trackLink(anchor, event) {
    var url = null;
    try {
      url = new URL(anchor.href, location.href);
    } catch (err) {
      /* Non-navigational scheme (mailto:, tel:) — classified from the raw href. */
    }
    var destination = linkDestination(anchor, url);
    track("Link Clicked", {
      link_kind: linkKind(anchor),
      link_destination: destination,
      link_activation:
        event.button === 1
          ? "middle_click"
          : event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
            ? "modified_click"
            : "primary_click",
      link_text: text(anchor),
      link_url: anchor.getAttribute("href") || "",
      link_host: url && destination !== "email" && destination !== "phone" ? url.host : "",
      link_section: sectionOf(anchor),
    });
  }

  function trackCodeTab(tab) {
    track("Code Tab Selected", { tab_id: tab.id || "", tab_label: text(tab) });
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var anchor = target.closest("a[href]");
      if (anchor) {
        trackLink(anchor, event);
        return;
      }

      // ── API page: example tabs and copy buttons ──
      var tab = target.closest(".code-tab");
      if (tab) {
        trackCodeTab(tab);
        return;
      }

      var copy = target.closest(".code-copy, .install-copy");
      if (copy) {
        var codeWindow = copy.closest(".code-window");
        var file = codeWindow ? codeWindow.querySelector(".code-file") : null;
        track("Code Copied", {
          code_kind: copy.classList.contains("install-copy") ? "install command" : "code sample",
          code_file: file ? text(file) : "",
          code_section: sectionOf(copy),
        });
        return;
      }

      // ── Homepage stack tower ──
      var layer = target.closest(".stack-layer");
      if (layer) {
        track("Stack Layer Clicked", { stack_layer: layer.getAttribute("data-name") || "" });
      }
    },
    true // capture: record the click even if a handler stops propagation
  );

  // Middle-click opens links in a new tab via auxclick rather than click.
  document.addEventListener(
    "auxclick",
    function (event) {
      if (event.button !== 1) return;
      var target = event.target;
      if (!target || !target.closest) return;
      var anchor = target.closest("a[href]");
      if (anchor) trackLink(anchor, event);
    },
    true
  );

  // Arrow keys switch the API example tabs without producing a click event.
  // This listener bubbles after the tab's own handler updates aria-selected.
  document.addEventListener("keydown", function (event) {
    if (event.repeat || (event.key !== "ArrowRight" && event.key !== "ArrowLeft")) return;
    var target = event.target;
    if (!target || !target.closest) return;
    var tab = target.closest(".code-tab");
    if (!tab) return;
    var tablist = tab.closest('[role="tablist"]') || document;
    var selected = tablist.querySelector('.code-tab[aria-selected="true"]');
    // If selection did not move, the tab handler did not handle this key.
    if (selected && selected !== tab) trackCodeTab(selected);
  });

  // ── Video ─────────────────────────────────────────────────────────
  (function trackVideo() {
    var facade = document.getElementById("videoFacade");
    if (!facade) return;

    var thumb = facade.querySelector("img");
    var match = thumb && thumb.getAttribute("src") ? thumb.getAttribute("src").match(/\/vi\/([^/]+)\//) : null;
    var videoId = match ? match[1] : "";
    var playedAt = 0;
    var reported = false;

    facade.addEventListener(
      "click",
      function () {
        playedAt = Date.now();
        track("Video Play Clicked", { video_id: videoId, video_section: sectionOf(facade) });
      },
      { once: true }
    );

    // Once the YouTube iframe takes over we get no playback events without
    // pulling in their API, so measure the cheap thing instead: how long the
    // visitor stayed on the page after starting the video.
    function reportEngagement() {
      if (!playedAt || reported) return;
      reported = true;
      track(
        "Video Engagement Ended",
        { video_id: videoId, seconds_since_play: Math.round((Date.now() - playedAt) / 1000) },
        // The page is going away: skip the batch queue and use sendBeacon.
        { transport: "sendBeacon", send_immediately: true }
      );
    }

    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") reportEngagement();
    });
    window.addEventListener("pagehide", reportEngagement);
  })();

  // ── Scroll depth ──────────────────────────────────────────────────
  (function trackScrollDepth() {
    var remaining = SCROLL_MILESTONES.slice();
    var scheduled = false;

    function measure() {
      scheduled = false;
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable < MIN_SCROLLABLE_PX) return;

      var percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      while (remaining.length && percent >= remaining[0]) {
        track("Scroll Depth Reached", { depth_percent: remaining.shift() });
      }
      if (!remaining.length) window.removeEventListener("scroll", onScroll);
    }

    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(measure);
    }

    // Only scroll activity after load should count as engagement. Measuring on
    // load made the initial viewport look like a 25–50% scroll on medium pages.
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  // ── Easter eggs ───────────────────────────────────────────────────
  // The footer river and the koi toggle are click-per-ripple interactions, so
  // only the first one per page load is recorded — enough to know they get
  // found, without flooding the project.
  (function trackEasterEggs() {
    var found = {};
    function once(name, el) {
      if (!el) return;
      el.addEventListener("click", function () {
        if (found[name]) return;
        found[name] = true;
        track("Easter Egg Triggered", { easter_egg: name });
      });
    }
    once("footer river", document.getElementById("riverStage"));
    once("koi", document.getElementById("koi"));
  })();
})();
