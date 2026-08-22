// No-op stand-in for the Vercel Web Analytics / Insights loader.
// Ellis's /assets/index-*.js bundle inlines @vercel/analytics and, at runtime,
// injects <script src="/_vercel/insights/script.js"> (beaconing view/event/
// session events keyed off location.href). On a local replica that live
// loader must NOT run: it would pollute the company's real analytics with
// replica traffic. The injector only requires the script tag to load 200
// (which also suppresses the window error event). This file provides that
// 200-load with a no-op body. Valid, parseable JS.
"use strict";
(() => {
  // offline replica: Vercel Insights removed
})();
