(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`7c7b253d-0dc0-43b0-9b62-82e9332597a9`,e._sentryDebugIdIdentifier=`sentry-dbid-7c7b253d-0dc0-43b0-9b62-82e9332597a9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";import{t as h}from"./B6UiYoTw.js";var g={toc:[{depth:1,value:`billing`,id:`billing`,children:[{depth:2,value:`WorkspaceBillingReportItem`,id:`workspacebillingreportitem`},{depth:2,value:`workspace_billing_report`,id:`workspace_billing_report`}]}],rawContent:`# billing

## WorkspaceBillingReportItem


**Attributes**

<Parameter name="object_id" type="str" description="" />
<Parameter name="description" type="str" description="" />
<Parameter name="environment_name" type="str" description="" />
<Parameter name="interval_start" type="datetime" description="" />
<Parameter name="cost" type="Decimal" description="" />
<Parameter name="tags" type="dict[str, str]" description="" />

## workspace_billing_report

\`\`\`python
workspace_billing_report(*, start, end=None, resolution="d", tag_names=None,
    client=None)
\`\`\`
Generate a tabular report of workspace usage by object and time.

The result will be a list of dictionaries for each interval (determined by \`resolution\`)
between the \`start\` and \`end\` limits. The dictionary represents a single Modal object
that billing can be attributed to (e.g., an App) along with metadata (including user-defined
tags) for identifying that object. The dictionary also contains a breakdown of the cost value
attributed to individual resources (for an App, this can be CPU, Memory, specific GPU types,
etc.). The specific resource types included in the breakdown are subject to change as
Modal's billing model evolves.

The \`start\` and \`end\` parameters are required to either have a UTC timezone or to be
timezone-naive (which will be interpreted as UTC times). The timestamps in the result will
be in UTC. Cost will be reported for full intervals, even if the provided \`start\` or \`end\`
parameters are partial: \`start\` will be rounded to the beginning of its interval, while
partial \`end\` intervals will be excluded.

Additional user-provided metadata can be included in the report if the objects have tags
and \`tag_names\` (i.e., keys) are specified in the request. Alternatively, pass \`tag_names=["*"]\`
to include all tags in the report. Note that tags will be attributed to the entire interval even
if they were added or removed at some point within it. If the tag name was not in use during an
interval, it will be absent from the tags dictionary in that output row.

It's also possible to generate reports using the
[\`modal billing report\`](https://modal.com/docs/cli/latest/billing) CLI command. The CLI
has a few convenience features for generating reports across relative time ranges.
`,meta:{title:`billing`,description:`Attributes`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>modal billing report</code>`),x=t(`<!> <!> <p><strong>Attributes</strong></p> <!> <!> <!> <!> <!> <!> <!> <!> <p>Generate a tabular report of workspace usage by object and time.</p> <p>The result will be a list of dictionaries for each interval (determined by <code>resolution</code>)
between the <code>start</code> and <code>end</code> limits. The dictionary represents a single Modal object
that billing can be attributed to (e.g., an App) along with metadata (including user-defined
tags) for identifying that object. The dictionary also contains a breakdown of the cost value
attributed to individual resources (for an App, this can be CPU, Memory, specific GPU types,
etc.). The specific resource types included in the breakdown are subject to change as
Modal’s billing model evolves.</p> <p>The <code>start</code> and <code>end</code> parameters are required to either have a UTC timezone or to be
timezone-naive (which will be interpreted as UTC times). The timestamps in the result will
be in UTC. Cost will be reported for full intervals, even if the provided <code>start</code> or <code>end</code> parameters are partial: <code>start</code> will be rounded to the beginning of its interval, while
partial <code>end</code> intervals will be excluded.</p> <p>Additional user-provided metadata can be included in the report if the objects have tags
and <code>tag_names</code> (i.e., keys) are specified in the request. Alternatively, pass <code>tag_names=["*"]</code> to include all tags in the report. Note that tags will be attributed to the entire interval even
if they were added or removed at some point within it. If the tag name was not in use during an
interval, it will be absent from the tags dictionary in that output row.</p> <p>It’s also possible to generate reports using the <!> CLI command. The CLI
has a few convenience features for generating reports across relative time ranges.</p>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`billing`,children:(e,t)=>{l(),i(e,r(`billing`))},$$slots:{default:!0}});var g=c(p,2);u(g,{id:`workspacebillingreportitem`,children:(e,t)=>{l(),i(e,r(`WorkspaceBillingReportItem`))},$$slots:{default:!0}});var _=c(g,4);h(_,{name:`object_id`,type:`str`,description:``});var v=c(_,2);h(v,{name:`description`,type:`str`,description:``});var y=c(v,2);h(y,{name:`environment_name`,type:`str`,description:``});var S=c(y,2);h(S,{name:`interval_start`,type:`datetime`,description:``});var C=c(S,2);h(C,{name:`cost`,type:`Decimal`,description:``});var w=c(C,2);h(w,{name:`tags`,type:`dict[str, str]`,description:``});var T=c(w,2);u(T,{id:`workspace_billing_report`,children:(e,t)=>{l(),i(e,r(`workspace_billing_report`))},$$slots:{default:!0}});var E=c(T,2);f(E,{code:`workspace_billing_report(*%2C%20start%2C%20end%3DNone%2C%20resolution%3D%22d%22%2C%20tag_names%3DNone%2C%0A%20%20%20%20client%3DNone)`,lang:`python`});var D=c(E,10);m(c(e(D)),{href:`https://modal.com/docs/cli/latest/billing`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(D),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=C5ghz4tA2.js.map
