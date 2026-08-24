(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`54db7e3f-d377-4092-b33f-35395eac8e49`,e._sentryDebugIdIdentifier=`sentry-dbid-54db7e3f-d377-4092-b33f-35395eac8e49`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as ee,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as te}from"./DYSGKh1I.js";import{a as l,i as u,o as ne}from"./CPby7b1n.js";import{n as d}from"./JPsrybyr.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={description:`Control access to Modal Workspaces, Environments, and Web Functions with role-based permissions for Owners, Managers, and Members.`,toc:[{depth:1,value:`Role-Based Access Control (RBAC)`,id:`role-based-access-control-rbac`,children:[{depth:2,value:`Workspace Roles`,id:`workspace-roles`},{depth:2,value:`Environment Roles`,id:`environment-roles`},{depth:2,value:`Setting up Restricted Environments`,id:`setting-up-restricted-environments`,children:[{depth:3,value:`Default access by actor`,id:`default-access-by-actor`},{depth:3,value:`No Access and Workspace defaults`,id:`no-access-and-workspace-defaults`}]},{depth:2,value:`Service users and service tokens`,id:`service-users-and-service-tokens`},{depth:2,value:`Proxy Tokens`,id:`proxy-tokens`,children:[{depth:3,value:`Creating a scoped proxy token`,id:`creating-a-scoped-proxy-token`},{depth:3,value:`Scoped vs. workspace-wide tokens`,id:`scoped-vs-workspace-wide-tokens`}]},{depth:2,value:`Cross-Environment access`,id:`cross-environment-access`,children:[{depth:3,value:`Cross-Environment behavior for app and task identities`,id:`cross-environment-behavior-for-app-and-task-identities`},{depth:3,value:`Example: inbound vs. outbound access`,id:`example-inbound-vs-outbound-access`}]},{depth:2,value:`Protecting production secrets with restricted Environments`,id:`protecting-production-secrets-with-restricted-environments`},{depth:2,value:`Common access patterns`,id:`common-access-patterns`},{depth:2,value:`FAQ`,id:`faq`}]}],rawContent:`# Role-Based Access Control (RBAC)

<Callout variant="gated-feature">
RBAC is available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.
</Callout>

Role-Based Access Control (RBAC) gives Workspace administrators more granular control over who can access and modify resources.

This is especially useful for protecting production while allowing broader access to development and staging.

Modal's RBAC system operates at two levels:

- **Workspace Roles** control overall Workspace permissions.
- **Environment Roles** control access to individual Environments.

## Workspace Roles

Modal [Workspaces](/docs/guide/workspaces) organize Modal Apps and other resources for a group of users. These roles control access at the level of the entire Workspace.

All Workspace Members have one of three Roles that determine their overall permissions:

- **Owner** — Full read-write access to everything in the Workspace, including billing, Workspace management, and all Environments. Can assign any Role to other members.
- **Manager** — Same as Owner, but cannot modify the Owner Role.
- **Member** — Can deploy and manage Apps, but cannot access billing, Workspace management, or other Workspace settings.

## Environment Roles

Modal [Environments](/docs/guide/environments) isolate Modal Apps and other resources from one another within a Workspace.

Every Environment has three Environment Roles that determine access to it:

- **Contributor** — Full read and write access to the Environment. Workspace Owners and Managers always have Contributor access.
- **Viewer** — Read-only access to resources in the Environment, including dashboards, logs, metrics, app and function configuration.
- **No Access** — No read or write access to the Environment.

Workspace Members default to **Contributor** in regular Environments. In a **Restricted** Environment, Members other than Workspace Owners and Managers use the Environment's default member Role, which can be **Contributor**, **Viewer**, or **No Access**. Workspace Owners and Managers always have **Contributor** access.

You can assign a **Contributor**, **Viewer**, or **No Access** Role directly to a Workspace Member in a Restricted Environment. A directly assigned Role takes precedence over the default. Service users do not use the member default: they default to **No Access** in every Environment and must be assigned a Role for each Environment they need.

## Setting up Restricted Environments

Create and manage Restricted Environments from [Environment settings](/settings/workspace-management/environments).

You can also create a Restricted Environment with [\`modal environment create --restricted NAME\`](/docs/cli/latest/environment#modal-environment-create).

Changing the default updates access only for Members who use it. Roles assigned directly to Members and service-user Roles are unchanged.

### Default access by actor

| Workspace Role               | Unrestricted Environment Default | Restricted with Contributor default | Restricted with Viewer default | Restricted with No Access default |
| ---------------------------- | -------------------------------- | ----------------------------------- | ------------------------------ | --------------------------------- |
| Workspace Owner              | Contributor                      | Contributor                         | Contributor                    | Contributor                       |
| Workspace Manager            | Contributor                      | Contributor                         | Contributor                    | Contributor                       |
| Workspace Member             | Contributor                      | Contributor                         | Viewer                         | No Access                         |
| Service user / service token | No Access                        | No Access                           | No Access                      | No Access                         |

Workspace Members can only be assigned an Environment Role in Restricted Environments. Service users can be given a Role on **any** Environment — Restricted or not — from their [tokens settings](/settings/tokens/service-users) or an Environment's Roles.

### No Access and Workspace defaults

Environments where a Member has **No Access** are omitted from Environment listings and selectors. Attempts to access the Environment directly are rejected.

A Restricted Environment with a **No Access** default can still be the Workspace's default Environment. Modal does not automatically choose another accessible Environment. Operations that use an inaccessible default fail, so the Member must explicitly select an Environment they can access.

## Service users and service tokens

[Service users](/docs/guide/service-users) are programmatic identities authenticated with API tokens. They are useful for CI/CD pipelines, deployment bots, and other machine-to-machine communication needs.

Unlike human users, service users do not have a Workspace-level role; their access is controlled entirely through Environment Roles.

| Use case                                     | Recommended identity                               | How access works                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Interactive development or manual management | Human user                                         | Access is based on the user's Workspace Role, plus any Environment Role for restricted Environments                                     |
| Automation in CI/CD or deployment workflows  | Service user authenticated with a service token    | Access is based only on the service user's Environment Role                                                                             |
| Deploying to an Environment                  | Human user or service user with Contributor access | Deploying requires **Contributor** access to the target Environment; grant the service user that Role on each Environment it deploys to |

This makes service users the recommended way to let automation deploy to a specific Environment without granting broad Workspace permissions.

## Proxy Tokens

HTTP interfaces on [Endpoints](/docs/guide/endpoints), [Servers](/docs/guide/servers), and [Web Functions](/docs/guide/webhooks) can be protected with [Proxy Tokens](/docs/guide/webhook-proxy-auth), which authenticate inbound HTTP requests before they reach your containers.

On workspaces with RBAC enabled, Proxy Tokens are **scoped** — each token is explicitly associated with one or more Environments, and will only be accepted for endpoints deployed in those Environments. This prevents a token intended for a staging endpoint from being used to call a production one.

### Creating a scoped proxy token

1. Navigate to **Settings → Proxy Tokens** and click **New Token**.
2. Copy the token ID and secret — the secret is only shown once.
3. You will be prompted to select the Environments this token should be valid for.
4. Use the **Manage Environments** button on any existing scoped token to update its Environment associations. Changes take effect immediately, so removing an Environment will instantly revoke access for any clients using that token to call endpoints in that Environment.

Alternatively, you can create and manage Proxy Tokens via the [CLI](/docs/cli/latest/workspace#modal-workspace-proxy-tokens) or [Python SDK](/docs/sdk/py/latest/Workspace#proxy_tokens).

### Scoped vs. workspace-wide tokens

| Token type     | Who gets it                  | Valid for                                                  |
| -------------- | ---------------------------- | ---------------------------------------------------------- |
| Scoped         | Workspaces with RBAC enabled | Only the Environments explicitly associated with the token |
| Workspace-wide | Workspaces without RBAC      | Any Web Function in the workspace                          |

Existing workspace-wide tokens continue to work as-is. New tokens created on workspaces with RBAC enabled are scoped by default.

If RBAC is disabled on a workspace, scoped tokens fall back to workspace-wide access.

## Cross-Environment access

Restricted Environments prevent app and task identities in other Environments from accessing resources inside the restricted Environment. For more detail, see [Cross-Environment Lookups](/docs/guide/environments#cross-environment-lookups).

In practice, this means a task can access objects in its own Environment and other unrestricted Environments, but code running in another Environment cannot use APIs such as \`modal.App.lookup()\`, \`Secret.from_name()\`, or \`Volume.lookup()\` to reach into a restricted Environment.

This prevents privilege escalation from a less trusted Environment into a more sensitive one.

### Cross-Environment behavior for app and task identities

Access checks are evaluated against the **target** Environment. That means workloads running inside a restricted Environment can still access objects in an **unrestricted** Environment, but workloads running outside a restricted Environment cannot reach into it.

| Source Environment | Target Environment | Cross-Environment access |
| ------------------ | ------------------ | ------------------------ |
| Unrestricted       | Unrestricted       | Allowed                  |
| Unrestricted       | Restricted         | Denied                   |
| Restricted         | Unrestricted       | Allowed                  |
| Restricted         | Restricted         | Denied                   |

Same-Environment access is unaffected by these cross-Environment rules.

### Example: inbound vs. outbound access

Suppose you have two Environments:

- \`prod\` — restricted
- \`test\` — unrestricted

A task running in \`test\` cannot look up secrets, volumes, or Apps in \`prod\`.

A task running in \`prod\` can still access objects in \`test\`, because \`test\` is not restricted.

If both \`prod\` and \`test\` are restricted, then tasks in one cannot access objects in the other.

## Protecting production secrets with restricted Environments

A common RBAC setup is to place production secrets in a restricted production Environment and grant **Contributor** access only to the human users and service users that should be allowed to deploy or manage production.

| Scenario                                                                       | Result  |
| ------------------------------------------------------------------------------ | ------- |
| Developer in \`dev\` tries to edit a secret in restricted \`prod\`                 | Denied  |
| CI service user with Contributor access to restricted \`prod\` deploys to \`prod\` | Allowed |
| Task running in \`prod\` reads a secret in \`prod\`                                | Allowed |
| Task running in \`prod\` accesses objects in unrestricted \`test\`                 | Allowed |

This setup lets you keep development and testing more open while protecting production resources, including secrets, from accidental or unauthorized access.

## Common access patterns

| Pattern                                                                   | Allowed?                     | Notes                                                                                       |
| ------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| Workspace Member views logs in a Restricted Environment                   | If Viewer or Contributor     | A Member whose effective Role is No Access cannot discover the Environment                  |
| Workspace Member deploys to a Restricted Environment                      | If Contributor               | Contributor access is required to deploy or modify resources                                |
| Workspace Owner or Manager deploys to a Restricted Environment            | Yes                          | Owners and Managers automatically have Contributor access                                   |
| Service user deploys to a Restricted Environment                          | Yes, if assigned Contributor | Service users have No Access by default and must be assigned Contributor to deploy          |
| Task running in \`dev\` reads a Secret in Restricted \`prod\`                 | No                           | Cross-Environment access into a Restricted Environment is denied                            |
| Task running in Restricted \`prod\` accesses objects in unrestricted \`test\` | Yes                          | Cross-Environment access is allowed when the target Environment is unrestricted             |
| User views dashboards or App details in a Restricted Environment          | If Viewer or Contributor     | Viewer access includes read-only views such as dashboards, logs, metrics, and configuration |
| Task accesses resources in its own Environment                            | Yes                          | Same-Environment access is unaffected by cross-Environment restrictions                     |
| Scoped proxy token used on a Web Function in an associated Environment    | Yes                          | Token must be explicitly associated with the target Environment                             |
| Scoped proxy token used on a Web Function in a non-associated Environment | No                           | Token is not valid for Environments it has not been associated with                         |

## FAQ

**Can I make Environments completely private?**

Yes. Set a Restricted Environment's default member Role to **No Access**, then assign **Viewer** or **Contributor** only to the Workspace Members and service users who need it. Other Members cannot discover the Environment. Workspace Owners and Managers always retain **Contributor** access.

**How do service tokens work with restricted Environments?**

Service tokens authenticate service users. Service users default to **No Access** on every Environment, restricted or not, and cannot read or write to an Environment until you assign them the **Viewer** or **Contributor** Role. This lets automated systems and CI/CD pipelines deploy and manage production without granting broad Workspace permissions.

**Can I use \`modal.App.lookup()\` across different restricted Environments?**

No. Apps cannot look up, read from, or write to objects in a different restricted Environment.

**Can code running in a restricted Environment access other Environments?**

Yes, but only when the target Environment is not restricted. A restricted Environment blocks access **into** it from other Environments.
`,meta:{title:`Role-Based Access Control (RBAC)`,description:`Control access to Modal Workspaces, Environments, and Web Functions with role-based permissions for Owners, Managers, and Members.`}},{description:h,toc:g,rawContent:_,meta:v}=m,y=t(`RBAC is available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.`,1),re=t(`<code>modal environment create --restricted NAME</code>`),b=t(`<thead><tr><th>Workspace Role</th><th>Unrestricted Environment Default</th><th>Restricted with Contributor default</th><th>Restricted with Viewer default</th><th>Restricted with No Access default</th></tr></thead> <tbody><tr><td>Workspace Owner</td><td>Contributor</td><td>Contributor</td><td>Contributor</td><td>Contributor</td></tr><tr><td>Workspace Manager</td><td>Contributor</td><td>Contributor</td><td>Contributor</td><td>Contributor</td></tr><tr><td>Workspace Member</td><td>Contributor</td><td>Contributor</td><td>Viewer</td><td>No Access</td></tr><tr><td>Service user / service token</td><td>No Access</td><td>No Access</td><td>No Access</td><td>No Access</td></tr></tbody>`,1),x=t(`<thead><tr><th>Use case</th><th>Recommended identity</th><th>How access works</th></tr></thead> <tbody><tr><td>Interactive development or manual management</td><td>Human user</td><td>Access is based on the user’s Workspace Role, plus any Environment Role for restricted Environments</td></tr><tr><td>Automation in CI/CD or deployment workflows</td><td>Service user authenticated with a service token</td><td>Access is based only on the service user’s Environment Role</td></tr><tr><td>Deploying to an Environment</td><td>Human user or service user with Contributor access</td><td>Deploying requires <strong>Contributor</strong> access to the target Environment; grant the service user that Role on each Environment it deploys to</td></tr></tbody>`,1),S=t(`<thead><tr><th>Token type</th><th>Who gets it</th><th>Valid for</th></tr></thead> <tbody><tr><td>Scoped</td><td>Workspaces with RBAC enabled</td><td>Only the Environments explicitly associated with the token</td></tr><tr><td>Workspace-wide</td><td>Workspaces without RBAC</td><td>Any Web Function in the workspace</td></tr></tbody>`,1),C=t(`<thead><tr><th>Source Environment</th><th>Target Environment</th><th>Cross-Environment access</th></tr></thead> <tbody><tr><td>Unrestricted</td><td>Unrestricted</td><td>Allowed</td></tr><tr><td>Unrestricted</td><td>Restricted</td><td>Denied</td></tr><tr><td>Restricted</td><td>Unrestricted</td><td>Allowed</td></tr><tr><td>Restricted</td><td>Restricted</td><td>Denied</td></tr></tbody>`,1),w=t(`<thead><tr><th>Scenario</th><th>Result</th></tr></thead> <tbody><tr><td>Developer in <code>dev</code> tries to edit a secret in restricted <code>prod</code></td><td>Denied</td></tr><tr><td>CI service user with Contributor access to restricted <code>prod</code> deploys to <code>prod</code></td><td>Allowed</td></tr><tr><td>Task running in <code>prod</code> reads a secret in <code>prod</code></td><td>Allowed</td></tr><tr><td>Task running in <code>prod</code> accesses objects in unrestricted <code>test</code></td><td>Allowed</td></tr></tbody>`,1),ie=t(`<thead><tr><th>Pattern</th><th>Allowed?</th><th>Notes</th></tr></thead> <tbody><tr><td>Workspace Member views logs in a Restricted Environment</td><td>If Viewer or Contributor</td><td>A Member whose effective Role is No Access cannot discover the Environment</td></tr><tr><td>Workspace Member deploys to a Restricted Environment</td><td>If Contributor</td><td>Contributor access is required to deploy or modify resources</td></tr><tr><td>Workspace Owner or Manager deploys to a Restricted Environment</td><td>Yes</td><td>Owners and Managers automatically have Contributor access</td></tr><tr><td>Service user deploys to a Restricted Environment</td><td>Yes, if assigned Contributor</td><td>Service users have No Access by default and must be assigned Contributor to deploy</td></tr><tr><td>Task running in <code>dev</code> reads a Secret in Restricted <code>prod</code></td><td>No</td><td>Cross-Environment access into a Restricted Environment is denied</td></tr><tr><td>Task running in Restricted <code>prod</code> accesses objects in unrestricted <code>test</code></td><td>Yes</td><td>Cross-Environment access is allowed when the target Environment is unrestricted</td></tr><tr><td>User views dashboards or App details in a Restricted Environment</td><td>If Viewer or Contributor</td><td>Viewer access includes read-only views such as dashboards, logs, metrics, and configuration</td></tr><tr><td>Task accesses resources in its own Environment</td><td>Yes</td><td>Same-Environment access is unaffected by cross-Environment restrictions</td></tr><tr><td>Scoped proxy token used on a Web Function in an associated Environment</td><td>Yes</td><td>Token must be explicitly associated with the target Environment</td></tr><tr><td>Scoped proxy token used on a Web Function in a non-associated Environment</td><td>No</td><td>Token is not valid for Environments it has not been associated with</td></tr></tbody>`,1),ae=t(`<!> <!> <p>Role-Based Access Control (RBAC) gives Workspace administrators more granular control over who can access and modify resources.</p> <p>This is especially useful for protecting production while allowing broader access to development and staging.</p> <p>Modal’s RBAC system operates at two levels:</p> <ul><li><strong>Workspace Roles</strong> control overall Workspace permissions.</li> <li><strong>Environment Roles</strong> control access to individual Environments.</li></ul> <!> <p>Modal <!> organize Modal Apps and other resources for a group of users. These roles control access at the level of the entire Workspace.</p> <p>All Workspace Members have one of three Roles that determine their overall permissions:</p> <ul><li><strong>Owner</strong> — Full read-write access to everything in the Workspace, including billing, Workspace management, and all Environments. Can assign any Role to other members.</li> <li><strong>Manager</strong> — Same as Owner, but cannot modify the Owner Role.</li> <li><strong>Member</strong> — Can deploy and manage Apps, but cannot access billing, Workspace management, or other Workspace settings.</li></ul> <!> <p>Modal <!> isolate Modal Apps and other resources from one another within a Workspace.</p> <p>Every Environment has three Environment Roles that determine access to it:</p> <ul><li><strong>Contributor</strong> — Full read and write access to the Environment. Workspace Owners and Managers always have Contributor access.</li> <li><strong>Viewer</strong> — Read-only access to resources in the Environment, including dashboards, logs, metrics, app and function configuration.</li> <li><strong>No Access</strong> — No read or write access to the Environment.</li></ul> <p>Workspace Members default to <strong>Contributor</strong> in regular Environments. In a <strong>Restricted</strong> Environment, Members other than Workspace Owners and Managers use the Environment’s default member Role, which can be <strong>Contributor</strong>, <strong>Viewer</strong>, or <strong>No Access</strong>. Workspace Owners and Managers always have <strong>Contributor</strong> access.</p> <p>You can assign a <strong>Contributor</strong>, <strong>Viewer</strong>, or <strong>No Access</strong> Role directly to a Workspace Member in a Restricted Environment. A directly assigned Role takes precedence over the default. Service users do not use the member default: they default to <strong>No Access</strong> in every Environment and must be assigned a Role for each Environment they need.</p> <!> <p>Create and manage Restricted Environments from <!>.</p> <p>You can also create a Restricted Environment with <!>.</p> <p>Changing the default updates access only for Members who use it. Roles assigned directly to Members and service-user Roles are unchanged.</p> <!> <!> <p>Workspace Members can only be assigned an Environment Role in Restricted Environments. Service users can be given a Role on <strong>any</strong> Environment — Restricted or not — from their <!> or an Environment’s Roles.</p> <!> <p>Environments where a Member has <strong>No Access</strong> are omitted from Environment listings and selectors. Attempts to access the Environment directly are rejected.</p> <p>A Restricted Environment with a <strong>No Access</strong> default can still be the Workspace’s default Environment. Modal does not automatically choose another accessible Environment. Operations that use an inaccessible default fail, so the Member must explicitly select an Environment they can access.</p> <!> <p><!> are programmatic identities authenticated with API tokens. They are useful for CI/CD pipelines, deployment bots, and other machine-to-machine communication needs.</p> <p>Unlike human users, service users do not have a Workspace-level role; their access is controlled entirely through Environment Roles.</p> <!> <p>This makes service users the recommended way to let automation deploy to a specific Environment without granting broad Workspace permissions.</p> <!> <p>HTTP interfaces on <!>, <!>, and <!> can be protected with <!>, which authenticate inbound HTTP requests before they reach your containers.</p> <p>On workspaces with RBAC enabled, Proxy Tokens are <strong>scoped</strong> — each token is explicitly associated with one or more Environments, and will only be accepted for endpoints deployed in those Environments. This prevents a token intended for a staging endpoint from being used to call a production one.</p> <!> <ol><li>Navigate to <strong>Settings → Proxy Tokens</strong> and click <strong>New Token</strong>.</li> <li>Copy the token ID and secret — the secret is only shown once.</li> <li>You will be prompted to select the Environments this token should be valid for.</li> <li>Use the <strong>Manage Environments</strong> button on any existing scoped token to update its Environment associations. Changes take effect immediately, so removing an Environment will instantly revoke access for any clients using that token to call endpoints in that Environment.</li></ol> <p>Alternatively, you can create and manage Proxy Tokens via the <!> or <!>.</p> <!> <!> <p>Existing workspace-wide tokens continue to work as-is. New tokens created on workspaces with RBAC enabled are scoped by default.</p> <p>If RBAC is disabled on a workspace, scoped tokens fall back to workspace-wide access.</p> <!> <p>Restricted Environments prevent app and task identities in other Environments from accessing resources inside the restricted Environment. For more detail, see <!>.</p> <p>In practice, this means a task can access objects in its own Environment and other unrestricted Environments, but code running in another Environment cannot use APIs such as <code>modal.App.lookup()</code>, <code>Secret.from_name()</code>, or <code>Volume.lookup()</code> to reach into a restricted Environment.</p> <p>This prevents privilege escalation from a less trusted Environment into a more sensitive one.</p> <!> <p>Access checks are evaluated against the <strong>target</strong> Environment. That means workloads running inside a restricted Environment can still access objects in an <strong>unrestricted</strong> Environment, but workloads running outside a restricted Environment cannot reach into it.</p> <!> <p>Same-Environment access is unaffected by these cross-Environment rules.</p> <!> <p>Suppose you have two Environments:</p> <ul><li><code>prod</code> — restricted</li> <li><code>test</code> — unrestricted</li></ul> <p>A task running in <code>test</code> cannot look up secrets, volumes, or Apps in <code>prod</code>.</p> <p>A task running in <code>prod</code> can still access objects in <code>test</code>, because <code>test</code> is not restricted.</p> <p>If both <code>prod</code> and <code>test</code> are restricted, then tasks in one cannot access objects in the other.</p> <!> <p>A common RBAC setup is to place production secrets in a restricted production Environment and grant <strong>Contributor</strong> access only to the human users and service users that should be allowed to deploy or manage production.</p> <!> <p>This setup lets you keep development and testing more open while protecting production resources, including secrets, from accidental or unauthorized access.</p> <!> <!> <!> <p><strong>Can I make Environments completely private?</strong></p> <p>Yes. Set a Restricted Environment’s default member Role to <strong>No Access</strong>, then assign <strong>Viewer</strong> or <strong>Contributor</strong> only to the Workspace Members and service users who need it. Other Members cannot discover the Environment. Workspace Owners and Managers always retain <strong>Contributor</strong> access.</p> <p><strong>How do service tokens work with restricted Environments?</strong></p> <p>Service tokens authenticate service users. Service users default to <strong>No Access</strong> on every Environment, restricted or not, and cannot read or write to an Environment until you assign them the <strong>Viewer</strong> or <strong>Contributor</strong> Role. This lets automated systems and CI/CD pipelines deploy and manage production without granting broad Workspace permissions.</p> <p><strong>Can I use <code>modal.App.lookup()</code> across different restricted Environments?</strong></p> <p>No. Apps cannot look up, read from, or write to objects in a different restricted Environment.</p> <p><strong>Can code running in a restricted Environment access other Environments?</strong></p> <p>Yes, but only when the target Environment is not restricted. A restricted Environment blocks access <strong>into</strong> it from other Environments.</p>`,1);function T(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=ae(),f=ee(o);ne(f,{id:`role-based-access-control-rbac`,children:(e,t)=>{c(),i(e,r(`Role-Based Access Control (RBAC)`))},$$slots:{default:!0}});var m=s(f,2);te(m,{variant:`gated-feature`,children:(e,t)=>{c();var n=y();c(4),i(e,n)},$$slots:{default:!0}});var h=s(m,10);l(h,{id:`workspace-roles`,children:(e,t)=>{c(),i(e,r(`Workspace Roles`))},$$slots:{default:!0}});var g=s(h,2);p(s(e(g)),{href:`/docs/guide/workspaces`,children:(e,t)=>{c(),i(e,r(`Workspaces`))},$$slots:{default:!0}}),c(),n(g);var _=s(g,6);l(_,{id:`environment-roles`,children:(e,t)=>{c(),i(e,r(`Environment Roles`))},$$slots:{default:!0}});var v=s(_,2);p(s(e(v)),{href:`/docs/guide/environments`,children:(e,t)=>{c(),i(e,r(`Environments`))},$$slots:{default:!0}}),c(),n(v);var T=s(v,10);l(T,{id:`setting-up-restricted-environments`,children:(e,t)=>{c(),i(e,r(`Setting up Restricted Environments`))},$$slots:{default:!0}});var E=s(T,2);p(s(e(E)),{href:`/settings/workspace-management/environments`,children:(e,t)=>{c(),i(e,r(`Environment settings`))},$$slots:{default:!0}}),c(),n(E);var D=s(E,2);p(s(e(D)),{href:`/docs/cli/latest/environment#modal-environment-create`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),c(),n(D);var O=s(D,4);u(O,{id:`default-access-by-actor`,children:(e,t)=>{c(),i(e,r(`Default access by actor`))},$$slots:{default:!0}});var k=s(O,2);d(k,{children:(e,t)=>{var n=b();c(2),i(e,n)},$$slots:{default:!0}});var A=s(k,2);p(s(e(A),3),{href:`/settings/tokens/service-users`,children:(e,t)=>{c(),i(e,r(`tokens settings`))},$$slots:{default:!0}}),c(),n(A);var j=s(A,2);u(j,{id:`no-access-and-workspace-defaults`,children:(e,t)=>{c(),i(e,r(`No Access and Workspace defaults`))},$$slots:{default:!0}});var M=s(j,6);l(M,{id:`service-users-and-service-tokens`,children:(e,t)=>{c(),i(e,r(`Service users and service tokens`))},$$slots:{default:!0}});var N=s(M,2);p(e(N),{href:`/docs/guide/service-users`,children:(e,t)=>{c(),i(e,r(`Service users`))},$$slots:{default:!0}}),c(),n(N);var P=s(N,4);d(P,{children:(e,t)=>{var n=x();c(2),i(e,n)},$$slots:{default:!0}});var F=s(P,4);l(F,{id:`proxy-tokens`,children:(e,t)=>{c(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}});var I=s(F,2),L=s(e(I));p(L,{href:`/docs/guide/endpoints`,children:(e,t)=>{c(),i(e,r(`Endpoints`))},$$slots:{default:!0}});var R=s(L,2);p(R,{href:`/docs/guide/servers`,children:(e,t)=>{c(),i(e,r(`Servers`))},$$slots:{default:!0}});var z=s(R,2);p(z,{href:`/docs/guide/webhooks`,children:(e,t)=>{c(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),p(s(z,2),{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{c(),i(e,r(`Proxy Tokens`))},$$slots:{default:!0}}),c(),n(I);var B=s(I,4);u(B,{id:`creating-a-scoped-proxy-token`,children:(e,t)=>{c(),i(e,r(`Creating a scoped proxy token`))},$$slots:{default:!0}});var V=s(B,4),H=s(e(V));p(H,{href:`/docs/cli/latest/workspace#modal-workspace-proxy-tokens`,children:(e,t)=>{c(),i(e,r(`CLI`))},$$slots:{default:!0}}),p(s(H,2),{href:`/docs/sdk/py/latest/Workspace#proxy_tokens`,children:(e,t)=>{c(),i(e,r(`Python SDK`))},$$slots:{default:!0}}),c(),n(V);var U=s(V,2);u(U,{id:`scoped-vs-workspace-wide-tokens`,children:(e,t)=>{c(),i(e,r(`Scoped vs. workspace-wide tokens`))},$$slots:{default:!0}});var W=s(U,2);d(W,{children:(e,t)=>{var n=S();c(2),i(e,n)},$$slots:{default:!0}});var G=s(W,6);l(G,{id:`cross-environment-access`,children:(e,t)=>{c(),i(e,r(`Cross-Environment access`))},$$slots:{default:!0}});var K=s(G,2);p(s(e(K)),{href:`/docs/guide/environments#cross-environment-lookups`,children:(e,t)=>{c(),i(e,r(`Cross-Environment Lookups`))},$$slots:{default:!0}}),c(),n(K);var q=s(K,6);u(q,{id:`cross-environment-behavior-for-app-and-task-identities`,children:(e,t)=>{c(),i(e,r(`Cross-Environment behavior for app and task identities`))},$$slots:{default:!0}});var J=s(q,4);d(J,{children:(e,t)=>{var n=C();c(2),i(e,n)},$$slots:{default:!0}});var Y=s(J,4);u(Y,{id:`example-inbound-vs-outbound-access`,children:(e,t)=>{c(),i(e,r(`Example: inbound vs. outbound access`))},$$slots:{default:!0}});var X=s(Y,12);l(X,{id:`protecting-production-secrets-with-restricted-environments`,children:(e,t)=>{c(),i(e,r(`Protecting production secrets with restricted Environments`))},$$slots:{default:!0}});var Z=s(X,4);d(Z,{children:(e,t)=>{var n=w();c(2),i(e,n)},$$slots:{default:!0}});var Q=s(Z,4);l(Q,{id:`common-access-patterns`,children:(e,t)=>{c(),i(e,r(`Common access patterns`))},$$slots:{default:!0}});var $=s(Q,2);d($,{children:(e,t)=>{var n=ie();c(2),i(e,n)},$$slots:{default:!0}}),l(s($,2),{id:`faq`,children:(e,t)=>{c(),i(e,r(`FAQ`))},$$slots:{default:!0}}),c(16),i(t,o)},$$slots:{default:!0}}))}export{T as default,m as metadata};
//# sourceMappingURL=DZZIZ37T2.js.map
