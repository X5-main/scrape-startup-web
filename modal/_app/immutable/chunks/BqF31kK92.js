(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`664fd2e9-8cb9-486d-a9f3-9086e7c959a4`,e._sentryDebugIdIdentifier=`sentry-dbid-664fd2e9-8cb9-486d-a9f3-9086e7c959a4`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`modal container`,id:`modal-container`,children:[{depth:2,value:`modal container exec`,id:`modal-container-exec`},{depth:2,value:`modal container list`,id:`modal-container-list`},{depth:2,value:`modal container logs`,id:`modal-container-logs`},{depth:2,value:`modal container stop`,id:`modal-container-stop`}]}],rawContent:`# \`modal container\`

Manage and connect to running containers.

**Usage**:

\`\`\`shell
modal container [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`exec\`: Execute a command in a container.
* \`list\`: List all containers that are currently running.
* \`logs\`: Fetch or stream logs for a specific container.
* \`stop\`: Terminate a running container.

## \`modal container exec\`

Execute a command in a container.

**Usage**:

\`\`\`shell
modal container exec [OPTIONS] CONTAINER_ID COMMAND...
\`\`\`

**Options**:

* \`--pty / --no-pty\`: Run the command using a PTY.
* \`--help\`: Show this message and exit.

## \`modal container list\`

List all containers that are currently running.

**Usage**:

\`\`\`shell
modal container list [OPTIONS]
\`\`\`

**Options**:

* \`--app-id TEXT\`: List containers running for a specific App.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal container logs\`

Fetch or stream logs for a specific container.

By default, this command fetches the last 100 log entries and exits. Use \`\`-f\`\` to
live-stream logs from a running container instead. Fetch and follow are mutually exclusive.

Examples:

Get recent logs for a container:

\`\`\`
modal container logs ta-123456
\`\`\`

Follow (stream) logs from a running container:

\`\`\`
modal container logs ta-123456 -f
\`\`\`

Fetch logs from the last 2 hours:

\`\`\`
modal container logs ta-123456 --since 2h
\`\`\`

Fetch logs in a specific time range:

\`\`\`
modal container logs ta-123456 --since 2026-03-01T05:00:00 --until 2026-03-01T08:00:00
\`\`\`

Fetch the last 1000 entries:

\`\`\`
modal container logs ta-123456 --tail 1000
\`\`\`

Fetch all container logs:

\`\`\`
modal container logs ta-123456 --all
\`\`\`

**Usage**:

\`\`\`shell
modal container logs [OPTIONS] CONTAINER_ID
\`\`\`

**Options**:

* \`-f, --follow\`: Stream log output until Container stops
* \`--all\`: Show all logs for the container
* \`--since TEXT\`: Start of time range. Accepts ISO 8601 datetime or relative time, e.g. '1d' (1 day ago), '2h', '30m', etc.
* \`--until TEXT\`: End of time range; accepts same argument types as --since
* \`-n, --tail INTEGER\`: Show only the last N log entries
* \`--search TEXT\`: Filter by search text
* \`-s, --source TEXT\`: Filter by source: 'stdout', 'stderr', or 'system'
* \`--timestamps\`: Prefix each line with its timestamp
* \`--help\`: Show this message and exit.

## \`modal container stop\`

Terminate a running container.

By default, this will send the container a SIGINT signal that Modal will handle.
For Functions, any inputs that are currently running on the container will be cancelled
and rescheduled on other containers.

With \`--graceful\`, the container will be allowed to finish the inputs it is currently
running, exiting once they complete. Graceful stops are only supported for containers
running a Modal Function.

**Usage**:

\`\`\`shell
modal container stop [OPTIONS] CONTAINER_ID
\`\`\`

**Options**:

* \`--graceful\`: Let the container finish its current inputs before exiting, instead of cancelling them.
* \`-y, --yes\`: Run without pausing for confirmation.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal container`,description:`Manage and connect to running containers.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<code>modal container</code>`),g=e(`<code>modal container exec</code>`),_=e(`<code>modal container list</code>`),v=e(`<code>modal container logs</code>`),y=e(`<code>modal container stop</code>`),b=e(`<!> <p>Manage and connect to running containers.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>exec</code>: Execute a command in a container.</li> <li><code>list</code>: List all containers that are currently running.</li> <li><code>logs</code>: Fetch or stream logs for a specific container.</li> <li><code>stop</code>: Terminate a running container.</li></ul> <!> <p>Execute a command in a container.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--pty / --no-pty</code>: Run the command using a PTY.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List all containers that are currently running.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--app-id TEXT</code>: List containers running for a specific App.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Fetch or stream logs for a specific container.</p> <p>By default, this command fetches the last 100 log entries and exits. Use <code>-f</code> to
live-stream logs from a running container instead. Fetch and follow are mutually exclusive.</p> <p>Examples:</p> <p>Get recent logs for a container:</p> <!> <p>Follow (stream) logs from a running container:</p> <!> <p>Fetch logs from the last 2 hours:</p> <!> <p>Fetch logs in a specific time range:</p> <!> <p>Fetch the last 1000 entries:</p> <!> <p>Fetch all container logs:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-f, --follow</code>: Stream log output until Container stops</li> <li><code>--all</code>: Show all logs for the container</li> <li><code>--since TEXT</code>: Start of time range. Accepts ISO 8601 datetime or relative time, e.g. ‘1d’ (1 day ago), ‘2h’, ‘30m’, etc.</li> <li><code>--until TEXT</code>: End of time range; accepts same argument types as —since</li> <li><code>-n, --tail INTEGER</code>: Show only the last N log entries</li> <li><code>--search TEXT</code>: Filter by search text</li> <li><code>-s, --source TEXT</code>: Filter by source: ‘stdout’, ‘stderr’, or ‘system’</li> <li><code>--timestamps</code>: Prefix each line with its timestamp</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Terminate a running container.</p> <p>By default, this will send the container a SIGINT signal that Modal will handle.
For Functions, any inputs that are currently running on the container will be cancelled
and rescheduled on other containers.</p> <p>With <code>--graceful</code>, the container will be allowed to finish the inputs it is currently
running, exiting once they complete. Graceful stops are only supported for containers
running a Modal Function.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--graceful</code>: Let the container finish its current inputs before exiting, instead of cancelling them.</li> <li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function x(e,f){let p=n(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,r(()=>p,()=>d,{children:(e,n)=>{var r=b(),u=i(r);c(u,{id:`modal-container`,children:(e,n)=>{t(e,h())},$$slots:{default:!0}});var d=a(u,6);l(d,{code:`modal%20container%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var f=a(d,10);s(f,{id:`modal-container-exec`,children:(e,n)=>{t(e,g())},$$slots:{default:!0}});var p=a(f,6);l(p,{code:`modal%20container%20exec%20%5BOPTIONS%5D%20CONTAINER_ID%20COMMAND...`,lang:`shell`});var m=a(p,6);s(m,{id:`modal-container-list`,children:(e,n)=>{t(e,_())},$$slots:{default:!0}});var x=a(m,6);l(x,{code:`modal%20container%20list%20%5BOPTIONS%5D`,lang:`shell`});var S=a(x,6);s(S,{id:`modal-container-logs`,children:(e,n)=>{t(e,v())},$$slots:{default:!0}});var C=a(S,10);l(C,{code:`modal%20container%20logs%20ta-123456`,lang:`text`});var w=a(C,4);l(w,{code:`modal%20container%20logs%20ta-123456%20-f`,lang:`text`});var T=a(w,4);l(T,{code:`modal%20container%20logs%20ta-123456%20--since%202h`,lang:`text`});var E=a(T,4);l(E,{code:`modal%20container%20logs%20ta-123456%20--since%202026-03-01T05%3A00%3A00%20--until%202026-03-01T08%3A00%3A00`,lang:`text`});var D=a(E,4);l(D,{code:`modal%20container%20logs%20ta-123456%20--tail%201000`,lang:`text`});var O=a(D,4);l(O,{code:`modal%20container%20logs%20ta-123456%20--all`,lang:`text`});var k=a(O,4);l(k,{code:`modal%20container%20logs%20%5BOPTIONS%5D%20CONTAINER_ID`,lang:`shell`});var A=a(k,6);s(A,{id:`modal-container-stop`,children:(e,n)=>{t(e,y())},$$slots:{default:!0}}),l(a(A,10),{code:`modal%20container%20stop%20%5BOPTIONS%5D%20CONTAINER_ID`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{x as default,d as metadata};
//# sourceMappingURL=BqF31kK92.js.map
