(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c14ef2da-3c88-4b88-94e1-c22c18e1fc7d`,e._sentryDebugIdIdentifier=`sentry-dbid-c14ef2da-3c88-4b88-94e1-c22c18e1fc7d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`modal workspace`,id:`modal-workspace`,children:[{depth:2,value:`modal workspace members`,id:`modal-workspace-members`,children:[{depth:3,value:`modal workspace members list`,id:`modal-workspace-members-list`}]},{depth:2,value:`modal workspace proxy-tokens`,id:`modal-workspace-proxy-tokens`,children:[{depth:3,value:`modal workspace proxy-tokens allow`,id:`modal-workspace-proxy-tokens-allow`},{depth:3,value:`modal workspace proxy-tokens create`,id:`modal-workspace-proxy-tokens-create`},{depth:3,value:`modal workspace proxy-tokens delete`,id:`modal-workspace-proxy-tokens-delete`},{depth:3,value:`modal workspace proxy-tokens list`,id:`modal-workspace-proxy-tokens-list`},{depth:3,value:`modal workspace proxy-tokens revoke`,id:`modal-workspace-proxy-tokens-revoke`}]},{depth:2,value:`modal workspace settings`,id:`modal-workspace-settings`,children:[{depth:3,value:`modal workspace settings list`,id:`modal-workspace-settings-list`},{depth:3,value:`modal workspace settings set`,id:`modal-workspace-settings-set`}]}]}],rawContent:`# \`modal workspace\`

Interact with the current Modal Workspace.

A Workspace is the top-level account that owns your Modal resources. Use these commands
to manage workspace-level settings such as proxy tokens.

**Usage**:

\`\`\`shell
modal workspace [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`members\`: View the members of the current Workspace.
* \`proxy-tokens\`: Manage the proxy tokens of the current Workspace.
* \`settings\`: Manage workspace settings.

## \`modal workspace members\`

View the members of the current Workspace.

**Usage**:

\`\`\`shell
modal workspace members [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`list\`: List the members of the current Workspace.

### \`modal workspace members list\`

List the members of the current Workspace.

**Usage**:

\`\`\`shell
modal workspace members list [OPTIONS]
\`\`\`

**Options**:

* \`--json\`
* \`--help\`: Show this message and exit.

## \`modal workspace proxy-tokens\`

Manage the proxy tokens of the current Workspace.

Proxy tokens provide authentication to Modal Endpoints, Servers, and Web Functions.

Proxy tokens and secrets have \`wk-\` and \`ws-\` prefixes, respectively. They cannot be
interchanged with API tokens (which use \`ak-\` and \`as-\` prefixes).

Proxy tokens are passed as request headers, either as a key / secret pair:

\`\`\`
Modal-Key: wk-123
Modal-Secret: ws-456
\`\`\`

Or as a single Bearer token:

\`\`\`
Authorization: Bearer wk-123.ws-456
\`\`\`

See https://modal.com/docs/guide/webhook-proxy-auth for more information.

On workspaces with RBAC enabled, tokens are scoped to specific environments;
use the \`allow\` and \`revoke\` commands to manage environment associations.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`allow\`: Allow a proxy token to authenticate to an environment.
* \`create\`: Create a proxy token in the current Workspace.
* \`delete\`: Delete a proxy token from the current Workspace.
* \`list\`: List the proxy tokens of the current Workspace.
* \`revoke\`: Revoke a proxy token's access to an environment.

### \`modal workspace proxy-tokens allow\`

Allow a proxy token to authenticate to an environment.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens allow [OPTIONS] TOKEN_ID ENVIRONMENT_NAME
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

### \`modal workspace proxy-tokens create\`

Create a proxy token in the current Workspace.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens create [OPTIONS]
\`\`\`

**Options**:

* \`--json\`
* \`--help\`: Show this message and exit.

### \`modal workspace proxy-tokens delete\`

Delete a proxy token from the current Workspace.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens delete [OPTIONS] TOKEN_ID
\`\`\`

**Options**:

* \`-y, --yes\`: Run without pausing for confirmation.
* \`--help\`: Show this message and exit.

### \`modal workspace proxy-tokens list\`

List the proxy tokens of the current Workspace.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens list [OPTIONS]
\`\`\`

**Options**:

* \`-e, --environment TEXT\`: Only list tokens associated with this environment. Lists all tokens when omitted.
* \`--json\`
* \`--help\`: Show this message and exit.

### \`modal workspace proxy-tokens revoke\`

Revoke a proxy token's access to an environment.

**Usage**:

\`\`\`shell
modal workspace proxy-tokens revoke [OPTIONS] TOKEN_ID ENVIRONMENT_NAME
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

## \`modal workspace settings\`

Manage workspace settings. Must be workspace manager or owner.

**Usage**:

\`\`\`shell
modal workspace settings [OPTIONS] COMMAND [ARGS]...
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.

**Commands**:

* \`list\`: View the current settings for the workspace.
* \`set\`: Update a workspace setting.

### \`modal workspace settings list\`

View the current settings for the workspace.

**Usage**:

\`\`\`shell
modal workspace settings list [OPTIONS]
\`\`\`

**Options**:

* \`--json\`
* \`--help\`: Show this message and exit.

### \`modal workspace settings set\`

Update a workspace setting. Must be workspace manager or owner.

The following settings can be updated:
- \`image-builder-version\`: The image builder version determines the software included in our base images.
- \`default-environment\`: The default environment to use when the environment is omitted from SDK or CLI methods.

Usage:
- \`modal workspace settings set image-builder-version 2025.06\`
- \`modal workspace settings set default-environment main\`

**Usage**:

\`\`\`shell
modal workspace settings set [OPTIONS] SETTING VALUE
\`\`\`

**Options**:

* \`--help\`: Show this message and exit.
`,meta:{title:`modal workspace`,description:`Interact with the current Modal Workspace.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal workspace</code>`),x=t(`<code>modal workspace members</code>`),S=t(`<code>modal workspace members list</code>`),C=t(`<code>modal workspace proxy-tokens</code>`),w=t(`<code>modal workspace proxy-tokens allow</code>`),T=t(`<code>modal workspace proxy-tokens create</code>`),E=t(`<code>modal workspace proxy-tokens delete</code>`),D=t(`<code>modal workspace proxy-tokens list</code>`),O=t(`<code>modal workspace proxy-tokens revoke</code>`),k=t(`<code>modal workspace settings</code>`),A=t(`<code>modal workspace settings list</code>`),j=t(`<code>modal workspace settings set</code>`),M=t(`<!> <p>Interact with the current Modal Workspace.</p> <p>A Workspace is the top-level account that owns your Modal resources. Use these commands
to manage workspace-level settings such as proxy tokens.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>members</code>: View the members of the current Workspace.</li> <li><code>proxy-tokens</code>: Manage the proxy tokens of the current Workspace.</li> <li><code>settings</code>: Manage workspace settings.</li></ul> <!> <p>View the members of the current Workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>list</code>: List the members of the current Workspace.</li></ul> <!> <p>List the members of the current Workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Manage the proxy tokens of the current Workspace.</p> <p>Proxy tokens provide authentication to Modal Endpoints, Servers, and Web Functions.</p> <p>Proxy tokens and secrets have <code>wk-</code> and <code>ws-</code> prefixes, respectively. They cannot be
interchanged with API tokens (which use <code>ak-</code> and <code>as-</code> prefixes).</p> <p>Proxy tokens are passed as request headers, either as a key / secret pair:</p> <!> <p>Or as a single Bearer token:</p> <!> <p>See <!> for more information.</p> <p>On workspaces with RBAC enabled, tokens are scoped to specific environments;
use the <code>allow</code> and <code>revoke</code> commands to manage environment associations.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>allow</code>: Allow a proxy token to authenticate to an environment.</li> <li><code>create</code>: Create a proxy token in the current Workspace.</li> <li><code>delete</code>: Delete a proxy token from the current Workspace.</li> <li><code>list</code>: List the proxy tokens of the current Workspace.</li> <li><code>revoke</code>: Revoke a proxy token’s access to an environment.</li></ul> <!> <p>Allow a proxy token to authenticate to an environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Create a proxy token in the current Workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Delete a proxy token from the current Workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-y, --yes</code>: Run without pausing for confirmation.</li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>List the proxy tokens of the current Workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>-e, --environment TEXT</code>: Only list tokens associated with this environment. Lists all tokens when omitted.</li> <li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Revoke a proxy token’s access to an environment.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Manage workspace settings. Must be workspace manager or owner.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul> <p><strong>Commands</strong>:</p> <ul><li><code>list</code>: View the current settings for the workspace.</li> <li><code>set</code>: Update a workspace setting.</li></ul> <!> <p>View the current settings for the workspace.</p> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--json</code></li> <li><code>--help</code>: Show this message and exit.</li></ul> <!> <p>Update a workspace setting. Must be workspace manager or owner.</p> <p>The following settings can be updated:</p> <ul><li><code>image-builder-version</code>: The image builder version determines the software included in our base images.</li> <li><code>default-environment</code>: The default environment to use when the environment is omitted from SDK or CLI methods.</li></ul> <p>Usage:</p> <ul><li><code>modal workspace settings set image-builder-version 2025.06</code></li> <li><code>modal workspace settings set default-environment main</code></li></ul> <p><strong>Usage</strong>:</p> <!> <p><strong>Options</strong>:</p> <ul><li><code>--help</code>: Show this message and exit.</li></ul>`,1);function N(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=M(),m=s(o);f(m,{id:`modal-workspace`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var g=c(m,8);p(g,{code:`modal%20workspace%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var _=c(g,10);u(_,{id:`modal-workspace-members`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var v=c(_,6);p(v,{code:`modal%20workspace%20members%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var y=c(v,10);d(y,{id:`modal-workspace-members-list`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var N=c(y,6);p(N,{code:`modal%20workspace%20members%20list%20%5BOPTIONS%5D`,lang:`shell`});var P=c(N,6);u(P,{id:`modal-workspace-proxy-tokens`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}});var F=c(P,10);p(F,{code:`Modal-Key%3A%20wk-123%0AModal-Secret%3A%20ws-456`,lang:`text`});var I=c(F,4);p(I,{code:`Authorization%3A%20Bearer%20wk-123.ws-456`,lang:`text`});var L=c(I,2);h(c(e(L)),{href:`https://modal.com/docs/guide/webhook-proxy-auth`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://modal.com/docs/guide/webhook-proxy-auth`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,6);p(R,{code:`modal%20workspace%20proxy-tokens%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var z=c(R,10);d(z,{id:`modal-workspace-proxy-tokens-allow`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}});var B=c(z,6);p(B,{code:`modal%20workspace%20proxy-tokens%20allow%20%5BOPTIONS%5D%20TOKEN_ID%20ENVIRONMENT_NAME`,lang:`shell`});var V=c(B,6);d(V,{id:`modal-workspace-proxy-tokens-create`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}});var H=c(V,6);p(H,{code:`modal%20workspace%20proxy-tokens%20create%20%5BOPTIONS%5D`,lang:`shell`});var U=c(H,6);d(U,{id:`modal-workspace-proxy-tokens-delete`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}});var W=c(U,6);p(W,{code:`modal%20workspace%20proxy-tokens%20delete%20%5BOPTIONS%5D%20TOKEN_ID`,lang:`shell`});var G=c(W,6);d(G,{id:`modal-workspace-proxy-tokens-list`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}});var K=c(G,6);p(K,{code:`modal%20workspace%20proxy-tokens%20list%20%5BOPTIONS%5D`,lang:`shell`});var q=c(K,6);d(q,{id:`modal-workspace-proxy-tokens-revoke`,children:(e,t)=>{i(e,O())},$$slots:{default:!0}});var J=c(q,6);p(J,{code:`modal%20workspace%20proxy-tokens%20revoke%20%5BOPTIONS%5D%20TOKEN_ID%20ENVIRONMENT_NAME`,lang:`shell`});var Y=c(J,6);u(Y,{id:`modal-workspace-settings`,children:(e,t)=>{i(e,k())},$$slots:{default:!0}});var X=c(Y,6);p(X,{code:`modal%20workspace%20settings%20%5BOPTIONS%5D%20COMMAND%20%5BARGS%5D...`,lang:`shell`});var Z=c(X,10);d(Z,{id:`modal-workspace-settings-list`,children:(e,t)=>{i(e,A())},$$slots:{default:!0}});var Q=c(Z,6);p(Q,{code:`modal%20workspace%20settings%20list%20%5BOPTIONS%5D`,lang:`shell`});var $=c(Q,6);d($,{id:`modal-workspace-settings-set`,children:(e,t)=>{i(e,j())},$$slots:{default:!0}}),p(c($,14),{code:`modal%20workspace%20settings%20set%20%5BOPTIONS%5D%20SETTING%20VALUE`,lang:`shell`}),l(4),i(t,o)},$$slots:{default:!0}}))}export{N as default,g as metadata};
//# sourceMappingURL=CIjaTht5.js.map
