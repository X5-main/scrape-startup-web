(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f0d0dc87-fbb5-4287-813d-0ecb02b0fb45`,e._sentryDebugIdIdentifier=`sentry-dbid-f0d0dc87-fbb5-4287-813d-0ecb02b0fb45`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`modal environment`,id:`modal-environment`,children:[{depth:2,value:`modal environment billing`,id:`modal-environment-billing`,children:[{depth:3,value:`modal environment billing report`,id:`modal-environment-billing-report`},{depth:3,value:`modal environment billing summary`,id:`modal-environment-billing-summary`}]},{depth:2,value:`modal environment create`,id:`modal-environment-create`},{depth:2,value:`modal environment delete`,id:`modal-environment-delete`},{depth:2,value:`modal environment list`,id:`modal-environment-list`},{depth:2,value:`modal environment roles`,id:`modal-environment-roles`,children:[{depth:3,value:`modal environment roles list`,id:`modal-environment-roles-list`},{depth:3,value:`modal environment roles update`,id:`modal-environment-roles-update`}]},{depth:2,value:`modal environment update`,id:`modal-environment-update`}]}],rawContent:`# \`modal environment\`

Create and interact with Environments

Environments are sub-divisions of workspaces, allowing you to deploy the same app
in different namespaces. Each environment has their own set of Secrets and any
lookups performed from an app in an environment will by default look for entities
in the same environment.

Typical use cases for environments include having one for development and one for
production, to prevent overwriting production apps when developing new features
while still being able to deploy changes to a live environment.

**Usage**:

\`\`\`shell
modal environment [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`billing\`: View billing and usage info for the given Environment.
* \`create\`: Create a new environment in the current workspace.
* \`delete\`: Delete an environment in the current workspace.
* \`list\`: List all environments in the current workspace.
* \`roles\`: Manage the Environment Roles of users and service users.
* \`update\`: Update environment-level settings.

## \`modal environment billing\`

View billing and usage info for the given Environment.

**Usage**:

\`\`\`shell
modal environment billing [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`report\`: Generate a billing report for the specified Environment.
* \`summary\`: Generate a billing summary for the specified Environment.

### \`modal environment billing report\`

Generate a billing report for the specified Environment.

The report range can be provided by setting \`--start\` / \`--end\` dates (\`--end\` defaults to 'now')
or by requesting a date range using \`--for\` (e.g., \`--for today\`, \`--for 'last month'\`).

This command provides a CLI frontend for the
[\`Environment.billing.report\`](https://modal.com/docs/sdk/py/latest/Environment#billingreport)
API.

Note that, as with the API, the start date is inclusive and the end date is exclusive.
Data will be reported for full intervals only. Using \`--for\` is a convenient way to define a
complete interval.

In addition, the \`--show-resources\` option further breaks the cost in each bucket by the resource
that generated it (CPU, Memory, specific GPU types, etc.). Note that the specific resource types
included in the report are subject to change as Modal's billing model evolves.

Examples:

\`\`\`bash
modal environment billing report --start 2025-12-01 --end 2026-01-01

modal environment billing report --for "last month" --tag-names team,project

modal environment billing report test_env --for today --resolution h

modal environment billing report test_env --for "this month" --show-resources

modal environment billing report prod_env --for yesterday -r h --tz local

modal environment billing report main_env --for "last month" --csv > report.csv

modal environment billing report main_env --start 2025-12-01 --json > report.json
\`\`\`

**Usage**:

\`\`\`shell
modal environment billing report [OPTIONS] [ENVIRONMENT_NAME]
\`\`\`

**Options**:

* \`--start TEXT\`: Start date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.).
* \`--end TEXT\`: End date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.). Defaults to now.
* \`--for TEXT\`: Convenience range: today, yesterday, this week, last week, this month, last month.
* \`-r, --resolution TEXT\`: Time resolution: 'd' (daily) or 'h' (hourly).
* \`--tz TEXT\`: Timezone for date interpretation: 'local', offset (5, -4, +05:30), or IANA name. Requires hourly resolution.
* \`-t, --tag-names TEXT\`: Comma-separated list of tag names to include.
* \`--show-resources\`: Further break down usage by resource type.
* \`--json\`: Output as JSON.
* \`--csv\`: Output as CSV.
* \`--help\`: Show this message and exit.

### \`modal environment billing summary\`

Generate a billing summary for the specified Environment.

If no argument for \`environment_name\` is passed, the method returns a summary for the default
environment.

The summary range can be provided by setting \`--for\` (e.g \`--for 'last month'\`). If not
provided, \`--for\` defaults to "this month".

Summaries are provided for single month intervals (aligned to the month boundary) only. To see
summaries for longer intervals, call \`summary\` for each month in the interval.

This command provides a CLI frontend for the
[\`Environment.billing.summary\`](https://modal.com/docs/sdk/py/latest/Environment#billingsummary)
API.

Examples:

\`\`\`bash
modal environment billing summary # defaults to --for "this month"

modal environment billing summary --for "last month" test_env

modal environment billing summary --for 2026-01
\`\`\`

**Usage**:

\`\`\`shell
modal environment billing summary [OPTIONS] [ENVIRONMENT_NAME]
\`\`\`

**Options**:

* \`--for TEXT\`: What cycle to show a summary for. Accepts: "this month", "last month", and ISO 8601 months ("YYYY-MM").
* \`--json\`: Output as JSON.
* \`--help\`: Show this message and exit.

## \`modal environment create\`

Create a new environment in the current workspace.

**Usage**:

\`\`\`shell
modal environment create [OPTIONS] NAME
\`\`\`

**Options**:

* \`--restricted\`: Enable RBAC restrictions on the new environment
* \`--default-role TEXT\`: Default member Role for the Restricted Environment
* \`--help\`: Show this message and exit.

## \`modal environment delete\`

Delete an environment in the current workspace.

Deletes all apps in the selected environment and deletes the environment irrevocably.

**Usage**:

\`\`\`shell
modal environment delete [OPTIONS] NAME
\`\`\`

**Options**:

* \`-y, --yes\`: Run without pausing for confirmation.
* \`--help\`: Show this message and exit.

## \`modal environment list\`

List all environments in the current workspace.

**Usage**:

\`\`\`shell
modal environment list [OPTIONS]
\`\`\`

**Options**:

* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal environment roles\`

Manage the Environment Roles of users and service users.

An Environment Role is one of 'contributor' (read-write), 'viewer' (read-only), or
'no-access', and dictates access to Environments. See
https://modal.com/docs/guide/rbac for details on which principals can be assigned
which roles.

**Usage**:

\`\`\`shell
modal environment roles [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`list\`: List the roles of each user and service user in an Environment
* \`update\`: Update a user's or service user's role in an Environment

### \`modal environment roles list\`

List the roles of each user and service user in an Environment

**Usage**:

\`\`\`shell
modal environment roles list [OPTIONS] ENVIRONMENT
\`\`\`

**Options**:

* \`--exclude-default\`: Only list roles that are directly assigned
* \`--json\`
* \`--help\`: Show this message and exit.

### \`modal environment roles update\`

Update a user's or service user's role in an Environment

**Usage**:

\`\`\`shell
modal environment roles update [OPTIONS] ENVIRONMENT PRINCIPAL
\`\`\`

**Options**:

* \`--role [contributor|viewer|no-access]\`: Role to assign  [required]
* \`--service-user\`: Treat PRINCIPAL as the name of a service user
* \`--help\`: Show this message and exit.

## \`modal environment update\`

Update environment-level settings.

**Usage**:

\`\`\`shell
modal environment update [OPTIONS] CURRENT_NAME
\`\`\`

**Options**:

* \`--set-name TEXT\`: New name of the environment
* \`--set-web-suffix TEXT\`: New web suffix of environment (empty string is no suffix)
* \`--help\`: Show this message and exit.
`,meta:{title:`modal environment`,description:`Create and interact with Environments`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal environment</code>`),x=t(`<code>modal environment billing</code>`),S=t(`<code>modal environment billing report</code>`),ee=t(`<code>Environment.billing.report</code>`),C=t(`<code>modal environment billing summary</code>`),w=t(`<code>Environment.billing.summary</code>`),T=t(`<code>modal environment create</code>`),E=t(`<code>modal environment delete</code>`),D=t(`<code>modal environment list</code>`),O=t(`<code>modal environment roles</code>`),k=t(`<code>modal environment roles list</code>`),A=t(`<code>modal environment roles update</code>`),j=t(`<code>modal environment update</code>`),M=t(`<!> <p>Create and interact with Environments</p> <p>Environments are sub-divisions of workspaces, allowing you to deploy the same app
in different namespaces. Each environment has their own set of Secrets and any
lookups performed from an app in an environment will by default look for entities
in the same environment.</p> <p>Typical use cases for environments include having one for development and one for
production, to prevent overwriting production apps when developing new features
while still being able to deploy changes to a live environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>billing</code>: View billing and usage info for the given Environment.</li> <li><code>create</code>: Create a new environment in the current workspace.</li> <li><code>delete</code>: Delete an environment in the current workspace.</li> <li><code>list</code>: List all environments in the current workspace.</li> <li><code>roles</code>: Manage the Environment Roles of users and service users.</li> <li><code>update</code>: Update environment-level settings.</li></ul> <!> <p>View billing and usage info for the given Environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>report</code>: Generate a billing report for the specified Environment.</li> <li><code>summary</code>: Generate a billing summary for the specified Environment.</li></ul> <!> <p>Generate a billing report for the specified Environment.</p> <p>The report range can be provided by setting <code>--start</code> / <code>--end</code> dates (<code>--end</code> defaults to ‘now’)
or by requesting a date range using <code>--for</code> (e.g., <code>--for today</code>, <code>--for 'last month'</code>).</p> <p>This command provides a CLI frontend for the <!> API.</p> <p>Note that, as with the API, the start date is inclusive and the end date is exclusive.
Data will be reported for full intervals only. Using <code>--for</code> is a convenient way to define a
complete interval.</p> <p>In addition, the <code>--show-resources</code> option further breaks the cost in each bucket by the resource
that generated it (CPU, Memory, specific GPU types, etc.). Note that the specific resource types
included in the report are subject to change as Modal’s billing model evolves.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--start TEXT</code>: Start date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.).</li> <li><code>--end TEXT</code>: End date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.). Defaults to now.</li> <li><code>--for TEXT</code>: Convenience range: today, yesterday, this week, last week, this month, last month.</li> <li><code>-r, --resolution TEXT</code>: Time resolution: ‘d’ (daily) or ‘h’ (hourly).</li> <li><code>--tz TEXT</code>: Timezone for date interpretation: ‘local’, offset (5, -4, +05:30), or IANA name. Requires hourly resolution.</li> <li><code>-t, --tag-names TEXT</code>: Comma-separated list of tag names to include.</li> <li><code>--show-resources</code>: Further break down usage by resource type.</li> <li><code>--json</code>: Output as JSON.</li> <li><code>--csv</code>: Output as CSV.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Generate a billing summary for the specified Environment.</p> <p>If no argument for <code>environment_name</code> is passed, the method returns a summary for the default
environment.</p> <p>The summary range can be provided by setting <code>--for</code> (e.g <code>--for 'last month'</code>). If not
provided, <code>--for</code> defaults to “this month”.</p> <p>Summaries are provided for single month intervals (aligned to the month boundary) only. To see
summaries for longer intervals, call <code>summary</code> for each month in the interval.</p> <p>This command provides a CLI frontend for the <!> API.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--for TEXT</code>: What cycle to show a summary for. Accepts: “this month”, “last month”, and ISO 8601 months (“YYYY-MM”).</li> <li><code>--json</code>: Output as JSON.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Create a new environment in the current workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--restricted</code>: Enable RBAC restrictions on the new environment</li> <li><code>--default-role TEXT</code>: Default member Role for the Restricted Environment</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Delete an environment in the current workspace.</p> <p>Deletes all apps in the selected environment and deletes the environment irrevocably.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List all environments in the current workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Manage the Environment Roles of users and service users.</p> <p>An Environment Role is one of ‘contributor’ (read-write), ‘viewer’ (read-only), or
‘no-access’, and dictates access to Environments. See <!> for details on which principals can be assigned
which roles.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>list</code>: List the roles of each user and service user in an Environment</li> <li><code>update</code>: Update a user’s or service user’s role in an Environment</li></ul> <!> <p>List the roles of each user and service user in an Environment</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--exclude-default</code>: Only list roles that are directly assigned</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Update a user’s or service user’s role in an Environment</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--role [contributor|viewer|no-access]</code>: Role to assign  [required]</li> <li><code>--service-user</code>: Treat PRINCIPAL as the name of a service user</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Update environment-level settings.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--set-name TEXT</code>: New name of the environment</li> <li><code>--set-web-suffix TEXT</code>: New web suffix of environment (empty string is no suffix)</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function N(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=M(),m=s(o);f(m,{id:`modal-environment`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var g=c(m,10);p(g,{code:`modal%20environment%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var _=c(g,10);u(_,{id:`modal-environment-billing`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var v=c(_,6);p(v,{code:`modal%20environment%20billing%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var y=c(v,10);d(y,{id:`modal-environment-billing-report`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var N=c(y,6);h(c(e(N)),{href:`https://modal.com/docs/sdk/py/latest/Environment#billingreport`,rel:`nofollow`,children:(e,t)=>{i(e,ee())},$$slots:{default:!0}}),l(),n(N);var P=c(N,8);p(P,{code:`modal%20environment%20billing%20report%20--start%202025-12-01%20--end%202026-01-01%0A%0Amodal%20environment%20billing%20report%20--for%20%22last%20month%22%20--tag-names%20team%2Cproject%0A%0Amodal%20environment%20billing%20report%20test_env%20--for%20today%20--resolution%20h%0A%0Amodal%20environment%20billing%20report%20test_env%20--for%20%22this%20month%22%20--show-resources%0A%0Amodal%20environment%20billing%20report%20prod_env%20--for%20yesterday%20-r%20h%20--tz%20local%0A%0Amodal%20environment%20billing%20report%20main_env%20--for%20%22last%20month%22%20--csv%20%3E%20report.csv%0A%0Amodal%20environment%20billing%20report%20main_env%20--start%202025-12-01%20--json%20%3E%20report.json`,lang:`bash`});var F=c(P,4);p(F,{code:`modal%20environment%20billing%20report%20%5BOPTIONS%5D%20%5BENVIRONMENT_NAME%5D`,lang:`shell`});var I=c(F,6);d(I,{id:`modal-environment-billing-summary`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}});var L=c(I,10);h(c(e(L)),{href:`https://modal.com/docs/sdk/py/latest/Environment#billingsummary`,rel:`nofollow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(L);var R=c(L,4);p(R,{code:`modal%20environment%20billing%20summary%20%23%20defaults%20to%20--for%20%22this%20month%22%0A%0Amodal%20environment%20billing%20summary%20--for%20%22last%20month%22%20test_env%0A%0Amodal%20environment%20billing%20summary%20--for%202026-01`,lang:`bash`});var z=c(R,4);p(z,{code:`modal%20environment%20billing%20summary%20%5BOPTIONS%5D%20%5BENVIRONMENT_NAME%5D`,lang:`shell`});var B=c(z,6);u(B,{id:`modal-environment-create`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}});var V=c(B,6);p(V,{code:`modal%20environment%20create%20%5BOPTIONS%5D%20NAME`,lang:`shell`});var H=c(V,6);u(H,{id:`modal-environment-delete`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var U=c(H,8);p(U,{code:`modal%20environment%20delete%20%5BOPTIONS%5D%20NAME`,lang:`shell`});var W=c(U,6);u(W,{id:`modal-environment-list`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}});var G=c(W,6);p(G,{code:`modal%20environment%20list%20%5BOPTIONS%5D`,lang:`shell`});var K=c(G,6);u(K,{id:`modal-environment-roles`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}});var q=c(K,4);h(c(e(q)),{href:`https://modal.com/docs/guide/rbac`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://modal.com/docs/guide/rbac`))},$$slots:{default:!0}}),l(),n(q);var J=c(q,4);p(J,{code:`modal%20environment%20roles%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var Y=c(J,10);d(Y,{id:`modal-environment-roles-list`,children:(e,t)=>{i(e,k())},$$slots:{default:!0}});var X=c(Y,6);p(X,{code:`modal%20environment%20roles%20list%20%5BOPTIONS%5D%20ENVIRONMENT`,lang:`shell`});var Z=c(X,6);d(Z,{id:`modal-environment-roles-update`,children:(e,t)=>{i(e,A())},$$slots:{default:!0}});var Q=c(Z,6);p(Q,{code:`modal%20environment%20roles%20update%20%5BOPTIONS%5D%20ENVIRONMENT%20PRINCIPAL`,lang:`shell`});var $=c(Q,6);u($,{id:`modal-environment-update`,children:(e,t)=>{i(e,j())},$$slots:{default:!0}}),p(c($,6),{code:`modal%20environment%20update%20%5BOPTIONS%5D%20CURRENT_NAME`,lang:`shell`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{N as default,g as metadata};
//# sourceMappingURL=Clr0XZIc2.js.map
