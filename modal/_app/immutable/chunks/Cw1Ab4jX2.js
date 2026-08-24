(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ee2cae56-1f6e-4237-9cee-16195fc30848`,e._sentryDebugIdIdentifier=`sentry-dbid-ee2cae56-1f6e-4237-9cee-16195fc30848`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Endpoints`,id:`endpoints`,children:[{depth:2,value:`Getting started`,id:`getting-started`},{depth:2,value:`Proxy tokens`,id:`proxy-tokens`},{depth:2,value:`Calling your endpoint`,id:`calling-your-endpoint`},{depth:2,value:`Serving custom weights`,id:`serving-custom-weights`},{depth:2,value:`Choosing where it runs`,id:`choosing-where-it-runs`},{depth:2,value:`Managing endpoints`,id:`managing-endpoints`},{depth:2,value:`Viewing the source`,id:`viewing-the-source`},{depth:2,value:`Pricing`,id:`pricing`},{depth:2,value:`Where credits can be used`,id:`where-credits-can-be-used`}]}],rawContent:`# Endpoints

Deploy a production-ready LLM inference endpoint on Modal's managed
infrastructure with a single command:

\`\`\`bash
modal endpoint create --model Qwen/Qwen3.5-4B
\`\`\`

Endpoints support both open model weights and your own custom fine tunes,
sourced from either a Hugging Face repo or a Modal Volume.

They provide a number of built-in features:

- **Fast inference by default** — every endpoint runs behind a low-latency
  request proxy on tuned open-source inference engines, with SOTA speculative
  decoding wherever the recipe supports it.
- **Usage-based pricing** — you pay only for the _compute_ your endpoint uses,
  so you reap the benefits of our compute engine optimizations.
- **Scale-to-zero autoscaling** — endpoints scale up under load and down to zero
  when idle, with no manual tuning required.

This page is a high-level guide to Modal Endpoints.

## Getting started

Modal supports deploying pre-trained open and custom weight models from the
following families:

- Qwen
- Kimi
- Gemma4
- DeepSeek
- Nemotron
- GPT-OSS
- GLM

Browse the full catalog on the [**Endpoints**](https://modal.com/endpoints) tab
in the dashboard.

Spin up an endpoint for \`Qwen/Qwen3.5-4B\`:

\`\`\`bash
modal endpoint create --model Qwen/Qwen3.5-4B
\`\`\`

Modal resolves the model, selects a compatible recipe, and starts provisioning.
The command prints the endpoint ID and a dashboard link where you can watch it
come online. You can also create endpoints from the
[**Endpoints**](https://modal.com/endpoints) tab in the dashboard — the form
collects the same options.

If you omit the \`name\` argument, Modal derives one from the model
(\`Qwen/Qwen3.5-4B\` → \`qwen3-5-4b\`).

## Proxy tokens

Endpoints are authenticated by default. To call one, you need a
[proxy token](/docs/guide/webhook-proxy-auth) pair, which you can create with the
CLI:

\`\`\`bash
modal workspace proxy-tokens create
\`\`\`

This prints a token ID (\`wk-...\`) and secret (\`ws-...\`). The secret is only shown
at creation time and can't be retrieved later, so store it somewhere safe.

If your Workspace has [RBAC](/docs/guide/rbac) enabled, you'll also need to
explicitly associate the new token with the Environment where you'll create the
endpoint:

\`\`\`bash
modal workspace proxy-tokens allow wk-... main
\`\`\`

To authenticate a request, join the token ID and secret with a period (\`.\`) and
pass them as a single \`Authorization: Bearer\` header:

\`\`\`
Authorization: Bearer wk-<id>.ws-<secret>
\`\`\`

This is the same scheme the OpenAI API uses (\`Authorization: Bearer <api-key>\`),
so you can use the combined value as the API key in any OpenAI-compatible client
or gateway.

The token also works as separate \`Modal-Key\` and \`Modal-Secret\` headers, which is
useful when you need to leave the \`Authorization\` header free for another token:

\`\`\`
Modal-Key: wk-...
Modal-Secret: ws-...
\`\`\`

You can also make requests to an authenticated endpoint using the
[\`modal curl\`](/docs/cli/latest/curl) utility. This performs transparent
authentication using your Modal API credentials, although API authentication
adds some latency so it is best suited for basic testing and demonstrations.

To create an endpoint that accepts unauthenticated requests instead, pass
\`--unauthenticated\`.

## Calling your endpoint

Once the endpoint is live, it serves the OpenAI Chat Completions API at the
endpoint URL — find it in the dashboard or with \`modal endpoint list\`. The API
is served under \`/v1\`, and the model name to pass is the base model repo ID (for
catalog and Volume models) or your custom Hugging Face repo ID.

Send a chat completion with a \`POST\` request, passing your
[proxy token](#proxy-tokens) as a bearer token:

\`\`\`bash
curl "<your-endpoint-url>/v1/chat/completions" \\
  -H "Authorization: Bearer $MODAL_PROXY_TOKEN_ID.$MODAL_PROXY_TOKEN_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "<base-model-repo-id>",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'
\`\`\`

Or with \`Modal-Key\` and \`Modal-Secret\` headers:

\`\`\`bash
curl "<your-endpoint-url>/v1/chat/completions" \\
  -H "Modal-Key: $MODAL_PROXY_TOKEN_ID" \\
  -H "Modal-Secret: $MODAL_PROXY_TOKEN_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "<base-model-repo-id>",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'
\`\`\`

Because the endpoint is OpenAI-compatible, you can point any OpenAI client at it
by setting the base URL and API key. For example, with the OpenAI Python SDK:

\`\`\`python notest
from openai import OpenAI

client = OpenAI(
    base_url="<your-endpoint-url>/v1",
    api_key="wk-<id>.ws-<secret>",
)

client.chat.completions.create(
    model="<base-model-repo-id>",
    messages=[{"role": "user", "content": "Hello!"}],
)
\`\`\`

See [Endpoint integrations](/docs/guide/endpoint-integrations) for connecting
coding agents like OpenCode and Codex to a Shared Endpoint.

## Serving custom weights

Point an endpoint at a fine-tuned checkpoint instead of a catalog model. A
custom model is always served against a base model from the catalog: pass that
base model with \`--model\` so Modal can pick a compatible recipe, then point at
your weights with the \`--custom-hf-*\` or \`--custom-volume-*\` flags.

From a Hugging Face repo (use \`--custom-hf-token\` for gated or private repos):

\`\`\`bash
modal endpoint create \\
  --name my-ft \\
  --model Qwen/Qwen3.6-27B \\
  --custom-hf-repo aisingapore/Qwen-SEA-LION-v4.5-27B-IT \\
  --custom-hf-revision da42f2c0984d716fb2032e4176d81adfac98c630
\`\`\`

From a Modal Volume (the model directory must contain \`config.json\`):

\`\`\`bash
modal endpoint create \\
  --name my-volume-ft \\
  --model Qwen/Qwen3.5-4B \\
  --custom-volume-name my-volume \\
  --custom-volume-path /checkpoints/1234
\`\`\`

## Choosing where it runs

Two placement controls:

- **Routing region** (\`--routing-region\`) — where the request proxy is anchored.
  Pick the region closest to your callers: \`us-west\` (default), \`us-east\`,
  \`ca-central\`, \`eu-west\`, or \`ap-south\`.
- **Compute placement** (\`--compute-region\`, \`--colocate-compute\`) — by default,
  Modal places containers by availability. Pass \`--compute-region\` to select
  where containers run independently from request routing. You can repeat the
  option to allow scheduling in multiple regions. Alternatively, pass
  \`--colocate-compute\` to use the routing region.

Select compute regions independently from request routing:

\`\`\`bash
modal endpoint create \\
  --model Qwen/Qwen3.5-4B \\
  --routing-region us-east \\
  --compute-region us-west
\`\`\`

Or run compute in the routing region:

\`\`\`bash
modal endpoint create \\
  --model Qwen/Qwen3.5-4B \\
  --routing-region us-east \\
  --colocate-compute
\`\`\`

Selecting compute regions with \`--compute-region\` or \`--colocate-compute\`
incurs a [region selection multiplier](/docs/guide/region-selection#pricing).

## Managing endpoints

You can list all endpoints in an environment and their current status.

\`\`\`bash
modal endpoint list --env prod
modal endpoint list --env prod --json  # Contains more details
\`\`\`

Stop an endpoint when you no longer need it. This tears down its serving
containers and stops billing.

\`\`\`bash
modal endpoint stop qwen3-5-4b --env prod
\`\`\`

## Viewing the source

Modal Endpoints are built with the Modal SDK and leverage our new
high-performance [Server](/docs/guide/servers) primitive. You can see the
underlying code by navigating to the "Source" panel in the endpoint dashboard.

## Pricing

Endpoints bill for the GPU and CPU their containers use while running, at
standard Modal compute rates. Because endpoints scale to zero by default, you
pay nothing for compute while idle. You can adjust the autoscaling configuration
overrides in the UI. Region pinning applies a
[region selection multiplier](https://modal.com/pricing).

## Where credits can be used

Starting **September 1st, 2026**, credits can no longer be used to pay for
Shared Endpoint usage. Usage on all other Endpoints bill for compute as usual
and can still be paid with credits.

To cap out-of-pocket charges after this change, see
[spend limits](/docs/guide/budgets#spend-limits).
`,meta:{title:`Endpoints`,description:`Deploy a production-ready LLM inference endpoint on Modal’s managed infrastructure with a single command:`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<strong>Endpoints</strong>`),b=t(`<strong>Endpoints</strong>`),x=t(`<code>modal curl</code>`),S=t(`<!> <p>Deploy a production-ready LLM inference endpoint on Modal’s managed
infrastructure with a single command:</p> <!> <p>Endpoints support both open model weights and your own custom fine tunes,
sourced from either a Hugging Face repo or a Modal Volume.</p> <p>They provide a number of built-in features:</p> <ul><li><strong>Fast inference by default</strong> — every endpoint runs behind a low-latency
request proxy on tuned open-source inference engines, with SOTA speculative
decoding wherever the recipe supports it.</li> <li><strong>Usage-based pricing</strong> — you pay only for the <em>compute</em> your endpoint uses,
so you reap the benefits of our compute engine optimizations.</li> <li><strong>Scale-to-zero autoscaling</strong> — endpoints scale up under load and down to zero
when idle, with no manual tuning required.</li></ul> <p>This page is a high-level guide to Modal Endpoints.</p> <!> <p>Modal supports deploying pre-trained open and custom weight models from the
following families:</p> <ul><li>Qwen</li> <li>Kimi</li> <li>Gemma4</li> <li>DeepSeek</li> <li>Nemotron</li> <li>GPT-OSS</li> <li>GLM</li></ul> <p>Browse the full catalog on the <!> tab
in the dashboard.</p> <p>Spin up an endpoint for <code>Qwen/Qwen3.5-4B</code>:</p> <!> <p>Modal resolves the model, selects a compatible recipe, and starts provisioning.
The command prints the endpoint ID and a dashboard link where you can watch it
come online. You can also create endpoints from the <!> tab in the dashboard — the form
collects the same options.</p> <p>If you omit the <code>name</code> argument, Modal derives one from the model
(<code>Qwen/Qwen3.5-4B</code> → <code>qwen3-5-4b</code>).</p> <!> <p>Endpoints are authenticated by default. To call one, you need a <!> pair, which you can create with the
CLI:</p> <!> <p>This prints a token ID (<code>wk-...</code>) and secret (<code>ws-...</code>). The secret is only shown
at creation time and can’t be retrieved later, so store it somewhere safe.</p> <p>If your Workspace has <!> enabled, you’ll also need to
explicitly associate the new token with the Environment where you’ll create the
endpoint:</p> <!> <p>To authenticate a request, join the token ID and secret with a period (<code>.</code>) and
pass them as a single <code>Authorization: Bearer</code> header:</p> <!> <p>This is the same scheme the OpenAI API uses (<code>Authorization: Bearer &lt;api-key&gt;</code>),
so you can use the combined value as the API key in any OpenAI-compatible client
or gateway.</p> <p>The token also works as separate <code>Modal-Key</code> and <code>Modal-Secret</code> headers, which is
useful when you need to leave the <code>Authorization</code> header free for another token:</p> <!> <p>You can also make requests to an authenticated endpoint using the <!> utility. This performs transparent
authentication using your Modal API credentials, although API authentication
adds some latency so it is best suited for basic testing and demonstrations.</p> <p>To create an endpoint that accepts unauthenticated requests instead, pass <code>--unauthenticated</code>.</p> <!> <p>Once the endpoint is live, it serves the OpenAI Chat Completions API at the
endpoint URL — find it in the dashboard or with <code>modal endpoint list</code>. The API
is served under <code>/v1</code>, and the model name to pass is the base model repo ID (for
catalog and Volume models) or your custom Hugging Face repo ID.</p> <p>Send a chat completion with a <code>POST</code> request, passing your <!> as a bearer token:</p> <!> <p>Or with <code>Modal-Key</code> and <code>Modal-Secret</code> headers:</p> <!> <p>Because the endpoint is OpenAI-compatible, you can point any OpenAI client at it
by setting the base URL and API key. For example, with the OpenAI Python SDK:</p> <!> <p>See <!> for connecting
coding agents like OpenCode and Codex to a Shared Endpoint.</p> <!> <p>Point an endpoint at a fine-tuned checkpoint instead of a catalog model. A
custom model is always served against a base model from the catalog: pass that
base model with <code>--model</code> so Modal can pick a compatible recipe, then point at
your weights with the <code>--custom-hf-*</code> or <code>--custom-volume-*</code> flags.</p> <p>From a Hugging Face repo (use <code>--custom-hf-token</code> for gated or private repos):</p> <!> <p>From a Modal Volume (the model directory must contain <code>config.json</code>):</p> <!> <!> <p>Two placement controls:</p> <ul><li><strong>Routing region</strong> (<code>--routing-region</code>) — where the request proxy is anchored.
Pick the region closest to your callers: <code>us-west</code> (default), <code>us-east</code>, <code>ca-central</code>, <code>eu-west</code>, or <code>ap-south</code>.</li> <li><strong>Compute placement</strong> (<code>--compute-region</code>, <code>--colocate-compute</code>) — by default,
Modal places containers by availability. Pass <code>--compute-region</code> to select
where containers run independently from request routing. You can repeat the
option to allow scheduling in multiple regions. Alternatively, pass <code>--colocate-compute</code> to use the routing region.</li></ul> <p>Select compute regions independently from request routing:</p> <!> <p>Or run compute in the routing region:</p> <!> <p>Selecting compute regions with <code>--compute-region</code> or <code>--colocate-compute</code> incurs a <!>.</p> <!> <p>You can list all endpoints in an environment and their current status.</p> <!> <p>Stop an endpoint when you no longer need it. This tears down its serving
containers and stops billing.</p> <!> <!> <p>Modal Endpoints are built with the Modal SDK and leverage our new
high-performance <!> primitive. You can see the
underlying code by navigating to the “Source” panel in the endpoint dashboard.</p> <!> <p>Endpoints bill for the GPU and CPU their containers use while running, at
standard Modal compute rates. Because endpoints scale to zero by default, you
pay nothing for compute while idle. You can adjust the autoscaling configuration
overrides in the UI. Region pinning applies a <!>.</p> <!> <p>Starting <strong>September 1st, 2026</strong>, credits can no longer be used to pay for
Shared Endpoint usage. Usage on all other Endpoints bill for compute as usual
and can still be paid with credits.</p> <p>To cap out-of-pocket charges after this change, see <!>.</p>`,1);function C(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=S(),p=s(o);d(p,{id:`endpoints`,children:(e,t)=>{l(),i(e,r(`Endpoints`))},$$slots:{default:!0}});var h=c(p,4);f(h,{code:`modal%20endpoint%20create%20--model%20Qwen%2FQwen3.5-4B`,lang:`bash`});var g=c(h,10);u(g,{id:`getting-started`,children:(e,t)=>{l(),i(e,r(`Getting started`))},$$slots:{default:!0}});var _=c(g,6);m(c(e(_)),{href:`https://modal.com/endpoints`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);f(v,{code:`modal%20endpoint%20create%20--model%20Qwen%2FQwen3.5-4B`,lang:`bash`});var C=c(v,2);m(c(e(C)),{href:`https://modal.com/endpoints`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(C);var w=c(C,4);u(w,{id:`proxy-tokens`,children:(e,t)=>{l(),i(e,r(`Proxy tokens`))},$$slots:{default:!0}});var T=c(w,2);m(c(e(T)),{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{l(),i(e,r(`proxy token`))},$$slots:{default:!0}}),l(),n(T);var E=c(T,2);f(E,{code:`modal%20workspace%20proxy-tokens%20create`,lang:`bash`});var D=c(E,4);m(c(e(D)),{href:`/docs/guide/rbac`,children:(e,t)=>{l(),i(e,r(`RBAC`))},$$slots:{default:!0}}),l(),n(D);var O=c(D,2);f(O,{code:`modal%20workspace%20proxy-tokens%20allow%20wk-...%20main`,lang:`bash`});var k=c(O,4);f(k,{code:`Authorization%3A%20Bearer%20wk-%3Cid%3E.ws-%3Csecret%3E`,lang:`text`});var A=c(k,6);f(A,{code:`Modal-Key%3A%20wk-...%0AModal-Secret%3A%20ws-...`,lang:`text`});var j=c(A,2);m(c(e(j)),{href:`/docs/cli/latest/curl`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);u(M,{id:`calling-your-endpoint`,children:(e,t)=>{l(),i(e,r(`Calling your endpoint`))},$$slots:{default:!0}});var N=c(M,4);m(c(e(N),3),{href:`#proxy-tokens`,children:(e,t)=>{l(),i(e,r(`proxy token`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,2);f(P,{code:`curl%20%22%3Cyour-endpoint-url%3E%2Fv1%2Fchat%2Fcompletions%22%20%5C%0A%20%20-H%20%22Authorization%3A%20Bearer%20%24MODAL_PROXY_TOKEN_ID.%24MODAL_PROXY_TOKEN_SECRET%22%20%5C%0A%20%20-H%20%22Content-Type%3A%20application%2Fjson%22%20%5C%0A%20%20-d%20'%7B%0A%20%20%20%20%22model%22%3A%20%22%3Cbase-model-repo-id%3E%22%2C%0A%20%20%20%20%22messages%22%3A%20%5B%7B%20%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello!%22%20%7D%5D%0A%20%20%7D'`,lang:`bash`});var F=c(P,4);f(F,{code:`curl%20%22%3Cyour-endpoint-url%3E%2Fv1%2Fchat%2Fcompletions%22%20%5C%0A%20%20-H%20%22Modal-Key%3A%20%24MODAL_PROXY_TOKEN_ID%22%20%5C%0A%20%20-H%20%22Modal-Secret%3A%20%24MODAL_PROXY_TOKEN_SECRET%22%20%5C%0A%20%20-H%20%22Content-Type%3A%20application%2Fjson%22%20%5C%0A%20%20-d%20'%7B%0A%20%20%20%20%22model%22%3A%20%22%3Cbase-model-repo-id%3E%22%2C%0A%20%20%20%20%22messages%22%3A%20%5B%7B%20%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello!%22%20%7D%5D%0A%20%20%7D'`,lang:`bash`});var I=c(F,4);f(I,{code:`from%20openai%20import%20OpenAI%0A%0Aclient%20%3D%20OpenAI(%0A%20%20%20%20base_url%3D%22%3Cyour-endpoint-url%3E%2Fv1%22%2C%0A%20%20%20%20api_key%3D%22wk-%3Cid%3E.ws-%3Csecret%3E%22%2C%0A)%0A%0Aclient.chat.completions.create(%0A%20%20%20%20model%3D%22%3Cbase-model-repo-id%3E%22%2C%0A%20%20%20%20messages%3D%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Hello!%22%7D%5D%2C%0A)`,lang:`python`});var L=c(I,2);m(c(e(L)),{href:`/docs/guide/endpoint-integrations`,children:(e,t)=>{l(),i(e,r(`Endpoint integrations`))},$$slots:{default:!0}}),l(),n(L);var R=c(L,2);u(R,{id:`serving-custom-weights`,children:(e,t)=>{l(),i(e,r(`Serving custom weights`))},$$slots:{default:!0}});var z=c(R,6);f(z,{code:`modal%20endpoint%20create%20%5C%0A%20%20--name%20my-ft%20%5C%0A%20%20--model%20Qwen%2FQwen3.6-27B%20%5C%0A%20%20--custom-hf-repo%20aisingapore%2FQwen-SEA-LION-v4.5-27B-IT%20%5C%0A%20%20--custom-hf-revision%20da42f2c0984d716fb2032e4176d81adfac98c630`,lang:`bash`});var B=c(z,4);f(B,{code:`modal%20endpoint%20create%20%5C%0A%20%20--name%20my-volume-ft%20%5C%0A%20%20--model%20Qwen%2FQwen3.5-4B%20%5C%0A%20%20--custom-volume-name%20my-volume%20%5C%0A%20%20--custom-volume-path%20%2Fcheckpoints%2F1234`,lang:`bash`});var V=c(B,2);u(V,{id:`choosing-where-it-runs`,children:(e,t)=>{l(),i(e,r(`Choosing where it runs`))},$$slots:{default:!0}});var H=c(V,8);f(H,{code:`modal%20endpoint%20create%20%5C%0A%20%20--model%20Qwen%2FQwen3.5-4B%20%5C%0A%20%20--routing-region%20us-east%20%5C%0A%20%20--compute-region%20us-west`,lang:`bash`});var U=c(H,4);f(U,{code:`modal%20endpoint%20create%20%5C%0A%20%20--model%20Qwen%2FQwen3.5-4B%20%5C%0A%20%20--routing-region%20us-east%20%5C%0A%20%20--colocate-compute`,lang:`bash`});var W=c(U,2);m(c(e(W),5),{href:`/docs/guide/region-selection#pricing`,children:(e,t)=>{l(),i(e,r(`region selection multiplier`))},$$slots:{default:!0}}),l(),n(W);var G=c(W,2);u(G,{id:`managing-endpoints`,children:(e,t)=>{l(),i(e,r(`Managing endpoints`))},$$slots:{default:!0}});var K=c(G,4);f(K,{code:`modal%20endpoint%20list%20--env%20prod%0Amodal%20endpoint%20list%20--env%20prod%20--json%20%20%23%20Contains%20more%20details`,lang:`bash`});var q=c(K,4);f(q,{code:`modal%20endpoint%20stop%20qwen3-5-4b%20--env%20prod`,lang:`bash`});var J=c(q,2);u(J,{id:`viewing-the-source`,children:(e,t)=>{l(),i(e,r(`Viewing the source`))},$$slots:{default:!0}});var Y=c(J,2);m(c(e(Y)),{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Server`))},$$slots:{default:!0}}),l(),n(Y);var X=c(Y,2);u(X,{id:`pricing`,children:(e,t)=>{l(),i(e,r(`Pricing`))},$$slots:{default:!0}});var Z=c(X,2);m(c(e(Z)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`region selection multiplier`))},$$slots:{default:!0}}),l(),n(Z);var Q=c(Z,2);u(Q,{id:`where-credits-can-be-used`,children:(e,t)=>{l(),i(e,r(`Where credits can be used`))},$$slots:{default:!0}});var $=c(Q,4);m(c(e($)),{href:`/docs/guide/budgets#spend-limits`,children:(e,t)=>{l(),i(e,r(`spend limits`))},$$slots:{default:!0}}),l(),n($),i(t,o)},$$slots:{default:!0}}))}export{C as default,h as metadata};
//# sourceMappingURL=Cw1Ab4jX2.js.map
