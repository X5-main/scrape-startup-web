(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`63af7852-b6f1-4863-b297-b446324502ed`,e._sentryDebugIdIdentifier=`sentry-dbid-63af7852-b6f1-4863-b297-b446324502ed`)}catch{}})();import{$t as e,St as t,Tn as n,bt as r,c as i,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`modal billing`,id:`modal-billing`,children:[{depth:2,value:`modal billing rates`,id:`modal-billing-rates`},{depth:2,value:`modal billing report`,id:`modal-billing-report`},{depth:2,value:`modal billing summary`,id:`modal-billing-summary`}]}],rawContent:`# \`modal billing\`

View workspace billing information.

**Usage**:

\`\`\`shell
modal billing [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`rates\`: Return current pricing rates.
* \`report\`: Generate a billing report for the workspace.
* \`summary\`: Generate a billing summary for the workspace.

## \`modal billing rates\`

Return current pricing rates.

Examples:

\`\`\`bash
modal billing rates
\`\`\`

**Usage**:

\`\`\`shell
modal billing rates [OPTIONS]
\`\`\`

**Options**:

* \`--json\`: Output as JSON.
* \`--help\`: Show this message and exit.

## \`modal billing report\`

Generate a billing report for the workspace.

The report range can be provided by setting \`--start\` / \`--end\` dates (\`--end\` defaults to 'now')
or by requesting a date range using \`--for\` (e.g., \`--for today\`, \`--for 'last month'\`).

This command provides a CLI frontend for the
[\`Workspace.billing.report\`](https://modal.com/docs/sdk/py/latest/Workspace#billingreport) API.

Note that, as with the API, the start date is inclusive and the end date is exclusive.
Data will be reported for full intervals only. Using \`--for\` is a convenient way to define a
complete interval.

In addition, the \`--show-resources\` option further breaks the cost in each bucket by the resource
that generated it (CPU, Memory, specific GPU types, etc.). Note that the specific resource types
included in the report are subject to change as Modal's billing model evolves.

Examples:

\`\`\`bash
modal billing report --start 2025-12-01 --end 2026-01-01

modal billing report --for "last month" --tag-names team,project

modal billing report --for today --resolution h

modal billing report --for "this month" --show-resources

modal billing report --for yesterday -r h --tz local

modal billing report --for "last month" --csv > report.csv

modal billing report --start 2025-12-01 --json > report.json
\`\`\`

**Usage**:

\`\`\`shell
modal billing report [OPTIONS]
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

## \`modal billing summary\`

Generate a billing summary for the workspace.

The summary range can be provided by setting \`--for\` (e.g \`--for 'last month'\`). If not
provided, \`--for\` defaults to "this month".

Summaries are provided for single month intervals (aligned to the month boundary) only. To see
summaries for longer intervals, call \`summary\` for each month in the interval.

This command provides a CLI frontend for the
[\`Workspace.billing.summary\`](https://modal.com/docs/sdk/py/latest/Workspace#billingsummary) API.

Examples:

\`\`\`bash
modal billing summary # defaults to --for "this month"

modal billing summary --for "last month"

modal billing summary --for 2026-01
\`\`\`

**Usage**:

\`\`\`shell
modal billing summary [OPTIONS]
\`\`\`

**Options**:

* \`--for TEXT\`: What cycle to show a summary for. Accepts: "this month", "last month", and ISO 8601 months ("YYYY-MM").
* \`--json\`: Output as JSON.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal billing`,description:`View workspace billing information.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<code>modal billing</code>`),y=t(`<code>modal billing rates</code>`),b=t(`<code>modal billing report</code>`),x=t(`<code>Workspace.billing.report</code>`),S=t(`<code>modal billing summary</code>`),C=t(`<code>Workspace.billing.summary</code>`),w=t(`<!> <p>View workspace billing information.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>rates</code>: Return current pricing rates.</li> <li><code>report</code>: Generate a billing report for the workspace.</li> <li><code>summary</code>: Generate a billing summary for the workspace.</li></ul> <!> <p>Return current pricing rates.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code>: Output as JSON.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Generate a billing report for the workspace.</p> <p>The report range can be provided by setting <code>--start</code> / <code>--end</code> dates (<code>--end</code> defaults to ‘now’)
or by requesting a date range using <code>--for</code> (e.g., <code>--for today</code>, <code>--for 'last month'</code>).</p> <p>This command provides a CLI frontend for the <!> API.</p> <p>Note that, as with the API, the start date is inclusive and the end date is exclusive.
Data will be reported for full intervals only. Using <code>--for</code> is a convenient way to define a
complete interval.</p> <p>In addition, the <code>--show-resources</code> option further breaks the cost in each bucket by the resource
that generated it (CPU, Memory, specific GPU types, etc.). Note that the specific resource types
included in the report are subject to change as Modal’s billing model evolves.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--start TEXT</code>: Start date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.).</li> <li><code>--end TEXT</code>: End date. Date (in UTC by default): ISO format (2025-01-01) or relative (yesterday, 3 days ago, etc.). Defaults to now.</li> <li><code>--for TEXT</code>: Convenience range: today, yesterday, this week, last week, this month, last month.</li> <li><code>-r, --resolution TEXT</code>: Time resolution: ‘d’ (daily) or ‘h’ (hourly).</li> <li><code>--tz TEXT</code>: Timezone for date interpretation: ‘local’, offset (5, -4, +05:30), or IANA name. Requires hourly resolution.</li> <li><code>-t, --tag-names TEXT</code>: Comma-separated list of tag names to include.</li> <li><code>--show-resources</code>: Further break down usage by resource type.</li> <li><code>--json</code>: Output as JSON.</li> <li><code>--csv</code>: Output as CSV.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Generate a billing summary for the workspace.</p> <p>The summary range can be provided by setting <code>--for</code> (e.g <code>--for 'last month'</code>). If not
provided, <code>--for</code> defaults to “this month”.</p> <p>Summaries are provided for single month intervals (aligned to the month boundary) only. To see
summaries for longer intervals, call <code>summary</code> for each month in the interval.</p> <p>This command provides a CLI frontend for the <!> API.</p> <p>Examples:</p> <!> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--for TEXT</code>: What cycle to show a summary for. Accepts: “this month”, “last month”, and ISO 8601 months (“YYYY-MM”).</li> <li><code>--json</code>: Output as JSON.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function T(t,h){let g=i(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,a(()=>g,()=>m,{children:(t,i)=>{var a=w(),f=o(a);u(f,{id:`modal-billing`,children:(e,t)=>{r(e,v())},$$slots:{default:!0}});var m=s(f,6);d(m,{code:`modal%20billing%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var h=s(m,10);l(h,{id:`modal-billing-rates`,children:(e,t)=>{r(e,y())},$$slots:{default:!0}});var g=s(h,6);d(g,{code:`modal%20billing%20rates`,lang:`bash`});var _=s(g,4);d(_,{code:`modal%20billing%20rates%20%5BOPTIONS%5D`,lang:`shell`});var T=s(_,6);l(T,{id:`modal-billing-report`,children:(e,t)=>{r(e,b())},$$slots:{default:!0}});var E=s(T,6);p(s(e(E)),{href:`https://modal.com/docs/sdk/py/latest/Workspace#billingreport`,rel:`nofollow`,children:(e,t)=>{r(e,x())},$$slots:{default:!0}}),c(),n(E);var D=s(E,8);d(D,{code:`modal%20billing%20report%20--start%202025-12-01%20--end%202026-01-01%0A%0Amodal%20billing%20report%20--for%20%22last%20month%22%20--tag-names%20team%2Cproject%0A%0Amodal%20billing%20report%20--for%20today%20--resolution%20h%0A%0Amodal%20billing%20report%20--for%20%22this%20month%22%20--show-resources%0A%0Amodal%20billing%20report%20--for%20yesterday%20-r%20h%20--tz%20local%0A%0Amodal%20billing%20report%20--for%20%22last%20month%22%20--csv%20%3E%20report.csv%0A%0Amodal%20billing%20report%20--start%202025-12-01%20--json%20%3E%20report.json`,lang:`bash`});var O=s(D,4);d(O,{code:`modal%20billing%20report%20%5BOPTIONS%5D`,lang:`shell`});var k=s(O,6);l(k,{id:`modal-billing-summary`,children:(e,t)=>{r(e,S())},$$slots:{default:!0}});var A=s(k,8);p(s(e(A)),{href:`https://modal.com/docs/sdk/py/latest/Workspace#billingsummary`,rel:`nofollow`,children:(e,t)=>{r(e,C())},$$slots:{default:!0}}),c(),n(A);var j=s(A,4);d(j,{code:`modal%20billing%20summary%20%23%20defaults%20to%20--for%20%22this%20month%22%0A%0Amodal%20billing%20summary%20--for%20%22last%20month%22%0A%0Amodal%20billing%20summary%20--for%202026-01`,lang:`bash`}),d(s(j,4),{code:`modal%20billing%20summary%20%5BOPTIONS%5D`,lang:`shell`}),c(4),r(t,a)},$$slots:{default:!0}}))}export{T as default,m as metadata};
//# sourceMappingURL=Dzmj4xVl2.js.map
