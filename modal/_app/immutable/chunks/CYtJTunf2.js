(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`603073ff-f925-46da-b1fd-978e686fcebf`,e._sentryDebugIdIdentifier=`sentry-dbid-603073ff-f925-46da-b1fd-978e686fcebf`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Connecting Modal to your Datadog account`,id:`connecting-modal-to-your-datadog-account`,children:[{depth:2,value:`What this integration does`,id:`what-this-integration-does`},{depth:2,value:`Installing the integration`,id:`installing-the-integration`},{depth:2,value:`Metrics`,id:`metrics`},{depth:2,value:`Log attributes`,id:`log-attributes`},{depth:2,value:`Structured logging`,id:`structured-logging`},{depth:2,value:`Cost Savings`,id:`cost-savings`},{depth:2,value:`Uninstalling the integration`,id:`uninstalling-the-integration`}]}],rawContent:`# Connecting Modal to your Datadog account

You can use the [Modal + Datadog Integration](https://docs.datadoghq.com/integrations/modal/)
to export Modal Function logs to Datadog. You'll find the Modal Datadog
Integration available for install in the Datadog marketplace.

## What this integration does

This integration allows you to:

1. Export Modal audit logs in Datadog
2. Export Modal Function logs to Datadog
3. Export container metrics to Datadog

## Installing the integration

Connecting this integration creates an API key in your Datadog account, which
requires Datadog org owner permissions. If you aren't an org owner, ask one to
complete the connection.

1. Open the [Modal Tile](https://app.datadoghq.com/integrations?integrationId=modal) (or the EU tile [here](https://app.datadoghq.eu/integrations?integrationId=modal))
   in the Datadog integrations page
2. Click "Install Integration"
3. Click Connect Accounts to begin authorization of this integration.
   You will be redirected to log into Modal, and once logged in, you’ll
   be redirected to the Datadog authorization page.
4. Click "Authorize" to complete the integration setup

## Metrics

The Modal Datadog Integration will forward the following metrics to Datadog:

- \`modal.cpu.utilization\`
- \`modal.memory.usage\`
- \`modal.gpu.memory.usage\`
- \`modal.gpu.compute.utilization\`
- \`modal.gpu.power.usage\`
- \`modal.gpu.power.utilization\`
- \`modal.gpu.temperature\`
- \`modal.container.running\`
- \`modal.input_events.elapsed_time_us\`
- \`modal.input_events.input_queue_time_us\`
- \`modal.input_events.coldstart_time_us\`
- \`modal.input_events.successes\`
- \`modal.input_events.total_inputs\`
- \`modal.function.pending_inputs\`
- \`modal.function.running_inputs\`

All metrics are tagged with \`container_id\`, \`environment_name\`, \`app_name\`, \`app_id\`,
\`function_name\`, \`function_id\`, \`workspace_name\`, and \`workspace_id\`.

Deprecated metrics:

- \`modal.memory.utilization\` (use \`modal.memory.usage\`)
- \`modal.gpu.memory.utilization\` (use \`modal.gpu.memory.usage\`)

\`modal.input_events.successes\` and \`modal.input_events.total_inputs\` can be used
to measure the success rate of a certain function or app.

As an [official Datadog integration](https://docs.datadoghq.com/integrations/modal/),
Modal metrics are free on Datadog while logs are charged.

## Log attributes

Logs forwarded to Datadog include the following attributes:

- \`container_id\`
- \`app_id\`
- \`app_name\`
- \`function_id\`
- \`function_name\`
- \`function_call_id\`
- \`input_id\`
- \`sandbox_id\`
- \`environment\`
- \`workspace\`
- \`workspace_id\`

These are [log attributes](https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/),
not tags. You can filter and search by them in Datadog's
[Log Explorer](https://docs.datadoghq.com/logs/explorer/) using the \`@\` prefix
(for example, \`@container_id:<value>\`).

## Structured logging

Logs from Modal are sent to Datadog in plaintext without any structured
parsing. This means that if you have custom log formats, you'll need to
set up a [log processing pipeline](https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source)
in Datadog to parse them.

Modal passes log messages in the \`.message\` field of the log record. To
parse logs, you should operate over this field. Note that the Modal Integration
does set up some basic pipelines. In order for your pipelines to work, ensure
that your pipelines come before Modal's pipelines in your log settings.

## Cost Savings

The Modal Datadog Integration will forward all logs to Datadog which could be
costly for verbose apps. We recommend using either [Log Pipelines](https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source)
or [Index Exclusion Filters](https://docs.datadoghq.com/logs/indexes/?tab=ui#exclusion-filters)
to filter logs before they are sent to Datadog.

All logs include the \`environment\` attribute. The simplest way to filter
logs is to create a pipeline that filters on this attribute and to isolate
verbose apps in a separate environment.

## Uninstalling the integration

Once the integration is uninstalled, all logs will stop being sent to
Datadog, and authorization will be revoked.

1. Navigate to the [Modal metrics settings page](http://modal.com/settings/metrics)
   and select "Delete Datadog Integration".
2. On the Configure tab in the Modal integration tile in Datadog,
   click Uninstall Integration.
3. Confirm that you want to uninstall the integration.
4. Ensure that all API keys associated with this integration have been
   disabled by searching for the integration name on the [API Keys](https://app.datadoghq.com/organization-settings/api-keys?filter=Modal)
   page.
`,meta:{title:`Connecting Modal to your Datadog account`,description:`You can use the Modal + Datadog Integration to export Modal Function logs to Datadog. You’ll find the Modal Datadog Integration available for install in the Datadog marketplace.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>You can use the <!> to export Modal Function logs to Datadog. You’ll find the Modal Datadog
Integration available for install in the Datadog marketplace.</p> <!> <p>This integration allows you to:</p> <ol><li>Export Modal audit logs in Datadog</li> <li>Export Modal Function logs to Datadog</li> <li>Export container metrics to Datadog</li></ol> <!> <p>Connecting this integration creates an API key in your Datadog account, which
requires Datadog org owner permissions. If you aren’t an org owner, ask one to
complete the connection.</p> <ol><li>Open the <!> (or the EU tile <!>)
in the Datadog integrations page</li> <li>Click “Install Integration”</li> <li>Click Connect Accounts to begin authorization of this integration.
You will be redirected to log into Modal, and once logged in, you’ll
be redirected to the Datadog authorization page.</li> <li>Click “Authorize” to complete the integration setup</li></ol> <!> <p>The Modal Datadog Integration will forward the following metrics to Datadog:</p> <ul><li><code>modal.cpu.utilization</code></li> <li><code>modal.memory.usage</code></li> <li><code>modal.gpu.memory.usage</code></li> <li><code>modal.gpu.compute.utilization</code></li> <li><code>modal.gpu.power.usage</code></li> <li><code>modal.gpu.power.utilization</code></li> <li><code>modal.gpu.temperature</code></li> <li><code>modal.container.running</code></li> <li><code>modal.input_events.elapsed_time_us</code></li> <li><code>modal.input_events.input_queue_time_us</code></li> <li><code>modal.input_events.coldstart_time_us</code></li> <li><code>modal.input_events.successes</code></li> <li><code>modal.input_events.total_inputs</code></li> <li><code>modal.function.pending_inputs</code></li> <li><code>modal.function.running_inputs</code></li></ul> <p>All metrics are tagged with <code>container_id</code>, <code>environment_name</code>, <code>app_name</code>, <code>app_id</code>, <code>function_name</code>, <code>function_id</code>, <code>workspace_name</code>, and <code>workspace_id</code>.</p> <p>Deprecated metrics:</p> <ul><li><code>modal.memory.utilization</code> (use <code>modal.memory.usage</code>)</li> <li><code>modal.gpu.memory.utilization</code> (use <code>modal.gpu.memory.usage</code>)</li></ul> <p><code>modal.input_events.successes</code> and <code>modal.input_events.total_inputs</code> can be used
to measure the success rate of a certain function or app.</p> <p>As an <!>,
Modal metrics are free on Datadog while logs are charged.</p> <!> <p>Logs forwarded to Datadog include the following attributes:</p> <ul><li><code>container_id</code></li> <li><code>app_id</code></li> <li><code>app_name</code></li> <li><code>function_id</code></li> <li><code>function_name</code></li> <li><code>function_call_id</code></li> <li><code>input_id</code></li> <li><code>sandbox_id</code></li> <li><code>environment</code></li> <li><code>workspace</code></li> <li><code>workspace_id</code></li></ul> <p>These are <!>,
not tags. You can filter and search by them in Datadog’s <!> using the <code>@</code> prefix
(for example, <code>@container_id:&lt;value&gt;</code>).</p> <!> <p>Logs from Modal are sent to Datadog in plaintext without any structured
parsing. This means that if you have custom log formats, you’ll need to
set up a <!> in Datadog to parse them.</p> <p>Modal passes log messages in the <code>.message</code> field of the log record. To
parse logs, you should operate over this field. Note that the Modal Integration
does set up some basic pipelines. In order for your pipelines to work, ensure
that your pipelines come before Modal’s pipelines in your log settings.</p> <!> <p>The Modal Datadog Integration will forward all logs to Datadog which could be
costly for verbose apps. We recommend using either <!> or <!> to filter logs before they are sent to Datadog.</p> <p>All logs include the <code>environment</code> attribute. The simplest way to filter
logs is to create a pipeline that filters on this attribute and to isolate
verbose apps in a separate environment.</p> <!> <p>Once the integration is uninstalled, all logs will stop being sent to
Datadog, and authorization will be revoked.</p> <ol><li>Navigate to the <!> and select “Delete Datadog Integration”.</li> <li>On the Configure tab in the Modal integration tile in Datadog,
click Uninstall Integration.</li> <li>Confirm that you want to uninstall the integration.</li> <li>Ensure that all API keys associated with this integration have been
disabled by searching for the integration name on the <!> page.</li></ol>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);d(f,{id:`connecting-modal-to-your-datadog-account`,children:(e,t)=>{l(),i(e,r(`Connecting Modal to your Datadog account`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://docs.datadoghq.com/integrations/modal/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal + Datadog Integration`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);u(h,{id:`what-this-integration-does`,children:(e,t)=>{l(),i(e,r(`What this integration does`))},$$slots:{default:!0}});var g=c(h,6);u(g,{id:`installing-the-integration`,children:(e,t)=>{l(),i(e,r(`Installing the integration`))},$$slots:{default:!0}});var _=c(g,4),y=e(_),b=c(e(y));p(b,{href:`https://app.datadoghq.com/integrations?integrationId=modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Tile`))},$$slots:{default:!0}}),p(c(b,2),{href:`https://app.datadoghq.eu/integrations?integrationId=modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`here`))},$$slots:{default:!0}}),l(),n(y),l(6),n(_);var x=c(_,2);u(x,{id:`metrics`,children:(e,t)=>{l(),i(e,r(`Metrics`))},$$slots:{default:!0}});var S=c(x,14);p(c(e(S)),{href:`https://docs.datadoghq.com/integrations/modal/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`official Datadog integration`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);u(C,{id:`log-attributes`,children:(e,t)=>{l(),i(e,r(`Log attributes`))},$$slots:{default:!0}});var w=c(C,6),T=c(e(w));p(T,{href:`https://docs.datadoghq.com/logs/log_configuration/attributes_naming_convention/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`log attributes`))},$$slots:{default:!0}}),p(c(T,2),{href:`https://docs.datadoghq.com/logs/explorer/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Log Explorer`))},$$slots:{default:!0}}),l(5),n(w);var E=c(w,2);u(E,{id:`structured-logging`,children:(e,t)=>{l(),i(e,r(`Structured logging`))},$$slots:{default:!0}});var D=c(E,2);p(c(e(D)),{href:`https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`log processing pipeline`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,4);u(O,{id:`cost-savings`,children:(e,t)=>{l(),i(e,r(`Cost Savings`))},$$slots:{default:!0}});var k=c(O,2),A=c(e(k));p(A,{href:`https://docs.datadoghq.com/logs/log_configuration/pipelines/?tab=source`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Log Pipelines`))},$$slots:{default:!0}}),p(c(A,2),{href:`https://docs.datadoghq.com/logs/indexes/?tab=ui#exclusion-filters`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Index Exclusion Filters`))},$$slots:{default:!0}}),l(),n(k);var j=c(k,4);u(j,{id:`uninstalling-the-integration`,children:(e,t)=>{l(),i(e,r(`Uninstalling the integration`))},$$slots:{default:!0}});var M=c(j,4),N=e(M);p(c(e(N)),{href:`http://modal.com/settings/metrics`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal metrics settings page`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,6);p(c(e(P)),{href:`https://app.datadoghq.com/organization-settings/api-keys?filter=Modal`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`API Keys`))},$$slots:{default:!0}}),l(),n(P),n(M),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=CYtJTunf2.js.map
