(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`48f54d6f-0f74-417f-9f6f-b9c60d53f37f`,e._sentryDebugIdIdentifier=`sentry-dbid-48f54d6f-0f74-417f-9f6f-b9c60d53f37f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Service Users`,id:`service-users`,children:[{depth:2,value:`Create a Service User`,id:`create-a-service-user`},{depth:2,value:`Use Service User Tokens`,id:`use-service-user-tokens`},{depth:2,value:`Delete a Service User`,id:`delete-a-service-user`},{depth:2,value:`Permissions`,id:`permissions`},{depth:2,value:`Securing Service Users`,id:`securing-service-users`}]}],rawContent:`# Service Users

<Callout variant="gated-feature">
Service users are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.
</Callout>

Service users are programmatic accounts that allow automated systems to interact with Modal. They're ideal for CI/CD pipelines, automated deployments, and other workflows that need to authenticate.

## Create a Service User

Service users are only available for shared workspaces. You will need workspace owner or manager privileges to create service users.

To create a service user:

1. Go to your workspace [tokens settings page](/settings/tokens/service-users)
2. Click **New Service User**
3. Enter a name for your service user (must be lowercase alphanumeric, can contain hyphens or underscores)
4. Click **Create**
5. Copy the \`MODAL_TOKEN_ID\` and \`MODAL_TOKEN_SECRET\`. **This is the only time you can view the token secret** for security reasons.
6. Click **Configure environments** to grant the service user access. A new service user has **No Access** to every Environment, so it can't be used until you assign it the **Viewer** or **Contributor** role on at least one Environment.

## Use Service User Tokens

Set the service user credentials as environment variables in your automated environment:

\`\`\`bash
export MODAL_TOKEN_ID=your-token-id
export MODAL_TOKEN_SECRET=your-token-secret
\`\`\`

Once configured, you can use Modal's CLI and Python SDK as usual:

\`\`\`bash
modal deploy your_app.py
\`\`\`

## Delete a Service User

To remove a service user:

1. Go to the [tokens settings page](/settings/tokens/service-users)
2. Find the service user in the table
3. Click **Delete** when you hover over the row

## Permissions

Service users default to **No Access** on every Environment — they cannot read or write to an Environment until you grant them a Role. This differs from Workspace Members, who default to **Contributor**.

Grant a service user the **Viewer** or **Contributor** role on the specific Environments it needs, either:

- from the service user: on the [tokens settings page](/settings/tokens/service-users), open the **⋯** menu on the service user's row and select **Manage environments**, or
- from an Environment: on the [Environment settings page](/settings/workspace-management/environments), click **Manage** on the Environment, then open the **Access Restrictions** tab.

See [Role-Based Access Control](/docs/guide/rbac) for what each Environment Role allows.

## Securing Service Users

Because service user tokens are long-lived and used in automated environments, it's important to limit their access to only what's necessary:

- **Store tokens securely.** Use a secrets manager or your CI/CD platform's built-in secrets storage rather than hardcoding tokens in source code or configuration files.
- **Grant least-privilege access.** Because service users start with **No Access**, assign the **Viewer** or **Contributor** role only on the Environments they actually need, keeping production isolated from development and staging.
`,meta:{title:`Service Users`,description:`Service users are programmatic accounts that allow automated systems to interact with Modal. They’re ideal for CI/CD pipelines, automated deployments, and other workflows that need to authenticate.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`Service users are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.`,1),x=t(`<!> <!> <p>Service users are programmatic accounts that allow automated systems to interact with Modal. They’re ideal for CI/CD pipelines, automated deployments, and other workflows that need to authenticate.</p> <!> <p>Service users are only available for shared workspaces. You will need workspace owner or manager privileges to create service users.</p> <p>To create a service user:</p> <ol><li>Go to your workspace <!></li> <li>Click <strong>New Service User</strong></li> <li>Enter a name for your service user (must be lowercase alphanumeric, can contain hyphens or underscores)</li> <li>Click <strong>Create</strong></li> <li>Copy the <code>MODAL_TOKEN_ID</code> and <code>MODAL_TOKEN_SECRET</code>. <strong>This is the only time you can view the token secret</strong> for security reasons.</li> <li>Click <strong>Configure environments</strong> to grant the service user access. A new service user has <strong>No Access</strong> to every Environment, so it can’t be used until you assign it the <strong>Viewer</strong> or <strong>Contributor</strong> role on at least one Environment.</li></ol> <!> <p>Set the service user credentials as environment variables in your automated environment:</p> <!> <p>Once configured, you can use Modal’s CLI and Python SDK as usual:</p> <!> <!> <p>To remove a service user:</p> <ol><li>Go to the <!></li> <li>Find the service user in the table</li> <li>Click <strong>Delete</strong> when you hover over the row</li></ol> <!> <p>Service users default to <strong>No Access</strong> on every Environment — they cannot read or write to an Environment until you grant them a Role. This differs from Workspace Members, who default to <strong>Contributor</strong>.</p> <p>Grant a service user the <strong>Viewer</strong> or <strong>Contributor</strong> role on the specific Environments it needs, either:</p> <ul><li>from the service user: on the <!>, open the <strong>⋯</strong> menu on the service user’s row and select <strong>Manage environments</strong>, or</li> <li>from an Environment: on the <!>, click <strong>Manage</strong> on the Environment, then open the <strong>Access Restrictions</strong> tab.</li></ul> <p>See <!> for what each Environment Role allows.</p> <!> <p>Because service user tokens are long-lived and used in automated environments, it’s important to limit their access to only what’s necessary:</p> <ul><li><strong>Store tokens securely.</strong> Use a secrets manager or your CI/CD platform’s built-in secrets storage rather than hardcoding tokens in source code or configuration files.</li> <li><strong>Grant least-privilege access.</strong> Because service users start with <strong>No Access</strong>, assign the <strong>Viewer</strong> or <strong>Contributor</strong> role only on the Environments they actually need, keeping production isolated from development and staging.</li></ul>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`service-users`,children:(e,t)=>{l(),i(e,r(`Service Users`))},$$slots:{default:!0}});var g=c(m,2);u(g,{variant:`gated-feature`,children:(e,t)=>{l();var n=b();l(4),i(e,n)},$$slots:{default:!0}});var _=c(g,4);d(_,{id:`create-a-service-user`,children:(e,t)=>{l(),i(e,r(`Create a Service User`))},$$slots:{default:!0}});var v=c(_,6),y=e(v);h(c(e(y)),{href:`/settings/tokens/service-users`,children:(e,t)=>{l(),i(e,r(`tokens settings page`))},$$slots:{default:!0}}),n(y),l(10),n(v);var S=c(v,2);d(S,{id:`use-service-user-tokens`,children:(e,t)=>{l(),i(e,r(`Use Service User Tokens`))},$$slots:{default:!0}});var C=c(S,4);p(C,{code:`export%20MODAL_TOKEN_ID%3Dyour-token-id%0Aexport%20MODAL_TOKEN_SECRET%3Dyour-token-secret`,lang:`bash`});var w=c(C,4);p(w,{code:`modal%20deploy%20your_app.py`,lang:`bash`});var T=c(w,2);d(T,{id:`delete-a-service-user`,children:(e,t)=>{l(),i(e,r(`Delete a Service User`))},$$slots:{default:!0}});var E=c(T,4),D=e(E);h(c(e(D)),{href:`/settings/tokens/service-users`,children:(e,t)=>{l(),i(e,r(`tokens settings page`))},$$slots:{default:!0}}),n(D),l(4),n(E);var O=c(E,2);d(O,{id:`permissions`,children:(e,t)=>{l(),i(e,r(`Permissions`))},$$slots:{default:!0}});var k=c(O,6),A=e(k);h(c(e(A)),{href:`/settings/tokens/service-users`,children:(e,t)=>{l(),i(e,r(`tokens settings page`))},$$slots:{default:!0}}),l(5),n(A);var j=c(A,2);h(c(e(j)),{href:`/settings/workspace-management/environments`,children:(e,t)=>{l(),i(e,r(`Environment settings page`))},$$slots:{default:!0}}),l(5),n(j),n(k);var M=c(k,2);h(c(e(M)),{href:`/docs/guide/rbac`,children:(e,t)=>{l(),i(e,r(`Role-Based Access Control`))},$$slots:{default:!0}}),l(),n(M),d(c(M,2),{id:`securing-service-users`,children:(e,t)=>{l(),i(e,r(`Securing Service Users`))},$$slots:{default:!0}}),l(4),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=Bhhr1gdf2.js.map
