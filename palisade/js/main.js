/* Palisade — palisade-ai.com
   Hero control-plane simulation + scroll reveals.
   The demo mirrors the launch-video beats: audit stream → NET-004 apply-fix →
   flip to ENFORCING → denies land. All simulated client-side; clearly labeled. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { ro.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ================= hero control-plane demo ================= */
  var cp = document.getElementById("cp");
  if (!cp) return;

  var feed = document.getElementById("feed");
  var modeToggle = document.getElementById("modeToggle");
  var modeLabel = document.getElementById("modeLabel");
  var statusText = document.getElementById("statusText");
  var statMode = document.getElementById("statMode");
  var statModeSub = document.getElementById("statModeSub");
  var statRules = document.getElementById("statRules");
  var statDenies = document.getElementById("statDenies");
  var statDeniesSub = document.getElementById("statDeniesSub");
  var ruleCount = document.getElementById("ruleCount");
  var eventCount = document.getElementById("eventCount");
  var denyInline = document.getElementById("denyCountInline");
  var finding = document.getElementById("finding");
  var findingSev = document.getElementById("findingSev");
  var findingTitle = document.getElementById("findingTitle");
  var findingDesc = document.getElementById("findingDesc");
  var fixLabel = document.getElementById("fixLabel");
  var applyBtn = document.getElementById("applyFix");
  var toast = document.getElementById("toast");
  var feedHint = document.getElementById("feedHint");

  var MAX_ROWS = 8;
  var state = {
    enforcing: false,
    fixed: false,
    events: 3641,
    denies: 0,
    rules: 37,
    clock: 183916.07,
    timers: [],
    running: false,
    userDrove: false
  };

  var AUDIT_ROWS = [
    ["sshd",          "file_open",  "allow", "/etc/ssh/sshd_config"],
    ["chrome-head…", "file_open",  "allow", ".org.chromium.Chromium.UMisHi"],
    ["systemd",       "file_open",  "allow", "/proc/1/cgroup"],
    ["nginx",         "connect",    "allow", "10.0.0.12:443"],
    ["cron",          "bprm_check", "allow", "/usr/sbin/logrotate"],
    ["postgres",      "file_open",  "allow", "/var/lib/postgresql/16/base"],
    ["claude",        "file_open",  "allow", "stat"],
    ["curl",          "connect",    "audit", "169.254.169.254:80"],
    ["bash",          "bprm_check", "audit", "/tmp/payload.sh"],
    ["node",          "file_open",  "allow", "/srv/app/config.json"]
  ];

  var DENY_ROWS = [
    ["bash",    "bprm_check", "deny", "/tmp/payload.sh · rule 3"],
    ["curl",    "connect",    "deny", "169.254.169.254:80 · NET-004"],
    ["python3", "file_open",  "deny", "/etc/shadow · rule 1"],
    ["nc",      "connect",    "deny", "169.254.169.254:80 · NET-004"],
    ["sh",      "bprm_check", "deny", "/var/tmp/dropper · rule 4"],
    ["sshd",    "file_open",  "allow", "/etc/ssh/sshd_config"],
    ["nginx",   "connect",    "allow", "10.0.0.12:443"]
  ];

  function fmtK(n) { return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n); }

  function pushRow(spec) {
    var comm = spec[0], hook = spec[1], verdict = spec[2], detail = spec[3];
    state.clock += Math.random() * 0.9 + 0.15;
    state.events += 1;
    if (verdict === "deny") {
      state.denies += Math.floor(Math.random() * 3) + 1;
      statDenies.textContent = String(state.denies);
      denyInline.textContent = String(state.denies);
    }
    eventCount.textContent = fmtK(state.events);

    var row = document.createElement("div");
    row.className = "feed-row" + (verdict === "deny" ? " denyrow" : "");
    row.innerHTML =
      '<span class="t">' + state.clock.toFixed(2) + "</span>" +
      '<span class="c">' + comm + "</span>" +
      '<span class="h">' + hook + "</span>" +
      '<span class="verdict ' + verdict + '">' + verdict.toUpperCase() + "</span>" +
      '<span class="d">' + detail + "</span>";
    feed.appendChild(row);
    while (feed.children.length > MAX_ROWS) feed.removeChild(feed.firstChild);
  }

  function setMode(enforcing) {
    state.enforcing = enforcing;
    cp.classList.toggle("enforcing", enforcing);
    modeLabel.textContent = enforcing ? "ENFORCING" : "AUDIT-ONLY";
    statusText.textContent = enforcing ? "enforcing" : "audit-only";
    statMode.textContent = enforcing ? "ENFORCE" : "AUDIT";
    statMode.style.color = enforcing ? "var(--red)" : "";
    statModeSub.textContent = enforcing ? "matched ops return -EPERM" : "watching only — nothing blocked";
    statDeniesSub.textContent = enforcing ? "attack failing in real time" : "only while enforcing";
    feedHint.textContent = enforcing
      ? "— matched operations return -EPERM from the kernel"
      : "— every row is a kernel decision on a syscall";
  }

  function applyFix() {
    if (state.fixed) return;
    state.fixed = true;
    applyBtn.classList.add("pressed");
    applyBtn.setAttribute("disabled", "disabled");
    applyBtn.textContent = "Fixed ✓";
    setTimeout(function () { applyBtn.classList.remove("pressed"); }, 220);

    state.rules = 38;
    statRules.textContent = "38";
    ruleCount.textContent = "38";
    finding.classList.add("resolved");
    findingSev.textContent = "RESOLVED";
    findingSev.className = "chip chip-ok mono";
    findingTitle.textContent = "Cloud metadata service — egress restricted";
    findingDesc.textContent = "Outbound to 169.254.169.254 is now denied for every process except cloud-init. Applied as kernel rule 38 — revert it and the finding reopens.";
    fixLabel.textContent = "✓ INSTALLED → kernel rule 38 · audit findings 4 → 3";

    toast.classList.add("show");
    setTimeout(function () { toast.classList.remove("show"); }, 2600);
  }

  function resetDemo() {
    state.fixed = false;
    setMode(false);
    state.denies = 0;
    statDenies.textContent = "0";
    denyInline.textContent = "0";
    state.rules = 37;
    statRules.textContent = "37";
    ruleCount.textContent = "37";
    applyBtn.removeAttribute("disabled");
    applyBtn.textContent = "Apply fix";
    finding.classList.remove("resolved");
    findingSev.textContent = "MEDIUM";
    findingSev.className = "chip chip-med mono";
    findingTitle.textContent = "Cloud metadata service reachable by every process";
    findingDesc.textContent = "Any local process can query 169.254.169.254 and harvest instance credentials — the same path behind the Capital One breach.";
    fixLabel.textContent = "MAINTAINER FIX → block outbound to 169.254.169.254 except cloud-init";
  }

  /* ---- streaming loop: pick rows for the current mode ---- */
  var auditIdx = 0, denyIdx = 0;
  function streamTick() {
    if (state.enforcing) {
      pushRow(DENY_ROWS[denyIdx % DENY_ROWS.length]);
      denyIdx++;
    } else {
      pushRow(AUDIT_ROWS[auditIdx % AUDIT_ROWS.length]);
      auditIdx++;
    }
    state.timers.push(setTimeout(streamTick, state.enforcing ? 620 : 850));
  }

  /* ---- scripted scenario (loops until the user takes over) ---- */
  function scenario() {
    if (state.userDrove) return;
    var t = function (ms, fn) { state.timers.push(setTimeout(function () { if (!state.userDrove) fn(); }, ms)); };
    t(5200, applyFix);                       // beat B: one click to fix
    t(7800, function () { setMode(true); }); // beat C: flip to enforcing
    t(15600, function () { resetDemo(); scenario(); }); // loop
  }

  function clearTimers() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
  }

  function start() {
    if (state.running || reduceMotion) return;
    state.running = true;
    // seed a few rows so the feed isn't empty
    for (var i = 0; i < 5; i++) pushRow(AUDIT_ROWS[auditIdx++ % AUDIT_ROWS.length]);
    streamTick();
    scenario();
  }

  function stop() {
    state.running = false;
    clearTimers();
  }

  /* pause when off-screen */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.15 });
    io.observe(cp);
  } else {
    // static fallback: render a representative frame
    for (var i = 0; i < 6; i++) pushRow(AUDIT_ROWS[i]);
  }

  /* manual controls: user takes over, scripted scenario stops */
  modeToggle.addEventListener("click", function () {
    state.userDrove = true;
    clearTimers();
    setMode(!state.enforcing);
    if (state.running || reduceMotion) { /* restart stream only */ }
    if (!reduceMotion) { state.running = true; streamTick(); }
  });
  applyBtn.addEventListener("click", function () {
    state.userDrove = true;
    applyFix();
  });

  /* ================= english → kernel rule typing ================= */
  var ruleTyped = document.getElementById("ruleTyped");
  var ruleOut = document.getElementById("ruleOut");
  var compileBtn = document.getElementById("compileBtn");
  var rulebox = document.getElementById("rulebox");
  var RULE_TEXT = 'Block reads of /root/.ssh/ except by sshd, ssh, scp';

  function runRuleDemo() {
    if (reduceMotion) { ruleOut.classList.add("show"); return; }
    ruleTyped.textContent = "";
    ruleOut.classList.remove("show");
    var i = 0;
    (function type() {
      if (i <= RULE_TEXT.length) {
        ruleTyped.textContent = RULE_TEXT.slice(0, i);
        i++;
        setTimeout(type, 26 + Math.random() * 34);
      } else {
        setTimeout(function () { ruleOut.classList.add("show"); }, 450);
      }
    })();
  }

  if (rulebox && "IntersectionObserver" in window && !reduceMotion) {
    var seen = false;
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !seen) { seen = true; runRuleDemo(); rio.unobserve(rulebox); }
      });
    }, { threshold: 0.4 });
    rio.observe(rulebox);
  } else if (ruleOut) {
    ruleOut.classList.add("show");
  }
  if (compileBtn) compileBtn.addEventListener("click", runRuleDemo);
})();
