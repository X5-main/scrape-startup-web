import{t as e}from"./rolldown-runtime.Dh6celcD.mjs";async function t(e,t,i){let a=r[e],o=a?await a(t,i):void 0,s={bodyEnd:[],bodyStart:[],headEnd:[],headStart:[]};for(let t of n){if(t.pageIds&&!t.pageIds.has(e))continue;let n=t.code(o);n&&s[t.placement].push({...t,code:n})}return s}var n,r,i,a;e((()=>{n=[{code:e=>`<script>
  !function(t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog && window.posthog.__loaded) || (
      window.posthog = e, e._i = [], e.init = function(i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function() {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
          }
        }
        (p = t.createElement("script")).type = "text/javascript",
        p.crossOrigin = "anonymous", p.async = !0,
        p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js",
        (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
        var u = e;
        for (
          void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [],
          u.toString = function(t) {
            var e = "posthog";
            return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
          },
          u.people.toString = function() {
            return u.toString(1) + ".people (stub)"
          },
          o = "init Fe Us zs Oe js Ns capture Ze calculateEventProperties Hs register register_once register_for_session unregister unregister_for_session Js getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Gs qs createPersonProfile Vs As Ks opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Bs debug L Ws getPageViewId captureTraceFeedback captureTraceMetric".split(" "),
          n = 0; n < o.length; n++
        ) g(u, o[n]);
        e._i.push([i, s, a])
      }, e.__SV = 1
    )
  }(document, window.posthog || []);

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const distinct_id = hashParams.get('distinct_id');
  const session_id = hashParams.get('session_id');

  const posthogConfig = {
    api_host: 'https://us.i.posthog.com',
    cookie_domain: '.uplane.com',
    persistence: 'cookie',
  };

  if (distinct_id || session_id) {
    console.log('Detected distinct_id or session_id in hash, applying bootstrap config.');
    posthogConfig.bootstrap = {};
    if (session_id) {
      console.log(\`Setting sessionID from hash: \${session_id}\`);
      posthogConfig.bootstrap.sessionID = session_id;
    }
    if (distinct_id) {
      console.log(\`Setting distinctID from hash: \${distinct_id}\`);
      posthogConfig.bootstrap.distinctID = distinct_id;
    }
  } else {
    console.log('No distinct_id or session_id found in hash.');
  }

  posthog.init('phc_Y5uhXY0bQDyr86yzIr2rF7o0EjVcSJoqMLcNVJ3NotO', posthogConfig);
  console.log('Posthog initialized with config:', posthogConfig);
<\/script>`,id:`legacy-headEnd-jtxgomk4x`,loadMode:`once`,name:`Custom Code (Legacy)`,pageIds:new Set([`jtxgomk4x`]),placement:`headEnd`},{code:e=>`<script>
  !function(t, e) {
    var o, n, p, r;
    e.__SV || (window.posthog && window.posthog.__loaded) || (
      window.posthog = e, e._i = [], e.init = function(i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function() {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
          }
        }
        (p = t.createElement("script")).type = "text/javascript",
        p.crossOrigin = "anonymous", p.async = !0,
        p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js",
        (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r);
        var u = e;
        for (
          void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [],
          u.toString = function(t) {
            var e = "posthog";
            return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e
          },
          u.people.toString = function() {
            return u.toString(1) + ".people (stub)"
          },
          o = "init Fe Us zs Oe js Ns capture Ze calculateEventProperties Hs register register_once register_for_session unregister unregister_for_session Js getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Gs qs createPersonProfile Vs As Ks opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Bs debug L Ws getPageViewId captureTraceFeedback captureTraceMetric".split(" "),
          n = 0; n < o.length; n++
        ) g(u, o[n]);
        e._i.push([i, s, a])
      }, e.__SV = 1
    )
  }(document, window.posthog || []);

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const distinct_id = hashParams.get('distinct_id');
  const session_id = hashParams.get('session_id');

  const posthogConfig = {
    api_host: 'https://us.i.posthog.com',
    cookie_domain: '.uplane.com',
    persistence: 'cookie',
  };

  if (distinct_id || session_id) {
    console.log('Detected distinct_id or session_id in hash, applying bootstrap config.');
    posthogConfig.bootstrap = {};
    if (session_id) {
      console.log(\`Setting sessionID from hash: \${session_id}\`);
      posthogConfig.bootstrap.sessionID = session_id;
    }
    if (distinct_id) {
      console.log(\`Setting distinctID from hash: \${distinct_id}\`);
      posthogConfig.bootstrap.distinctID = distinct_id;
    }
  } else {
    console.log('No distinct_id or session_id found in hash.');
  }

  posthog.init('phc_Y5uhXY0bQDyr86yzIr2rF7o0EjVcSJoqMLcNVJ3NotO', posthogConfig);
  console.log('Posthog initialized with config:', posthogConfig);
<\/script>`,id:`legacy-headEnd-NQylA2YaW`,loadMode:`once`,name:`Custom Code (Legacy)`,pageIds:new Set([`NQylA2YaW`]),placement:`headEnd`},{code:e=>`<div
    id="main-content-container"
    style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; background-color: #f8fafc;"
  >
    <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 2rem; color: #0f172a;">
      Uplane Deck
    </h1>    <div
      id="password-form-container"
      style="background-color: #ffffff; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); width: 100%; max-width: 24rem;"
    >
      <p style="margin-bottom: 1.5rem; text-align: center; color: #475569;">
        Please enter the password to view the deck.
      </p>
      <input
        type="password"
        id="password-input"
        placeholder="Enter password"
        style="display: block; width: 100%; padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 1rem; line-height: 1.5; color: #1e293b; background-color: #ffffff; margin-bottom: 1rem; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;"
      />
      <button
        onclick="checkPassword()"
        style="display: block; width: 100%; padding: 0.75rem 1rem; background-color: #1e293b; color: #ffffff; border: none; border-radius: 0.375rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease-in-out; outline: none;"
      >
        Submit
      </button>
      <p
        id="error-message"
        style="color: #ef4444; text-align: center; margin-top: 1rem; display: none;"
      ></p>
    </div>  </div>  <div id="iframe-container" style="display: none; width: 100%; height: 100vh; position: fixed; top: 0; left: 0;">
    <iframe
      style="position: fixed; top: 0px; left: 0px; border: 0px; width: 100%; height: 100%;"
      src="https://www.figma.com/proto/ZodUhP3hW7jPV91zo8uYi8/Uplane-Sales-Deck---VC12?node-id=53-920&t=qebIjnxpu6SaqetB-1&embed-host=share"
      allowfullscreen
    ></iframe>
  </div>  <script>
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#f8fafc';
    });

    const ENCODED_BASE_PASSWORD = 'dGhlLXNlY3JldC1wYXNzd29yZA=='; // This is a placeholder, as the original password logic is being replaced.

    // Function to decode a Base64 string
    function decodeBase64(encodedString) {
        return atob(encodedString);
    }

     function checkPassword() {
      const passwordInput = document.getElementById('password-input');
      const errorMessage = document.getElementById('error-message');
      const mainContentContainer = document.getElementById('main-content-container');
      const iframeContainer = document.getElementById('iframe-container');

      const enteredPassword = passwordInput.value;

      const vcRegex = /^uplane.vc.[a-zA-Z0-9]+$/;
      const angleRegex = /^uplane.angel.[a-zA-Z0-9]+$/;

      if (vcRegex.test(enteredPassword) || angleRegex.test(enteredPassword)) {
        mainContentContainer.style.display = 'none';
        iframeContainer.style.display = 'block';
        errorMessage.style.display = 'none';

        // Posthog capture event
        if (typeof posthog !== 'undefined') {
            posthog.capture('access_deck', {
                password: enteredPassword,
            });
        }

      }
      else {
        errorMessage.textContent = 'Incorrect password. Please try again.';
        errorMessage.style.display = 'block';
      }
    }
  <\/script>
`,id:`legacy-bodyEnd-NQylA2YaW`,loadMode:`once`,name:`Custom Code (Legacy)`,pageIds:new Set([`NQylA2YaW`]),placement:`bodyEnd`},{code:e=>`<script>\r
  window.location.href = "https://jobs.ashbyhq.com/uplane";\r
<\/script>`,id:`qxpVyRy66`,loadMode:`once`,name:`Redirect to external page`,pageIds:new Set([`rKx3KRrmB`]),placement:`bodyEnd`}],r={},i={bodyEnd:[`legacy-bodyEnd-NQylA2YaW`,`qxpVyRy66`,`KaV4DkMIU`],bodyStart:[],headEnd:[`legacy-headEnd`,`legacy-headEnd-jtxgomk4x`,`legacy-headEnd-NQylA2YaW`,`oT29xgSY_`],headStart:[]},a={exports:{snippetsSorting:{type:`variable`,annotations:{framerContractVersion:`1`}},getSnippets:{type:`function`,annotations:{framerContractVersion:`1`}},__FramerMetadata__:{type:`variable`}}}}))();export{a as __FramerMetadata__,t as getSnippets,i as snippetsSorting};
//# sourceMappingURL=sCZTClpUYn6yXgwIb7fhRon47dIYKmy1W9Gm9YLozYE.D5faBCro.mjs.map