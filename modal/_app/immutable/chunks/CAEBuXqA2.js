(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`af5b8053-d32b-4ab3-9db6-bf37336c851e`,e._sentryDebugIdIdentifier=`sentry-dbid-af5b8053-d32b-4ab3-9db6-bf37336c851e`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`modal app`,id:`modal-app`,children:[{depth:2,value:`modal app dashboard`,id:`modal-app-dashboard`},{depth:2,value:`modal app history`,id:`modal-app-history`},{depth:2,value:`modal app list`,id:`modal-app-list`},{depth:2,value:`modal app logs`,id:`modal-app-logs`},{depth:2,value:`modal app rollback`,id:`modal-app-rollback`},{depth:2,value:`modal app rollover`,id:`modal-app-rollover`},{depth:2,value:`modal app stop`,id:`modal-app-stop`}]}],rawContent:`# \`modal app\`

Manage deployed and running apps.

**Usage**:

\`\`\`shell
modal app [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`dashboard\`: Open an App's dashboard page in your web browser.
* \`history\`: Show an App's deployment history.
* \`list\`: List Apps that are running, deployed or recently stopped.
* \`logs\`: Fetch or stream App logs.
* \`rollback\`: Redeploy a previous version of an App.
* \`rollover\`: Redeploy an App to get new containers without code changes.
* \`stop\`: Permanently stop an App and terminate its running containers.

## \`modal app dashboard\`

Open an App's dashboard page in your web browser.

Examples:

Open dashboard for an app by name:

\`\`\`
modal app dashboard my-app
\`\`\`

Use a specified environment:

\`\`\`
modal app dashboard my-app --env dev
\`\`\`

**Usage**:

\`\`\`shell
modal app dashboard [OPTIONS] APP_IDENTIFIER
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal app history\`

Show an App's deployment history.

Examples:

Get the history based on an app ID:

\`\`\`
modal app history ap-123456
\`\`\`

Get the history for an App based on its name:

\`\`\`
modal app history my-app
\`\`\`

**Usage**:

\`\`\`shell
modal app history [OPTIONS] APP_IDENTIFIER
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal app list\`

List Apps that are running, deployed or recently stopped.

**Usage**:

\`\`\`shell
modal app list [OPTIONS]
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal app logs\`

Fetch or stream App logs.

By default, this command fetches the last 100 log entries and exits. Use \`\`-f\`\` to
live-stream logs from a running App instead. Fetch and follow are mutually exclusive.

Examples:

Get recent logs based on an app ID:

\`\`\`
modal app logs ap-123456
\`\`\`

Get recent logs for a currently deployed App based on its name:

\`\`\`
modal app logs my-app
\`\`\`

Follow (stream) logs from a running App:

\`\`\`
modal app logs my-app -f
\`\`\`

Fetch the last 1000 entries:

\`\`\`
modal app logs my-app --tail 1000
\`\`\`

Fetch logs from the last 2 hours:

\`\`\`
modal app logs my-app --since 2h
\`\`\`

Fetch logs in a specific time range:

\`\`\`
modal app logs my-app --since 2026-03-01T05:00:00 --until 2026-03-01T08:00:00
\`\`\`

Filter the logs by source and function:

\`\`\`
modal app logs my-app --source stderr --function fu-abc123
\`\`\`

Include timestamps along with Function and Container IDs on each line:

\`\`\`
modal app logs my-app --timestamps --show-function-id --show-container-id
\`\`\`

**Usage**:

\`\`\`shell
modal app logs [OPTIONS] APP_IDENTIFIER
\`\`\`

**Options**:

* \`-f, --follow\`: Stream log output until App stops
* \`--since TEXT\`: Start of time range. Accepts ISO 8601 datetime or relative time, e.g. '1d' (1 day ago), '2h', '30m', etc.
* \`--until TEXT\`: End of time range; accepts same argument types as --since
* \`-n, --tail INTEGER\`: Show only the last N log entries
* \`--search TEXT\`: Filter by search text
* \`--function TEXT\`: Filter by Function ID (fu-*)
* \`--function-call TEXT\`: Filter by FunctionCall ID (fc-*)
* \`--container TEXT\`: Filter by Container ID (ta-*)
* \`-s, --source TEXT\`: Filter by source: 'stdout', 'stderr', or 'system'
* \`--timestamps\`: Prefix each line with its timestamp
* \`--show-function-id\`: Prefix each line with its Function ID
* \`--show-function-call-id\`: Prefix each line with its FunctionCall ID
* \`--show-container-id\`: Prefix each line with its Container ID
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal app rollback\`

Redeploy a previous version of an App.

Note that the App must currently be in a "deployed" state.
Rollbacks will appear as a new deployment in the App history, although
the App state will be reset to the state at the time of the previous deployment.

Examples:

Rollback an App to its previous version:

\`\`\`
modal app rollback my-app
\`\`\`

Rollback an App to a specific version:

\`\`\`
modal app rollback my-app v3
\`\`\`

Rollback an App using its App ID instead of its name:

\`\`\`
modal app rollback ap-abcdefghABCDEFGH123456
\`\`\`

**Usage**:

\`\`\`shell
modal app rollback [OPTIONS] APP_IDENTIFIER [VERSION]
\`\`\`

**Options**:

* \`--strategy [rolling|recreate]\`: Strategy for rollback
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal app rollover\`

Redeploy an App to get new containers without code changes.

A rollover replaces existing containers with fresh ones built from the same
App version — useful for refreshing containers without changing your code.
The rollover appears as a new entry in the App's deployment history.

Examples:

Rollover an App using a rolling deployment. Running containers are now considered
outdated and will be gracefully replaced by new ones.

\`\`\`
modal app rollover my-app
\`\`\`

Rollover an App by terminating any running containers. Inputs on the queue will
start new containers.

\`\`\`
modal app rollover my-app --strategy recreate
\`\`\`

**Usage**:

\`\`\`shell
modal app rollover [OPTIONS] APP_IDENTIFIER
\`\`\`

**Options**:

* \`--strategy [rolling|recreate]\`: Strategy for rollover
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal app stop\`

Permanently stop an App and terminate its running containers.

**Usage**:

\`\`\`shell
modal app stop [OPTIONS] APP_IDENTIFIER
\`\`\`

**Options**:

* \`-y, --yes\`: Run without pausing for confirmation.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal app`,description:`Manage deployed and running apps.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<code>modal app</code>`),g=e(`<code>modal app dashboard</code>`),_=e(`<code>modal app history</code>`),v=e(`<code>modal app list</code>`),y=e(`<code>modal app logs</code>`),b=e(`<code>modal app rollback</code>`),x=e(`<code>modal app rollover</code>`),S=e(`<code>modal app stop</code>`),C=e(`<!> <p>Manage deployed and running apps.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>dashboard</code>: Open an App’s dashboard page in your web browser.</li> <li><code>history</code>: Show an App’s deployment history.</li> <li><code>list</code>: List Apps that are running, deployed or recently stopped.</li> <li><code>logs</code>: Fetch or stream App logs.</li> <li><code>rollback</code>: Redeploy a previous version of an App.</li> <li><code>rollover</code>: Redeploy an App to get new containers without code changes.</li> <li><code>stop</code>: Permanently stop an App and terminate its running containers.</li></ul> <!> <p>Open an App’s dashboard page in your web browser.</p> <p>Examples:</p> <p>Open dashboard for an app by name:</p> <!> <p>Use a specified environment:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Show an App’s deployment history.</p> <p>Examples:</p> <p>Get the history based on an app ID:</p> <!> <p>Get the history for an App based on its name:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List Apps that are running, deployed or recently stopped.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Fetch or stream App logs.</p> <p>By default, this command fetches the last 100 log entries and exits. Use <code>-f</code> to
live-stream logs from a running App instead. Fetch and follow are mutually exclusive.</p> <p>Examples:</p> <p>Get recent logs based on an app ID:</p> <!> <p>Get recent logs for a currently deployed App based on its name:</p> <!> <p>Follow (stream) logs from a running App:</p> <!> <p>Fetch the last 1000 entries:</p> <!> <p>Fetch logs from the last 2 hours:</p> <!> <p>Fetch logs in a specific time range:</p> <!> <p>Filter the logs by source and function:</p> <!> <p>Include timestamps along with Function and Container IDs on each line:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-f, --follow</code>: Stream log output until App stops</li> <li><code>--since TEXT</code>: Start of time range. Accepts ISO 8601 datetime or relative time, e.g. ‘1d’ (1 day ago), ‘2h’, ‘30m’, etc.</li> <li><code>--until TEXT</code>: End of time range; accepts same argument types as —since</li> <li><code>-n, --tail INTEGER</code>: Show only the last N log entries</li> <li><code>--search TEXT</code>: Filter by search text</li> <li><code>--function TEXT</code>: Filter by Function ID (fu-*)</li> <li><code>--function-call TEXT</code>: Filter by FunctionCall ID (fc-*)</li> <li><code>--container TEXT</code>: Filter by Container ID (ta-*)</li> <li><code>-s, --source TEXT</code>: Filter by source: ‘stdout’, ‘stderr’, or ‘system’</li> <li><code>--timestamps</code>: Prefix each line with its timestamp</li> <li><code>--show-function-id</code>: Prefix each line with its Function ID</li> <li><code>--show-function-call-id</code>: Prefix each line with its FunctionCall ID</li> <li><code>--show-container-id</code>: Prefix each line with its Container ID</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Redeploy a previous version of an App.</p> <p>Note that the App must currently be in a “deployed” state.
Rollbacks will appear as a new deployment in the App history, although
the App state will be reset to the state at the time of the previous deployment.</p> <p>Examples:</p> <p>Rollback an App to its previous version:</p> <!> <p>Rollback an App to a specific version:</p> <!> <p>Rollback an App using its App ID instead of its name:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--strategy [rolling|recreate]</code>: Strategy for rollback</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Redeploy an App to get new containers without code changes.</p> <p>A rollover replaces existing containers with fresh ones built from the same
App version — useful for refreshing containers without changing your code.
The rollover appears as a new entry in the App’s deployment history.</p> <p>Examples:</p> <p>Rollover an App using a rolling deployment. Running containers are now considered
outdated and will be gracefully replaced by new ones.</p> <!> <p>Rollover an App by terminating any running containers. Inputs on the queue will
start new containers.</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--strategy [rolling|recreate]</code>: Strategy for rollover</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Permanently stop an App and terminate its running containers.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function w(e,f){let p=n(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,r(()=>p,()=>d,{children:(e,n)=>{var r=C(),u=i(r);c(u,{id:`modal-app`,children:(e,n)=>{t(e,h())},$$slots:{default:!0}});var d=a(u,6);l(d,{code:`modal%20app%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var f=a(d,10);s(f,{id:`modal-app-dashboard`,children:(e,n)=>{t(e,g())},$$slots:{default:!0}});var p=a(f,8);l(p,{code:`modal%20app%20dashboard%20my-app`,lang:`text`});var m=a(p,4);l(m,{code:`modal%20app%20dashboard%20my-app%20--env%20dev`,lang:`text`});var w=a(m,4);l(w,{code:`modal%20app%20dashboard%20%5BOPTIONS%5D%20APP_IDENTIFIER`,lang:`shell`});var T=a(w,6);s(T,{id:`modal-app-history`,children:(e,n)=>{t(e,_())},$$slots:{default:!0}});var E=a(T,8);l(E,{code:`modal%20app%20history%20ap-123456`,lang:`text`});var D=a(E,4);l(D,{code:`modal%20app%20history%20my-app`,lang:`text`});var O=a(D,4);l(O,{code:`modal%20app%20history%20%5BOPTIONS%5D%20APP_IDENTIFIER`,lang:`shell`});var k=a(O,6);s(k,{id:`modal-app-list`,children:(e,n)=>{t(e,v())},$$slots:{default:!0}});var A=a(k,6);l(A,{code:`modal%20app%20list%20%5BOPTIONS%5D`,lang:`shell`});var j=a(A,6);s(j,{id:`modal-app-logs`,children:(e,n)=>{t(e,y())},$$slots:{default:!0}});var M=a(j,10);l(M,{code:`modal%20app%20logs%20ap-123456`,lang:`text`});var N=a(M,4);l(N,{code:`modal%20app%20logs%20my-app`,lang:`text`});var P=a(N,4);l(P,{code:`modal%20app%20logs%20my-app%20-f`,lang:`text`});var F=a(P,4);l(F,{code:`modal%20app%20logs%20my-app%20--tail%201000`,lang:`text`});var I=a(F,4);l(I,{code:`modal%20app%20logs%20my-app%20--since%202h`,lang:`text`});var L=a(I,4);l(L,{code:`modal%20app%20logs%20my-app%20--since%202026-03-01T05%3A00%3A00%20--until%202026-03-01T08%3A00%3A00`,lang:`text`});var R=a(L,4);l(R,{code:`modal%20app%20logs%20my-app%20--source%20stderr%20--function%20fu-abc123`,lang:`text`});var z=a(R,4);l(z,{code:`modal%20app%20logs%20my-app%20--timestamps%20--show-function-id%20--show-container-id`,lang:`text`});var B=a(z,4);l(B,{code:`modal%20app%20logs%20%5BOPTIONS%5D%20APP_IDENTIFIER`,lang:`shell`});var V=a(B,6);s(V,{id:`modal-app-rollback`,children:(e,n)=>{t(e,b())},$$slots:{default:!0}});var H=a(V,10);l(H,{code:`modal%20app%20rollback%20my-app`,lang:`text`});var U=a(H,4);l(U,{code:`modal%20app%20rollback%20my-app%20v3`,lang:`text`});var W=a(U,4);l(W,{code:`modal%20app%20rollback%20ap-abcdefghABCDEFGH123456`,lang:`text`});var G=a(W,4);l(G,{code:`modal%20app%20rollback%20%5BOPTIONS%5D%20APP_IDENTIFIER%20%5BVERSION%5D`,lang:`shell`});var K=a(G,6);s(K,{id:`modal-app-rollover`,children:(e,n)=>{t(e,x())},$$slots:{default:!0}});var q=a(K,10);l(q,{code:`modal%20app%20rollover%20my-app`,lang:`text`});var J=a(q,4);l(J,{code:`modal%20app%20rollover%20my-app%20--strategy%20recreate`,lang:`text`});var Y=a(J,4);l(Y,{code:`modal%20app%20rollover%20%5BOPTIONS%5D%20APP_IDENTIFIER`,lang:`shell`});var X=a(Y,6);s(X,{id:`modal-app-stop`,children:(e,n)=>{t(e,S())},$$slots:{default:!0}}),l(a(X,6),{code:`modal%20app%20stop%20%5BOPTIONS%5D%20APP_IDENTIFIER`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{w as default,d as metadata};
//# sourceMappingURL=CAEBuXqA2.js.map
