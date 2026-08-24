(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`19a10d81-3033-492a-8afc-2a0bcabd8eeb`,e._sentryDebugIdIdentifier=`sentry-dbid-19a10d81-3033-492a-8afc-2a0bcabd8eeb`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Workspace`,id:`workspace`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`name`,id:`name`},{depth:2,value:`members`,id:`members`,children:[{depth:3,value:`members.list`,id:`memberslist`}]},{depth:2,value:`from_context`,id:`from_context`},{depth:2,value:`billing`,id:`billing`,children:[{depth:3,value:`billing.rates`,id:`billingrates`},{depth:3,value:`billing.report`,id:`billingreport`},{depth:3,value:`billing.summary`,id:`billingsummary`}]},{depth:2,value:`proxy_tokens`,id:`proxy_tokens`,children:[{depth:3,value:`proxy_tokens.create`,id:`proxy_tokenscreate`},{depth:3,value:`proxy_tokens.list`,id:`proxy_tokenslist`},{depth:3,value:`proxy_tokens.allow`,id:`proxy_tokensallow`},{depth:3,value:`proxy_tokens.revoke`,id:`proxy_tokensrevoke`},{depth:3,value:`proxy_tokens.delete`,id:`proxy_tokensdelete`}]},{depth:2,value:`settings`,id:`settings`,children:[{depth:3,value:`settings.valid_settings`,id:`settingsvalid_settings`},{depth:3,value:`settings.list`,id:`settingslist`},{depth:3,value:`settings.set`,id:`settingsset`}]}]}],rawContent:`# Workspace


\`\`\`python
class Workspace(modal.object.Object)
\`\`\`


## hydrate

\`\`\`python
hydrate(self, client=None)
\`\`\`
Synchronize the local object with its identity on the Modal server.

It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.

*Added in v0.72.39*: This method replaces the deprecated \`.resolve()\` method.

## name

\`\`\`python
name(self)
\`\`\`


## members


\`\`\`python
members: WorkspaceMembersManager
\`\`\`

Namespace with methods for managing the membership of a Workspace.


### members.list

\`\`\`python
list(self)
\`\`\`
Return the members of the Workspace.

**Examples:**

\`\`\`python notest
members = modal.Workspace.from_context().members.list()
print([m.name for m in members])
\`\`\`

## from_context

\`\`\`python
from_context(*, client=None)
\`\`\`
Look up the Workspace associated with the current context.

This returns the Workspace that the active Modal credentials authenticate against
(i.e., your active profile or the \`MODAL_TOKEN_ID\` / \`MODAL_TOKEN_SECRET\` environment
variables). If called inside a Modal container, it returns the Workspace that the
container is running in.

## billing


\`\`\`python
billing: WorkspaceBillingManager
\`\`\`

Namespace for Workspace billing APIs.


### billing.rates

\`\`\`python
rates(self)
\`\`\`
Return current pricing rates for the given workspace.

**Returns**

A single mapping containing cost values. All values are reported as \`decimal.Decimal\`s.

### billing.report

\`\`\`python
report(self, *, start, end=None, resolution="d", tag_names=None)
\`\`\`
Return a cost report for all Workspace usage, broken down by object and time.

**Parameters**

<Parameter name="start" type="datetime" description="Start of the report, inclusive and rounded to the beginning of the interval. Must be in UTC or timezone-naive (interpreted as UTC)." />
<Parameter name="end" type="datetime | None" defaultValue="None" description="End of the report, exclusive. Must be in UTC or timezone-naive. Partial final intervals will be excluded from the report." />
<Parameter name="resolution" type="str" defaultValue="&quot;d&quot;" description="Resolution, e.g. &quot;d&quot; for daily or &quot;h&quot; for hourly." />
<Parameter name="tag_names" type="list[str] | None" defaultValue="None" description="List of tag names; each row will include the tag name and value in use for that object during the relevant time interval. Pass \`[&quot;*&quot;]\` to include all tags in the report." />

**Returns**

A list of \`BillingReportItem\` dataclasses. Each item reports the cost attributed to
a specific Modal object during a given time interval. Cost is further broken down by
the resource type that generated it (e.g. CPU, Memory, specific GPU usage). Note that
the specific resource types included in the breakdown are subject to change as Modal's
billing model evolves.

**See Also**

- [\`modal billing report\`](https://modal.com/docs/cli/latest/billing#modal-billing-report):
  A workspace report CLI that has convenience features around relative time range queries
  and JSON/CSV output.
- [\`Environment.billing.report()\`](https://modal.com/docs/sdk/py/latest/Environment#billingreport):
  An analogous report API that is scoped to a specific Environment.

### billing.summary

\`\`\`python
summary(self, cycle=None)
\`\`\`
Return a summary of workspace cost over a single billing cycle determined by \`cycle\`

**Parameters**

<Parameter name="cycle" type="str | datetime | None" defaultValue="None" description="Start of the summary, inclusive. Must be the first of a month, and must be in UTC or timezone-naive (interpreted as UTC). If provided as a string, it must either be formatted as an ISO 8601 month (YYYY-MM), or must be one of the convenience spellings &quot;this month&quot; or &quot;last month&quot;. If not provided, \`cycle\` defaults to the first of the current month (in which case a summary is generated for the current billing cycle)." />

**Returns**

A single \`WorkspaceBillingSummary\` dataclass containing the following fields:
- \`metered_cost\` representing cost before any adjustments,
- \`billed_cost\` representing the cost actually invoiced, including all adjustments,
- \`adjustments\` containing a breakdown of the adjustments that make up the difference
  between \`metered_cost\` and \`billed_cost\`. This can include discounts for free volume
  storage, adjustments due to plan credits, etc. The exact keys of this are subject to
  change as Modal's billing model evolves.
- \`metered_cost_breakdown\` containing a breakdown of that cost by the Modal resources
  that generated it. The exact keys of this are subject to change as Modal's billing
  model evolves.

All values are reported as \`decimal.Decimal\`s.

**See Also**

- [\`modal billing summary\`](https://modal.com/docs/cli/latest/billing#modal-billing-summary):
  A workspace summary CLI that has convenience features around relative time range queries.
- [\`Environment.billing.summary()\`](https://modal.com/docs/sdk/py/latest/Environment#billingsummary):
  An analogous summary API that is scoped to a specific Environment.

## proxy_tokens


\`\`\`python
proxy_tokens: WorkspaceProxyTokenManager
\`\`\`

Namespace with methods for managing the proxy tokens in a Workspace.

See [the guide](https://modal.com/docs/guide/webhook-proxy-auth) for more information on proxy tokens.


### proxy_tokens.create

\`\`\`python
create(self)
\`\`\`
Create a new proxy token for the Workspace.

**Usage**

\`\`\`python notest
token = modal.Workspace.from_context().proxy_tokens.create()
print(token.token_id, token.token_secret)
\`\`\`

### proxy_tokens.list

\`\`\`python
list(self, environment_name=None)
\`\`\`
List proxy tokens in the Workspace.

**Parameters**

<Parameter name="environment_name" type="Optional[str]" defaultValue="None" description="When provided, list only the tokens associated with this environment." />

**Usage**

\`\`\`python notest
ws = modal.Workspace.from_context()

# List all proxy tokens in the Workspace
tokens = ws.proxy_tokens.list()
print([t.token_id for t in tokens])

# List only the proxy tokens associated with a specific Environment
env_tokens = ws.proxy_tokens.list(environment_name="prod")
\`\`\`

### proxy_tokens.allow

\`\`\`python
allow(self, proxy_token_id, environment_name)
\`\`\`
Allow a proxy token to authenticate requests to a given Environment.

**Parameters**

<Parameter name="proxy_token_id" type="str" description="The token ID (\`wk-...\`) to operate on." />
<Parameter name="environment_name" type="str" description="The name of the environment to allow access to." />

**Usage**

\`\`\`python notest
ws = modal.Workspace.from_context()
token = ws.proxy_tokens.create()
ws.proxy_tokens.allow(token.token_id, "prod")
\`\`\`

### proxy_tokens.revoke

\`\`\`python
revoke(self, proxy_token_id, environment_name)
\`\`\`
Revoke a proxy token's access to a given Environment.

The proxy token is not deleted, and it will continue to authenticate requests to any
other Environments it is associated with.

**Parameters**

<Parameter name="proxy_token_id" type="str" description="The token ID (\`wk-...\`) to operate on." />
<Parameter name="environment_name" type="str" description="The name of the environment to revoke access from." />

**Usage**

\`\`\`python notest
ws = modal.Workspace.from_context()
ws.proxy_tokens.revoke(token_id, "prod")
\`\`\`

### proxy_tokens.delete

\`\`\`python
delete(self, proxy_token_id)
\`\`\`
Delete a proxy token from the Workspace.

This cannot be reverted. Any clients currently using the token will immediately
lose access to associated resources.

**Parameters**

<Parameter name="proxy_token_id" type="str" description="The token ID (\`wk-...\`) to delete." />

**Usage**

\`\`\`python notest
modal.Workspace.from_context().proxy_tokens.delete(token_id)
\`\`\`

## settings


\`\`\`python
settings: WorkspaceSettingsManager
\`\`\`

Namespace for Workspace settings APIs.


### settings.valid_settings

\`\`\`python
valid_settings(cls)
\`\`\`


### settings.list

\`\`\`python
list(self)
\`\`\`
Return a the current workspace settings.

**Returns**

A \`WorkspaceSettings\` dataclass.

### settings.set

\`\`\`python
set(self, name, value)
\`\`\`
Set a workspace setting to a new value. Must be workspace manager or owner.

The following settings can be updated:

- image-builder-version: The image builder version determines the software included in our base images.
- default-environment: The default environment when the environment is omitted from SDK or CLI methods.

**Parameters**

<Parameter name="name" type="str" description="The name of the setting." />
<Parameter name="value" type="str" description="The new value of the setting." />

**Usage**

\`\`\`python notest
modal.Workspace.from_context().settings.set("default-environment", "dev")
\`\`\`
`,meta:{title:`Workspace`,description:`Synchronize the local object with its identity on the Modal server.`}},{toc:h,rawContent:g,meta:_}=m,re=t(`<code>modal billing report</code>`),ie=t(`<code>Environment.billing.report()</code>`),ae=t(`<code>modal billing summary</code>`),oe=t(`<code>Environment.billing.summary()</code>`),se=t(`<!> <!> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <!> <!> <p>Namespace with methods for managing the membership of a Workspace.</p> <!> <!> <p>Return the members of the Workspace.</p> <p><strong>Examples:</strong></p> <!> <!> <!> <p>Look up the Workspace associated with the current context.</p> <p>This returns the Workspace that the active Modal credentials authenticate against
(i.e., your active profile or the <code>MODAL_TOKEN_ID</code> / <code>MODAL_TOKEN_SECRET</code> environment
variables). If called inside a Modal container, it returns the Workspace that the
container is running in.</p> <!> <!> <p>Namespace for Workspace billing APIs.</p> <!> <!> <p>Return current pricing rates for the given workspace.</p> <p><strong>Returns</strong></p> <p>A single mapping containing cost values. All values are reported as <code>decimal.Decimal</code>s.</p> <!> <!> <p>Return a cost report for all Workspace usage, broken down by object and time.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A list of <code>BillingReportItem</code> dataclasses. Each item reports the cost attributed to
a specific Modal object during a given time interval. Cost is further broken down by
the resource type that generated it (e.g. CPU, Memory, specific GPU usage). Note that
the specific resource types included in the breakdown are subject to change as Modal’s
billing model evolves.</p> <p><strong>See Also</strong></p> <ul><li><!>:
A workspace report CLI that has convenience features around relative time range queries
and JSON/CSV output.</li> <li><!>:
An analogous report API that is scoped to a specific Environment.</li></ul> <!> <!> <p>Return a summary of workspace cost over a single billing cycle determined by <code>cycle</code></p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A single <code>WorkspaceBillingSummary</code> dataclass containing the following fields:</p> <ul><li><code>metered_cost</code> representing cost before any adjustments,</li> <li><code>billed_cost</code> representing the cost actually invoiced, including all adjustments,</li> <li><code>adjustments</code> containing a breakdown of the adjustments that make up the difference
between <code>metered_cost</code> and <code>billed_cost</code>. This can include discounts for free volume
storage, adjustments due to plan credits, etc. The exact keys of this are subject to
change as Modal’s billing model evolves.</li> <li><code>metered_cost_breakdown</code> containing a breakdown of that cost by the Modal resources
that generated it. The exact keys of this are subject to change as Modal’s billing
model evolves.</li></ul> <p>All values are reported as <code>decimal.Decimal</code>s.</p> <p><strong>See Also</strong></p> <ul><li><!>:
A workspace summary CLI that has convenience features around relative time range queries.</li> <li><!>:
An analogous summary API that is scoped to a specific Environment.</li></ul> <!> <!> <p>Namespace with methods for managing the proxy tokens in a Workspace.</p> <p>See <!> for more information on proxy tokens.</p> <!> <!> <p>Create a new proxy token for the Workspace.</p> <p><strong>Usage</strong></p> <!> <!> <!> <p>List proxy tokens in the Workspace.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Allow a proxy token to authenticate requests to a given Environment.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Revoke a proxy token’s access to a given Environment.</p> <p>The proxy token is not deleted, and it will continue to authenticate requests to any
other Environments it is associated with.</p> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Delete a proxy token from the Workspace.</p> <p>This cannot be reverted. Any clients currently using the token will immediately
lose access to associated resources.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Usage</strong></p> <!> <!> <!> <p>Namespace for Workspace settings APIs.</p> <!> <!> <!> <!> <p>Return a the current workspace settings.</p> <p><strong>Returns</strong></p> <p>A <code>WorkspaceSettings</code> dataclass.</p> <!> <!> <p>Set a workspace setting to a new value. Must be workspace manager or owner.</p> <p>The following settings can be updated:</p> <ul><li>image-builder-version: The image builder version determines the software included in our base images.</li> <li>default-environment: The default environment when the environment is omitted from SDK or CLI methods.</li></ul> <p><strong>Parameters</strong></p> <!> <!> <p><strong>Usage</strong></p> <!>`,1);function v(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=se(),d=te(a);ne(d,{id:`workspace`,children:(e,t)=>{s(),i(e,r(`Workspace`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Workspace(modal.object.Object)`,lang:`python`});var h=o(m,2);c(h,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var g=o(h,2);u(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var _=o(g,8);c(_,{id:`name`,children:(e,t)=>{s(),i(e,r(`name`))},$$slots:{default:!0}});var v=o(_,2);u(v,{code:`name(self)`,lang:`python`});var y=o(v,2);c(y,{id:`members`,children:(e,t)=>{s(),i(e,r(`members`))},$$slots:{default:!0}});var b=o(y,2);u(b,{code:`members%3A%20WorkspaceMembersManager`,lang:`python`});var x=o(b,4);l(x,{id:`memberslist`,children:(e,t)=>{s(),i(e,r(`members.list`))},$$slots:{default:!0}});var S=o(x,2);u(S,{code:`list(self)`,lang:`python`});var C=o(S,6);u(C,{code:`members%20%3D%20modal.Workspace.from_context().members.list()%0Aprint(%5Bm.name%20for%20m%20in%20members%5D)`,lang:`python`});var w=o(C,2);c(w,{id:`from_context`,children:(e,t)=>{s(),i(e,r(`from_context`))},$$slots:{default:!0}});var T=o(w,2);u(T,{code:`from_context(*%2C%20client%3DNone)`,lang:`python`});var E=o(T,6);c(E,{id:`billing`,children:(e,t)=>{s(),i(e,r(`billing`))},$$slots:{default:!0}});var D=o(E,2);u(D,{code:`billing%3A%20WorkspaceBillingManager`,lang:`python`});var O=o(D,4);l(O,{id:`billingrates`,children:(e,t)=>{s(),i(e,r(`billing.rates`))},$$slots:{default:!0}});var k=o(O,2);u(k,{code:`rates(self)`,lang:`python`});var A=o(k,8);l(A,{id:`billingreport`,children:(e,t)=>{s(),i(e,r(`billing.report`))},$$slots:{default:!0}});var j=o(A,2);u(j,{code:`report(self%2C%20*%2C%20start%2C%20end%3DNone%2C%20resolution%3D%22d%22%2C%20tag_names%3DNone)`,lang:`python`});var M=o(j,6);p(M,{name:`start`,type:`datetime`,description:`Start of the report, inclusive and rounded to the beginning of the interval. Must be in UTC or timezone-naive (interpreted as UTC).`});var N=o(M,2);p(N,{name:`end`,type:`datetime | None`,defaultValue:`None`,description:`End of the report, exclusive. Must be in UTC or timezone-naive. Partial final intervals will be excluded from the report.`});var P=o(N,2);p(P,{name:`resolution`,type:`str`,defaultValue:`"d"`,description:`Resolution, e.g. "d" for daily or "h" for hourly.`});var F=o(P,2);p(F,{name:`tag_names`,type:`list[str] | None`,defaultValue:`None`,description:'List of tag names; each row will include the tag name and value in use for that object during the relevant time interval. Pass `["*"]` to include all tags in the report.'});var I=o(F,8),L=e(I);f(e(L),{href:`https://modal.com/docs/cli/latest/billing#modal-billing-report`,rel:`nofollow`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),s(),n(L);var R=o(L,2);f(e(R),{href:`https://modal.com/docs/sdk/py/latest/Environment#billingreport`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(R),n(I);var z=o(I,2);l(z,{id:`billingsummary`,children:(e,t)=>{s(),i(e,r(`billing.summary`))},$$slots:{default:!0}});var B=o(z,2);u(B,{code:`summary(self%2C%20cycle%3DNone)`,lang:`python`});var V=o(B,6);p(V,{name:`cycle`,type:`str | datetime | None`,defaultValue:`None`,description:'Start of the summary, inclusive. Must be the first of a month, and must be in UTC or timezone-naive (interpreted as UTC). If provided as a string, it must either be formatted as an ISO 8601 month (YYYY-MM), or must be one of the convenience spellings "this month" or "last month". If not provided, `cycle` defaults to the first of the current month (in which case a summary is generated for the current billing cycle).'});var H=o(V,12),U=e(H);f(e(U),{href:`https://modal.com/docs/cli/latest/billing#modal-billing-summary`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(U);var ce=o(U,2);f(e(ce),{href:`https://modal.com/docs/sdk/py/latest/Environment#billingsummary`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(ce),n(H);var W=o(H,2);c(W,{id:`proxy_tokens`,children:(e,t)=>{s(),i(e,r(`proxy_tokens`))},$$slots:{default:!0}});var G=o(W,2);u(G,{code:`proxy_tokens%3A%20WorkspaceProxyTokenManager`,lang:`python`});var K=o(G,4);f(o(e(K)),{href:`https://modal.com/docs/guide/webhook-proxy-auth`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`the guide`))},$$slots:{default:!0}}),s(),n(K);var q=o(K,2);l(q,{id:`proxy_tokenscreate`,children:(e,t)=>{s(),i(e,r(`proxy_tokens.create`))},$$slots:{default:!0}});var J=o(q,2);u(J,{code:`create(self)`,lang:`python`});var Y=o(J,6);u(Y,{code:`token%20%3D%20modal.Workspace.from_context().proxy_tokens.create()%0Aprint(token.token_id%2C%20token.token_secret)`,lang:`python`});var X=o(Y,2);l(X,{id:`proxy_tokenslist`,children:(e,t)=>{s(),i(e,r(`proxy_tokens.list`))},$$slots:{default:!0}});var Z=o(X,2);u(Z,{code:`list(self%2C%20environment_name%3DNone)`,lang:`python`});var le=o(Z,6);p(le,{name:`environment_name`,type:`Optional[str]`,defaultValue:`None`,description:`When provided, list only the tokens associated with this environment.`});var ue=o(le,4);u(ue,{code:`ws%20%3D%20modal.Workspace.from_context()%0A%0A%23%20List%20all%20proxy%20tokens%20in%20the%20Workspace%0Atokens%20%3D%20ws.proxy_tokens.list()%0Aprint(%5Bt.token_id%20for%20t%20in%20tokens%5D)%0A%0A%23%20List%20only%20the%20proxy%20tokens%20associated%20with%20a%20specific%20Environment%0Aenv_tokens%20%3D%20ws.proxy_tokens.list(environment_name%3D%22prod%22)`,lang:`python`});var de=o(ue,2);l(de,{id:`proxy_tokensallow`,children:(e,t)=>{s(),i(e,r(`proxy_tokens.allow`))},$$slots:{default:!0}});var fe=o(de,2);u(fe,{code:`allow(self%2C%20proxy_token_id%2C%20environment_name)`,lang:`python`});var pe=o(fe,6);p(pe,{name:`proxy_token_id`,type:`str`,description:"The token ID (`wk-...`) to operate on."});var me=o(pe,2);p(me,{name:`environment_name`,type:`str`,description:`The name of the environment to allow access to.`});var he=o(me,4);u(he,{code:`ws%20%3D%20modal.Workspace.from_context()%0Atoken%20%3D%20ws.proxy_tokens.create()%0Aws.proxy_tokens.allow(token.token_id%2C%20%22prod%22)`,lang:`python`});var ge=o(he,2);l(ge,{id:`proxy_tokensrevoke`,children:(e,t)=>{s(),i(e,r(`proxy_tokens.revoke`))},$$slots:{default:!0}});var _e=o(ge,2);u(_e,{code:`revoke(self%2C%20proxy_token_id%2C%20environment_name)`,lang:`python`});var ve=o(_e,8);p(ve,{name:`proxy_token_id`,type:`str`,description:"The token ID (`wk-...`) to operate on."});var ye=o(ve,2);p(ye,{name:`environment_name`,type:`str`,description:`The name of the environment to revoke access from.`});var be=o(ye,4);u(be,{code:`ws%20%3D%20modal.Workspace.from_context()%0Aws.proxy_tokens.revoke(token_id%2C%20%22prod%22)`,lang:`python`});var xe=o(be,2);l(xe,{id:`proxy_tokensdelete`,children:(e,t)=>{s(),i(e,r(`proxy_tokens.delete`))},$$slots:{default:!0}});var Q=o(xe,2);u(Q,{code:`delete(self%2C%20proxy_token_id)`,lang:`python`});var Se=o(Q,8);p(Se,{name:`proxy_token_id`,type:`str`,description:"The token ID (`wk-...`) to delete."});var Ce=o(Se,4);u(Ce,{code:`modal.Workspace.from_context().proxy_tokens.delete(token_id)`,lang:`python`});var we=o(Ce,2);c(we,{id:`settings`,children:(e,t)=>{s(),i(e,r(`settings`))},$$slots:{default:!0}});var Te=o(we,2);u(Te,{code:`settings%3A%20WorkspaceSettingsManager`,lang:`python`});var Ee=o(Te,4);l(Ee,{id:`settingsvalid_settings`,children:(e,t)=>{s(),i(e,r(`settings.valid_settings`))},$$slots:{default:!0}});var De=o(Ee,2);u(De,{code:`valid_settings(cls)`,lang:`python`});var Oe=o(De,2);l(Oe,{id:`settingslist`,children:(e,t)=>{s(),i(e,r(`settings.list`))},$$slots:{default:!0}});var ke=o(Oe,2);u(ke,{code:`list(self)`,lang:`python`});var Ae=o(ke,8);l(Ae,{id:`settingsset`,children:(e,t)=>{s(),i(e,r(`settings.set`))},$$slots:{default:!0}});var je=o(Ae,2);u(je,{code:`set(self%2C%20name%2C%20value)`,lang:`python`});var Me=o(je,10);p(Me,{name:`name`,type:`str`,description:`The name of the setting.`});var $=o(Me,2);p($,{name:`value`,type:`str`,description:`The new value of the setting.`}),u(o($,4),{code:`modal.Workspace.from_context().settings.set(%22default-environment%22%2C%20%22dev%22)`,lang:`python`}),i(t,a)},$$slots:{default:!0}}))}export{v as default,m as metadata};
//# sourceMappingURL=CBa7MC042.js.map
