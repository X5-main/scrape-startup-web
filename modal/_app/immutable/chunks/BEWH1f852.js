(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6da204a1-189b-42c7-913a-b340502f8b94`,e._sentryDebugIdIdentifier=`sentry-dbid-6da204a1-189b-42c7-913a-b340502f8b94`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as s}from"./CPby7b1n.js";import{t as c}from"./BILrvr3I.js";import{t as l}from"./B4L_if842.js";var u={toc:[{depth:1,value:`modal changelog`,id:`modal-changelog`}],rawContent:`# \`modal changelog\`

Fetch release notes from the Modal changelog.

This command prints changelog contents as markdown text and is useful for including
information about recent updates in the context for agent development sessions.

By default, the most recent updates in the current release series are shown. Other options
allow for showing changes since a previous version, changes in a specific version, or changes
that are newer than what's currently installed.

Examples:

\`\`\`bash
modal changelog --since 1.2.0  # Show updates added after a specific version

modal changelog --since 2026-01-01  # Show updates added after a specific date

modal changelog --newer  # Show updates released after the currently installed version

modal changelog --last 3  # Show updates included in the 3 most recent releases

modal changelog --for 1.3.1  # Show the changelog for a specific release
\`\`\`

Note: when using \`--since\` or \`--last\`, only changes up to the currently installed version are shown.

**Usage**:

\`\`\`shell
modal changelog [OPTIONS]
\`\`\`

**Options**:

* \`--last INTEGER\`: Show the N most recent entries before the installed version.
* \`--since TEXT\`: Show entries after a version (X.Y.Z) or date (YYYY-MM-DD), exclusive.
* \`--for TEXT\`: Show entries for a version (X.Y.Z) or series (X.Y).
* \`--newer\`: Show entries newer than the installed version.
* \`--all\`: Show all entries.
* \`--json\`: Output as JSON.
* \`--help\`: Show this message and exit.
`,meta:{title:`modal changelog`,description:`Fetch release notes from the Modal changelog.`}},{toc:d,rawContent:f,meta:p}=u,m=e(`<code>modal changelog</code>`),h=e(`<!> <p>Fetch release notes from the Modal changelog.</p> <p>This command prints changelog contents as markdown text and is useful for including
information about recent updates in the context for agent development sessions.</p> <p>By default, the most recent updates in the current release series are shown. Other options
allow for showing changes since a previous version, changes in a specific version, or changes
that are newer than what’s currently installed.</p> <p>Examples:</p> <!> <p>Note: when using <code>--since</code> or <code>--last</code>, only changes up to the currently installed version are shown.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--last INTEGER</code>: Show the N most recent entries before the installed version.</li> <li><code>--since TEXT</code>: Show entries after a version (X.Y.Z) or date (YYYY-MM-DD), exclusive.</li> <li><code>--for TEXT</code>: Show entries for a version (X.Y.Z) or series (X.Y).</li> <li><code>--newer</code>: Show entries newer than the installed version.</li> <li><code>--all</code>: Show all entries.</li> <li><code>--json</code>: Output as JSON.</li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function g(e,d){let f=n(d,[`children`,`$$slots`,`$$events`,`$$legacy`]);l(e,r(()=>f,()=>u,{children:(e,n)=>{var r=h(),l=i(r);s(l,{id:`modal-changelog`,children:(e,n)=>{t(e,m())},$$slots:{default:!0}});var u=a(l,10);c(u,{code:`modal%20changelog%20--since%201.2.0%20%20%23%20Show%20updates%20added%20after%20a%20specific%20version%0A%0Amodal%20changelog%20--since%202026-01-01%20%20%23%20Show%20updates%20added%20after%20a%20specific%20date%0A%0Amodal%20changelog%20--newer%20%20%23%20Show%20updates%20released%20after%20the%20currently%20installed%20version%0A%0Amodal%20changelog%20--last%203%20%20%23%20Show%20updates%20included%20in%20the%203%20most%20recent%20releases%0A%0Amodal%20changelog%20--for%201.3.1%20%20%23%20Show%20the%20changelog%20for%20a%20specific%20release`,lang:`bash`}),c(a(u,6),{code:`modal%20changelog%20%5BOPTIONS%5D`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{g as default,u as metadata};
//# sourceMappingURL=BEWH1f852.js.map
