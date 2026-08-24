(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`77ae56c3-7c39-4ee5-901b-c988c28eb92b`,e._sentryDebugIdIdentifier=`sentry-dbid-77ae56c3-7c39-4ee5-901b-c988c28eb92b`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as te,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as c,i as l,o as ne}from"./CPby7b1n.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./B4L_if842.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./B6UiYoTw.js";var m={toc:[{depth:1,value:`Environment`,id:`environment`,children:[{depth:2,value:`hydrate`,id:`hydrate`},{depth:2,value:`name`,id:`name`},{depth:2,value:`objects`,id:`objects`,children:[{depth:3,value:`objects.create`,id:`objectscreate`},{depth:3,value:`objects.list`,id:`objectslist`},{depth:3,value:`objects.delete`,id:`objectsdelete`}]},{depth:2,value:`roles`,id:`roles`,children:[{depth:3,value:`roles.list`,id:`roleslist`},{depth:3,value:`roles.update`,id:`rolesupdate`}]},{depth:2,value:`from_context`,id:`from_context`},{depth:2,value:`from_name`,id:`from_name`},{depth:2,value:`billing`,id:`billing`,children:[{depth:3,value:`billing.report`,id:`billingreport`},{depth:3,value:`billing.summary`,id:`billingsummary`}]}]}],rawContent:`# Environment


\`\`\`python
class Environment(modal.object.Object)
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


## objects


\`\`\`python
objects: EnvironmentManager
\`\`\`

Namespace with methods for managing Environment objects.


### objects.create

\`\`\`python
create(self, name, *, restricted=False, default_role=None,
    experimental_options=None, client=None)
\`\`\`
Create a new Environment.

**Examples:**

\`\`\`python notest
modal.Environment.objects.create("my-environment")
\`\`\`

### objects.list

\`\`\`python
list(self, *, client=None)
\`\`\`
Return a list of hydrated Environment objects.

**Examples:**

\`\`\`python notest
environments = modal.Environment.objects.list()
print([e.name for e in environments])
\`\`\`

### objects.delete

\`\`\`python
delete(self, name, *, client=None)
\`\`\`
Delete a named Environment.

Warning: This is irreversible and will transitively delete all objects in the Environment.

**Examples:**

\`\`\`python notest
modal.Environment.objects.delete("my-environment")
\`\`\`

## roles


\`\`\`python
roles: EnvironmentRolesManager
\`\`\`

Namespace with methods for managing the Environment Roles of users and service users.

See https://modal.com/docs/guide/rbac for more information on Environment Roles.


### roles.list

\`\`\`python
list(self, *, exclude_default=False)
\`\`\`
Enumerate the Environment Role for each user and service user in the workspace.

**Examples:**

\`\`\`python notest
roles = modal.Environment.from_name("my-env").roles.list()
print(roles)
# {
#     "users": {"alice": "contributor", "bob": "viewer", "carol": "contributor"},
#     "service_users": {"alice-bot": "contributor", "ops-bot": "viewer", "ci-bot": "no-access"},
# }
\`\`\`

**Parameters**

<Parameter name="exclude_default" type="bool" defaultValue="False" description="If \`True\`, only include roles that are directly assigned." />

### roles.update

\`\`\`python
update(self, *, users=None, service_users=None)
\`\`\`
Update the Environment Role of users and service users.

Each role is one of 'contributor', 'viewer', or 'no-access'. Service users can be
assigned a role on any Environment, while workspace members can only be assigned a
role on restricted Environments.

**Examples:**

\`\`\`python notest
env = modal.Environment.from_name("my-restricted-env")
env.roles.update(
    users={"alice": "contributor", "bob": "viewer"},
    service_users={"alice-bot": "contributor"},
)
\`\`\`

## from_context

\`\`\`python
from_context(*, client=None)
\`\`\`
Look up an Environment object using the current context.

This method returns the Environment that is defined by the local configuration
(i.e., your active profile or the \`MODAL_ENVIRONMENT\` environment variable), or
it fetches the default environment from the server when not defined locally.
If called inside a Modal container, it will return the Environment that container
is associated with.

## from_name

\`\`\`python
from_name(name, *, create_if_missing=False, client=None)
\`\`\`
Look up an Environment object using its name.

## billing


\`\`\`python
billing: EnvironmentBillingManager
\`\`\`

Namespace for Environment billing APIs.

\`\`\`python
__init__(self, environment)
\`\`\`
mdmd:ignore

### billing.report

\`\`\`python
report(self, *, start, end=None, resolution="d", tag_names=None)
\`\`\`
Return a cost report for Environment usage, broken down by object and time.

**Parameters**

<Parameter name="start" type="datetime" description="Start of the report, inclusive and rounded to the beginning of the interval. Must be in UTC or timezone-naive (interpreted as UTC)." />
<Parameter name="end" type="datetime | None" defaultValue="None" description="End of the report, exclusive. Must be in UTC or timezone-naive. Partial final intervals will be excluded from the report." />
<Parameter name="resolution" type="str" defaultValue="&quot;d&quot;" description="Resolution, e.g. &quot;d&quot; for daily or &quot;h&quot; for hourly." />
<Parameter name="tag_names" type="list[str] | None" defaultValue="None" description="List of tag names; each row will include the tag name and value in use for that object during the relevant time interval. Pass \`[&quot;*&quot;]\` to include all tags in the report." />

**Returns**

A list of \`BillingReportItem\` dataclasses. Each item reports the cost attributed to
a specific Modal object during a given time interval. Cost is further broken down by
the resource type that generated it (e.g. CPU, Memory, specific GPU usage).
Note that the specific resource types included in the breakdown are subject to change
as Modal's billing model evolves.

**See Also**

- [\`modal environment billing report\`](https://modal.com/docs/cli/latest/environment#modal-environment-billing-report):
  An environment report CLI that has convenience features around relative time range queries
  and JSON/CSV output.
- [\`Workspace.billing.report()\`](https://modal.com/docs/sdk/py/latest/Workspace#billingreport):
  An analogous report API for the entire Workspace.

### billing.summary

\`\`\`python
summary(self, cycle=None)
\`\`\`
Return a summary of environment cost over a single billing cycle determined by \`cycle\`.

Unlike the analogous \`Workspace.billing.summary()\`, this API only emits metered cost
information. This is because billing adjustments due to credits, free storage, etc. are
applied at the Workspace level, and thus cannot be attributed to individual Environments.

**Parameters**

<Parameter name="cycle" type="str | datetime | None" defaultValue="None" description="Start of the summary, inclusive. Must be the first of a month, and must be in UTC or timezone-naive (interpreted as UTC). If provided as a string, it must either be formatted as an ISO 8601 month (YYYY-MM), or must be one of the convenience spellings &quot;this month&quot; or &quot;last month&quot;. If not provided, \`cycle\` defaults to the first of the current month (in which case a summary is generated for the current billing cycle)." />

**Returns**

A single \`EnvironmentBillingSummary\` dataclass containing the following fields:
- \`metered_cost\` representing cost before any adjustments, and
- \`metered_cost_breakdown\` containing a breakdown of that cost by the Modal resources
  that generated it. The exact keys of this are subject to change as Modal's billing
  model evolves.

All values are reported as \`decimal.Decimal\`s.

**See Also**

- [\`modal environment billing summary\`](https://modal.com/docs/cli/latest/billing#modal-environment-billing-summary):
  An environment summary CLI that has convenience features around relative time range queries.
- [\`Environment.billing.report()\`](https://modal.com/docs/sdk/py/latest/Environment#billingreport):
  An analogous report API that is scoped to a specific Environment.
`,meta:{title:`Environment`,description:`Synchronize the local object with its identity on the Modal server.`}},{toc:h,rawContent:g,meta:re}=m,ie=t(`<code>modal environment billing report</code>`),ae=t(`<code>Workspace.billing.report()</code>`),oe=t(`<code>modal environment billing summary</code>`),se=t(`<code>Environment.billing.report()</code>`),ce=t(`<!> <!> <!> <!> <p>Synchronize the local object with its identity on the Modal server.</p> <p>It is rarely necessary to call this method explicitly, as most operations
will lazily hydrate when needed. The main use case is when you need to
access object metadata, such as its ID.</p> <p><em>Added in v0.72.39</em>: This method replaces the deprecated <code>.resolve()</code> method.</p> <!> <!> <!> <!> <p>Namespace with methods for managing Environment objects.</p> <!> <!> <p>Create a new Environment.</p> <p><strong>Examples:</strong></p> <!> <!> <!> <p>Return a list of hydrated Environment objects.</p> <p><strong>Examples:</strong></p> <!> <!> <!> <p>Delete a named Environment.</p> <p>Warning: This is irreversible and will transitively delete all objects in the Environment.</p> <p><strong>Examples:</strong></p> <!> <!> <!> <p>Namespace with methods for managing the Environment Roles of users and service users.</p> <p>See <!> for more information on Environment Roles.</p> <!> <!> <p>Enumerate the Environment Role for each user and service user in the workspace.</p> <p><strong>Examples:</strong></p> <!> <p><strong>Parameters</strong></p> <!> <!> <!> <p>Update the Environment Role of users and service users.</p> <p>Each role is one of ‘contributor’, ‘viewer’, or ‘no-access’. Service users can be
assigned a role on any Environment, while workspace members can only be assigned a
role on restricted Environments.</p> <p><strong>Examples:</strong></p> <!> <!> <!> <p>Look up an Environment object using the current context.</p> <p>This method returns the Environment that is defined by the local configuration
(i.e., your active profile or the <code>MODAL_ENVIRONMENT</code> environment variable), or
it fetches the default environment from the server when not defined locally.
If called inside a Modal container, it will return the Environment that container
is associated with.</p> <!> <!> <p>Look up an Environment object using its name.</p> <!> <!> <p>Namespace for Environment billing APIs.</p> <!> <p>mdmd:ignore</p> <!> <!> <p>Return a cost report for Environment usage, broken down by object and time.</p> <p><strong>Parameters</strong></p> <!> <!> <!> <!> <p><strong>Returns</strong></p> <p>A list of <code>BillingReportItem</code> dataclasses. Each item reports the cost attributed to
a specific Modal object during a given time interval. Cost is further broken down by
the resource type that generated it (e.g. CPU, Memory, specific GPU usage).
Note that the specific resource types included in the breakdown are subject to change
as Modal’s billing model evolves.</p> <p><strong>See Also</strong></p> <ul><li><!>:
An environment report CLI that has convenience features around relative time range queries
and JSON/CSV output.</li> <li><!>:
An analogous report API for the entire Workspace.</li></ul> <!> <!> <p>Return a summary of environment cost over a single billing cycle determined by <code>cycle</code>.</p> <p>Unlike the analogous <code>Workspace.billing.summary()</code>, this API only emits metered cost
information. This is because billing adjustments due to credits, free storage, etc. are
applied at the Workspace level, and thus cannot be attributed to individual Environments.</p> <p><strong>Parameters</strong></p> <!> <p><strong>Returns</strong></p> <p>A single <code>EnvironmentBillingSummary</code> dataclass containing the following fields:</p> <ul><li><code>metered_cost</code> representing cost before any adjustments, and</li> <li><code>metered_cost_breakdown</code> containing a breakdown of that cost by the Modal resources
that generated it. The exact keys of this are subject to change as Modal’s billing
model evolves.</li></ul> <p>All values are reported as <code>decimal.Decimal</code>s.</p> <p><strong>See Also</strong></p> <ul><li><!>:
An environment summary CLI that has convenience features around relative time range queries.</li> <li><!>:
An analogous report API that is scoped to a specific Environment.</li></ul>`,1);function _(t,h){let g=ee(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);d(t,a(()=>g,()=>m,{children:(t,ee)=>{var a=ce(),d=te(a);ne(d,{id:`environment`,children:(e,t)=>{s(),i(e,r(`Environment`))},$$slots:{default:!0}});var m=o(d,2);u(m,{code:`class%20Environment(modal.object.Object)`,lang:`python`});var h=o(m,2);c(h,{id:`hydrate`,children:(e,t)=>{s(),i(e,r(`hydrate`))},$$slots:{default:!0}});var g=o(h,2);u(g,{code:`hydrate(self%2C%20client%3DNone)`,lang:`python`});var re=o(g,8);c(re,{id:`name`,children:(e,t)=>{s(),i(e,r(`name`))},$$slots:{default:!0}});var _=o(re,2);u(_,{code:`name(self)`,lang:`python`});var v=o(_,2);c(v,{id:`objects`,children:(e,t)=>{s(),i(e,r(`objects`))},$$slots:{default:!0}});var y=o(v,2);u(y,{code:`objects%3A%20EnvironmentManager`,lang:`python`});var b=o(y,4);l(b,{id:`objectscreate`,children:(e,t)=>{s(),i(e,r(`objects.create`))},$$slots:{default:!0}});var x=o(b,2);u(x,{code:`create(self%2C%20name%2C%20*%2C%20restricted%3DFalse%2C%20default_role%3DNone%2C%0A%20%20%20%20experimental_options%3DNone%2C%20client%3DNone)`,lang:`python`});var S=o(x,6);u(S,{code:`modal.Environment.objects.create(%22my-environment%22)`,lang:`python`});var C=o(S,2);l(C,{id:`objectslist`,children:(e,t)=>{s(),i(e,r(`objects.list`))},$$slots:{default:!0}});var w=o(C,2);u(w,{code:`list(self%2C%20*%2C%20client%3DNone)`,lang:`python`});var T=o(w,6);u(T,{code:`environments%20%3D%20modal.Environment.objects.list()%0Aprint(%5Be.name%20for%20e%20in%20environments%5D)`,lang:`python`});var E=o(T,2);l(E,{id:`objectsdelete`,children:(e,t)=>{s(),i(e,r(`objects.delete`))},$$slots:{default:!0}});var D=o(E,2);u(D,{code:`delete(self%2C%20name%2C%20*%2C%20client%3DNone)`,lang:`python`});var O=o(D,8);u(O,{code:`modal.Environment.objects.delete(%22my-environment%22)`,lang:`python`});var k=o(O,2);c(k,{id:`roles`,children:(e,t)=>{s(),i(e,r(`roles`))},$$slots:{default:!0}});var A=o(k,2);u(A,{code:`roles%3A%20EnvironmentRolesManager`,lang:`python`});var j=o(A,4);f(o(e(j)),{href:`https://modal.com/docs/guide/rbac`,rel:`nofollow`,children:(e,t)=>{s(),i(e,r(`https://modal.com/docs/guide/rbac`))},$$slots:{default:!0}}),s(),n(j);var M=o(j,2);l(M,{id:`roleslist`,children:(e,t)=>{s(),i(e,r(`roles.list`))},$$slots:{default:!0}});var N=o(M,2);u(N,{code:`list(self%2C%20*%2C%20exclude_default%3DFalse)`,lang:`python`});var le=o(N,6);u(le,{code:`roles%20%3D%20modal.Environment.from_name(%22my-env%22).roles.list()%0Aprint(roles)%0A%23%20%7B%0A%23%20%20%20%20%20%22users%22%3A%20%7B%22alice%22%3A%20%22contributor%22%2C%20%22bob%22%3A%20%22viewer%22%2C%20%22carol%22%3A%20%22contributor%22%7D%2C%0A%23%20%20%20%20%20%22service_users%22%3A%20%7B%22alice-bot%22%3A%20%22contributor%22%2C%20%22ops-bot%22%3A%20%22viewer%22%2C%20%22ci-bot%22%3A%20%22no-access%22%7D%2C%0A%23%20%7D`,lang:`python`});var P=o(le,4);p(P,{name:`exclude_default`,type:`bool`,defaultValue:`False`,description:"If `True`, only include roles that are directly assigned."});var F=o(P,2);l(F,{id:`rolesupdate`,children:(e,t)=>{s(),i(e,r(`roles.update`))},$$slots:{default:!0}});var I=o(F,2);u(I,{code:`update(self%2C%20*%2C%20users%3DNone%2C%20service_users%3DNone)`,lang:`python`});var L=o(I,8);u(L,{code:`env%20%3D%20modal.Environment.from_name(%22my-restricted-env%22)%0Aenv.roles.update(%0A%20%20%20%20users%3D%7B%22alice%22%3A%20%22contributor%22%2C%20%22bob%22%3A%20%22viewer%22%7D%2C%0A%20%20%20%20service_users%3D%7B%22alice-bot%22%3A%20%22contributor%22%7D%2C%0A)`,lang:`python`});var R=o(L,2);c(R,{id:`from_context`,children:(e,t)=>{s(),i(e,r(`from_context`))},$$slots:{default:!0}});var z=o(R,2);u(z,{code:`from_context(*%2C%20client%3DNone)`,lang:`python`});var B=o(z,6);c(B,{id:`from_name`,children:(e,t)=>{s(),i(e,r(`from_name`))},$$slots:{default:!0}});var V=o(B,2);u(V,{code:`from_name(name%2C%20*%2C%20create_if_missing%3DFalse%2C%20client%3DNone)`,lang:`python`});var H=o(V,4);c(H,{id:`billing`,children:(e,t)=>{s(),i(e,r(`billing`))},$$slots:{default:!0}});var U=o(H,2);u(U,{code:`billing%3A%20EnvironmentBillingManager`,lang:`python`});var W=o(U,4);u(W,{code:`__init__(self%2C%20environment)`,lang:`python`});var G=o(W,4);l(G,{id:`billingreport`,children:(e,t)=>{s(),i(e,r(`billing.report`))},$$slots:{default:!0}});var K=o(G,2);u(K,{code:`report(self%2C%20*%2C%20start%2C%20end%3DNone%2C%20resolution%3D%22d%22%2C%20tag_names%3DNone)`,lang:`python`});var q=o(K,6);p(q,{name:`start`,type:`datetime`,description:`Start of the report, inclusive and rounded to the beginning of the interval. Must be in UTC or timezone-naive (interpreted as UTC).`});var J=o(q,2);p(J,{name:`end`,type:`datetime | None`,defaultValue:`None`,description:`End of the report, exclusive. Must be in UTC or timezone-naive. Partial final intervals will be excluded from the report.`});var ue=o(J,2);p(ue,{name:`resolution`,type:`str`,defaultValue:`"d"`,description:`Resolution, e.g. "d" for daily or "h" for hourly.`});var Y=o(ue,2);p(Y,{name:`tag_names`,type:`list[str] | None`,defaultValue:`None`,description:'List of tag names; each row will include the tag name and value in use for that object during the relevant time interval. Pass `["*"]` to include all tags in the report.'});var X=o(Y,8),Z=e(X);f(e(Z),{href:`https://modal.com/docs/cli/latest/environment#modal-environment-billing-report`,rel:`nofollow`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),s(),n(Z);var de=o(Z,2);f(e(de),{href:`https://modal.com/docs/sdk/py/latest/Workspace#billingreport`,rel:`nofollow`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),s(),n(de),n(X);var fe=o(X,2);l(fe,{id:`billingsummary`,children:(e,t)=>{s(),i(e,r(`billing.summary`))},$$slots:{default:!0}});var pe=o(fe,2);u(pe,{code:`summary(self%2C%20cycle%3DNone)`,lang:`python`});var me=o(pe,8);p(me,{name:`cycle`,type:`str | datetime | None`,defaultValue:`None`,description:'Start of the summary, inclusive. Must be the first of a month, and must be in UTC or timezone-naive (interpreted as UTC). If provided as a string, it must either be formatted as an ISO 8601 month (YYYY-MM), or must be one of the convenience spellings "this month" or "last month". If not provided, `cycle` defaults to the first of the current month (in which case a summary is generated for the current billing cycle).'});var he=o(me,12),Q=e(he);f(e(Q),{href:`https://modal.com/docs/cli/latest/billing#modal-environment-billing-summary`,rel:`nofollow`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),s(),n(Q);var $=o(Q,2);f(e($),{href:`https://modal.com/docs/sdk/py/latest/Environment#billingreport`,rel:`nofollow`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}}),s(),n($),n(he),i(t,a)},$$slots:{default:!0}}))}export{_ as default,m as metadata};
//# sourceMappingURL=1XcZxTTA.js.map
