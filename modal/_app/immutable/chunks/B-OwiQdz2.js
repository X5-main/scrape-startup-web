(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7bdc972d-1e18-488e-b6f3-aa3d715b0135`,e._sentryDebugIdIdentifier=`sentry-dbid-7bdc972d-1e18-488e-b6f3-aa3d715b0135`)}catch{}})();import{St as e,bt as t,c as n,d as r,en as i,tn as a,wn as o}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as s,o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";var d={toc:[{depth:1,value:`modal secret`,id:`modal-secret`,children:[{depth:2,value:`modal secret create`,id:`modal-secret-create`},{depth:2,value:`modal secret delete`,id:`modal-secret-delete`},{depth:2,value:`modal secret list`,id:`modal-secret-list`}]}],rawContent:`# \`modal secret\`

Manage secrets.

**Usage**:

\`\`\`shell
modal secret [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`create\`: Create a new secret.
* \`delete\`: Delete a named Secret.
* \`list\`: List your published secrets.

## \`modal secret create\`

Create a new secret.

**Usage**:

\`\`\`shell
modal secret create [OPTIONS] SECRET_NAME [KEYVALUES]...
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--from-dotenv PATH\`: Path to a .env file to load secrets from.
* \`--from-json PATH\`: Path to a JSON file to load secrets from.
* \`--force\`: Overwrite the secret if it already exists.
* \`--help\`: Show this message and exit.

## \`modal secret delete\`

Delete a named Secret.

**Usage**:

\`\`\`shell
modal secret delete [OPTIONS] NAME
\`\`\`

**Options**:

* \`--allow-missing\`: Don't error if the Secret doesn't exist.
* \`-y, --yes\`: Run without pausing for confirmation.
* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--help\`: Show this message and exit.

## \`modal secret list\`

List your published secrets.

**Usage**:

\`\`\`shell
modal secret list [OPTIONS]
\`\`\`

**Options**:

* \`-e, --env TEXT\`: Environment to interact with. If unspecified, defers to \`MODAL_ENVIRONMENT\`, your active local profile, or your workspace default, in that order.
* \`--json\`
* \`--help\`: Show this message and exit.
`,meta:{title:`modal secret`,description:`Manage secrets.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<code>modal secret</code>`),g=e(`<code>modal secret create</code>`),_=e(`<code>modal secret delete</code>`),v=e(`<code>modal secret list</code>`),y=e(`<!> <p>Manage secrets.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>create</code>: Create a new secret.</li> <li><code>delete</code>: Delete a named Secret.</li> <li><code>list</code>: List your published secrets.</li></ul> <!> <p>Create a new secret.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--from-dotenv PATH</code>: Path to a .env file to load secrets from.</li> <li><code>--from-json PATH</code>: Path to a JSON file to load secrets from.</li> <li><code>--force</code>: Overwrite the secret if it already exists.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Delete a named Secret.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--allow-missing</code>: Don’t error if the Secret doesn’t exist.</li> <li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List your published secrets.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --env TEXT</code>: Environment to interact with. If unspecified, defers to <code>MODAL_ENVIRONMENT</code>, your active local profile, or your workspace default, in that order.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul>`,1);function b(e,f){let p=n(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,r(()=>p,()=>d,{children:(e,n)=>{var r=y(),u=i(r);c(u,{id:`modal-secret`,children:(e,n)=>{t(e,h())},$$slots:{default:!0}});var d=a(u,6);l(d,{code:`modal%20secret%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var f=a(d,10);s(f,{id:`modal-secret-create`,children:(e,n)=>{t(e,g())},$$slots:{default:!0}});var p=a(f,6);l(p,{code:`modal%20secret%20create%20%5BOPTIONS%5D%20SECRET_NAME%20%5BKEYVALUES%5D...`,lang:`shell`});var m=a(p,6);s(m,{id:`modal-secret-delete`,children:(e,n)=>{t(e,_())},$$slots:{default:!0}});var b=a(m,6);l(b,{code:`modal%20secret%20delete%20%5BOPTIONS%5D%20NAME`,lang:`shell`});var x=a(b,6);s(x,{id:`modal-secret-list`,children:(e,n)=>{t(e,v())},$$slots:{default:!0}}),l(a(x,6),{code:`modal%20secret%20list%20%5BOPTIONS%5D`,lang:`shell`}),o(4),t(e,r)},$$slots:{default:!0}}))}export{b as default,d as metadata};
//# sourceMappingURL=B-OwiQdz2.js.map
