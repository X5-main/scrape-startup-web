// Vendored from https://www.multiplier.ai/_vercel/insights/script.js (2495 bytes,
// committed in 3e35d33) — the Vercel Web Analytics / Insights loader injected at
// runtime by Next.js. Kept the file so the injected <script src="/_vercel/insights/script.js">
// loads 200 (suppresses the window error event), but with the beacon replaced by a
// no-op: the live loader phones view/event/session events to /_vercel/insights keyed
// off location.href, which would pollute Multiplier's real analytics with replica
// traffic. The site's own JS never references the analytics object, so behavior is
// identical. Original bytes recoverable from git history.
"use strict";
(() => {
  // no-op: local replica must not emit telemetry to Vercel's collector.
})();
