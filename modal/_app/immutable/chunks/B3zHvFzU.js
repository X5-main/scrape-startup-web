(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`72501ee3-ab11-4e12-9b5e-517f2dca2e03`,e._sentryDebugIdIdentifier=`sentry-dbid-72501ee3-ab11-4e12-9b5e-517f2dca2e03`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./DYSGKh1I.js";import{a as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Connecting Modal to your OpenTelemetry Provider`,id:`connecting-modal-to-your-opentelemetry-provider`,children:[{depth:2,value:`What this integration does`,id:`what-this-integration-does`},{depth:2,value:`Metrics`,id:`metrics`},{depth:2,value:`Custom metrics`,id:`custom-metrics`},{depth:2,value:`Installing the integration`,id:`installing-the-integration`},{depth:2,value:`Uninstalling the integration`,id:`uninstalling-the-integration`}]}],rawContent:`# Connecting Modal to your OpenTelemetry Provider

You can export Modal logs to your [OpenTelemetry](https://opentelemetry.io/docs/what-is-opentelemetry/)
provider using the Modal OpenTelemetry integration. This integration is compatible with
any observability provider that supports the OpenTelemetry HTTP APIs.

## What this integration does

This integration allows you to:

1. Export Modal audit logs to your provider
2. Export Modal Function logs to your provider
3. Export container metrics to your provider

## Metrics

The Modal OpenTelemetry Integration will forward the following metrics to your provider:

- \`modal.cpu.utilization\`
- \`modal.memory.usage\`
- \`modal.gpu.memory.usage\`
- \`modal.gpu.compute.utilization\`
- \`modal.container.running\`
- \`modal.input_events.elapsed_time_us\`
- \`modal.input_events.input_queue_time_us\`
- \`modal.input_events.coldstart_time_us\`
- \`modal.input_events.successes\`
- \`modal.input_events.total_inputs\`
- \`modal.function.pending_inputs\`
- \`modal.function.running_inputs\`

Deprecated metrics:

- \`modal.memory.utilization\` (use \`modal.memory.usage\`)
- \`modal.gpu.memory.utilization\` (use \`modal.gpu.memory.usage\`)

\`modal.input_events.successes\` and \`modal.input_events.total_inputs\` can be used to measure the success rate of a certain function or app.

These metrics are tagged with \`container_id\`, \`environment_name\`, \`app_name\`,
\`app_id\`, \`function_name\`, \`function_id\`, \`workspace_name\`, and \`workspace_id\`.

## Custom metrics

<Callout variant="beta">

Contact us to enable custom metrics for your workspace.

</Callout>

The Modal OpenTelemetry Integration allows you to send custom metrics and spans to your provider. You will
then need to export our collector environment variables. These configure the OpenTelemetry SDK
to send messages to our collector in HTTP format. You don't need to do this to get the
out-of-the-box metrics above, only for your own custom metrics.

\`\`\`python
@app.function(
   secrets=[modal.Secret.from_dict({
      "OTEL_EXPORTER_OTLP_ENDPOINT": "otlp-collector.modal.local:4317",
      "OTEL_EXPORTER_OTLP_INSECURE": "true",
      "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
   })],
)
def custom_metrics():
   ...
\`\`\`

All OpenTelemetry SDKs should pick this configuration up, and your custom metrics and spans will be
sent to your configured provider.

## Installing the integration

1. Find out the endpoint URL for your OpenTelemetry provider. This is the URL that
   the Modal integration will send logs to. Note that this should be the base URL
   of the OpenTelemetry provider, and not a specific endpoint. For example, for the
   [US New Relic instance](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/#configure-endpoint-port-protocol),
   the endpoint URL is \`https://otlp.nr-data.net\`, not \`https://otlp.nr-data.net/v1/logs\`.
2. Find out the API key or other authentication method required to send logs to your
   OpenTelemetry provider. This is the key that the Modal integration will use to authenticate
   with your provider. Modal can provide any key/value HTTP header pairs. For example, for
   [New Relic](https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/#api-key),
   the header is \`api-key\`.
3. Create a new OpenTelemetry Secret in Modal with one key per header. These keys should be
   prefixed with \`OTEL_HEADER_\`, followed by the name of the header. The value of this
   key should be the value of the header. For example, for New Relic, an example Secret
   might look like \`OTEL_HEADER_api-key: YOUR_API_KEY\`. If you use the OpenTelemetry Secret
   template, this will be pre-filled for you.
4. Navigate to the [Modal metrics settings page](http://modal.com/settings/metrics) and configure
   the OpenTelemetry push URL from step 1 and the Secret from step 3.
5. Save your changes and use the test button to confirm that logs are being sent to your provider.
   If it's all working, you should see a \`Hello from Modal! 🚀\` log from the \`modal.test_logs\` service.

## Uninstalling the integration

Once the integration is uninstalled, all logs will stop being sent to
your provider.

1. Navigate to the [Modal metrics settings page](http://modal.com/settings/metrics)
   and disable the OpenTelemetry integration.
`,meta:{title:`Connecting Modal to your OpenTelemetry Provider`,description:`You can export Modal logs to your OpenTelemetry provider using the Modal OpenTelemetry integration. This integration is compatible with any observability provider that supports the OpenTelemetry HTTP APIs.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<p>Contact us to enable custom metrics for your workspace.</p>`),x=t(`<!> <p>You can export Modal logs to your <!> provider using the Modal OpenTelemetry integration. This integration is compatible with
any observability provider that supports the OpenTelemetry HTTP APIs.</p> <!> <p>This integration allows you to:</p> <ol><li>Export Modal audit logs to your provider</li> <li>Export Modal Function logs to your provider</li> <li>Export container metrics to your provider</li></ol> <!> <p>The Modal OpenTelemetry Integration will forward the following metrics to your provider:</p> <ul><li><code>modal.cpu.utilization</code></li> <li><code>modal.memory.usage</code></li> <li><code>modal.gpu.memory.usage</code></li> <li><code>modal.gpu.compute.utilization</code></li> <li><code>modal.container.running</code></li> <li><code>modal.input_events.elapsed_time_us</code></li> <li><code>modal.input_events.input_queue_time_us</code></li> <li><code>modal.input_events.coldstart_time_us</code></li> <li><code>modal.input_events.successes</code></li> <li><code>modal.input_events.total_inputs</code></li> <li><code>modal.function.pending_inputs</code></li> <li><code>modal.function.running_inputs</code></li></ul> <p>Deprecated metrics:</p> <ul><li><code>modal.memory.utilization</code> (use <code>modal.memory.usage</code>)</li> <li><code>modal.gpu.memory.utilization</code> (use <code>modal.gpu.memory.usage</code>)</li></ul> <p><code>modal.input_events.successes</code> and <code>modal.input_events.total_inputs</code> can be used to measure the success rate of a certain function or app.</p> <p>These metrics are tagged with <code>container_id</code>, <code>environment_name</code>, <code>app_name</code>, <code>app_id</code>, <code>function_name</code>, <code>function_id</code>, <code>workspace_name</code>, and <code>workspace_id</code>.</p> <!> <!> <p>The Modal OpenTelemetry Integration allows you to send custom metrics and spans to your provider. You will
then need to export our collector environment variables. These configure the OpenTelemetry SDK
to send messages to our collector in HTTP format. You don’t need to do this to get the
out-of-the-box metrics above, only for your own custom metrics.</p> <!> <p>All OpenTelemetry SDKs should pick this configuration up, and your custom metrics and spans will be
sent to your configured provider.</p> <!> <ol><li>Find out the endpoint URL for your OpenTelemetry provider. This is the URL that
the Modal integration will send logs to. Note that this should be the base URL
of the OpenTelemetry provider, and not a specific endpoint. For example, for the <!>,
the endpoint URL is <code>https://otlp.nr-data.net</code>, not <code>https://otlp.nr-data.net/v1/logs</code>.</li> <li>Find out the API key or other authentication method required to send logs to your
OpenTelemetry provider. This is the key that the Modal integration will use to authenticate
with your provider. Modal can provide any key/value HTTP header pairs. For example, for <!>,
the header is <code>api-key</code>.</li> <li>Create a new OpenTelemetry Secret in Modal with one key per header. These keys should be
prefixed with <code>OTEL_HEADER_</code>, followed by the name of the header. The value of this
key should be the value of the header. For example, for New Relic, an example Secret
might look like <code>OTEL_HEADER_api-key: YOUR_API_KEY</code>. If you use the OpenTelemetry Secret
template, this will be pre-filled for you.</li> <li>Navigate to the <!> and configure
the OpenTelemetry push URL from step 1 and the Secret from step 3.</li> <li>Save your changes and use the test button to confirm that logs are being sent to your provider.
If it’s all working, you should see a <code>Hello from Modal! 🚀</code> log from the <code>modal.test_logs</code> service.</li></ol> <!> <p>Once the integration is uninstalled, all logs will stop being sent to
your provider.</p> <ol><li>Navigate to the <!> and disable the OpenTelemetry integration.</li></ol>`,1);function S(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=x(),m=s(o);f(m,{id:`connecting-modal-to-your-opentelemetry-provider`,children:(e,t)=>{l(),i(e,r(`Connecting Modal to your OpenTelemetry Provider`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`https://opentelemetry.io/docs/what-is-opentelemetry/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenTelemetry`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);d(_,{id:`what-this-integration-does`,children:(e,t)=>{l(),i(e,r(`What this integration does`))},$$slots:{default:!0}});var v=c(_,6);d(v,{id:`metrics`,children:(e,t)=>{l(),i(e,r(`Metrics`))},$$slots:{default:!0}});var y=c(v,14);d(y,{id:`custom-metrics`,children:(e,t)=>{l(),i(e,r(`Custom metrics`))},$$slots:{default:!0}});var S=c(y,2);u(S,{variant:`beta`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var C=c(S,4);p(C,{code:`%40app.function(%0A%20%20%20secrets%3D%5Bmodal.Secret.from_dict(%7B%0A%20%20%20%20%20%20%22OTEL_EXPORTER_OTLP_ENDPOINT%22%3A%20%22otlp-collector.modal.local%3A4317%22%2C%0A%20%20%20%20%20%20%22OTEL_EXPORTER_OTLP_INSECURE%22%3A%20%22true%22%2C%0A%20%20%20%20%20%20%22OTEL_EXPORTER_OTLP_PROTOCOL%22%3A%20%22http%2Fprotobuf%22%2C%0A%20%20%20%7D)%5D%2C%0A)%0Adef%20custom_metrics()%3A%0A%20%20%20...`,lang:`python`});var w=c(C,4);d(w,{id:`installing-the-integration`,children:(e,t)=>{l(),i(e,r(`Installing the integration`))},$$slots:{default:!0}});var T=c(w,2),E=e(T);h(c(e(E)),{href:`https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/#configure-endpoint-port-protocol`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`US New Relic instance`))},$$slots:{default:!0}}),l(5),n(E);var D=c(E,2);h(c(e(D)),{href:`https://docs.newrelic.com/docs/opentelemetry/best-practices/opentelemetry-otlp/#api-key`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`New Relic`))},$$slots:{default:!0}}),l(3),n(D);var O=c(D,4);h(c(e(O)),{href:`http://modal.com/settings/metrics`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal metrics settings page`))},$$slots:{default:!0}}),l(),n(O),l(2),n(T);var k=c(T,2);d(k,{id:`uninstalling-the-integration`,children:(e,t)=>{l(),i(e,r(`Uninstalling the integration`))},$$slots:{default:!0}});var A=c(k,4),j=e(A);h(c(e(j)),{href:`http://modal.com/settings/metrics`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal metrics settings page`))},$$slots:{default:!0}}),l(),n(j),n(A),i(t,o)},$$slots:{default:!0}}))}export{S as default,g as metadata};
//# sourceMappingURL=B3zHvFzU.js.map
