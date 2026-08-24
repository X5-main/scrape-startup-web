(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`9d0f2f52-0eae-486a-a972-a1f933bfea94`,e._sentryDebugIdIdentifier=`sentry-dbid-9d0f2f52-0eae-486a-a972-a1f933bfea94`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Endpoint integrations`,id:`endpoint-integrations`,children:[{depth:2,value:`OpenCode`,id:`opencode`},{depth:2,value:`Codex`,id:`codex`}]}],rawContent:`# Endpoint integrations

OpenAI-compatible coding agents, such as OpenCode and Codex, can connect
directly to your Shared Endpoints. Shared Endpoints are available through
\`https://inference.us-west.modal.direct\` and are routed on the OpenAI \`model\`
field, so the model ID is the endpoint's hostname, for example
\`my-endpoint.us-west.modal.direct\`.

To see which Shared Endpoints a token can reach, list all model IDs with:

\`\`\`bash
curl "https://inference.us-west.modal.direct/v1/models" \\
  -H "Authorization: Bearer $MODAL_PROXY_TOKEN_ID.$MODAL_PROXY_TOKEN_SECRET"
\`\`\`

## OpenCode

[Install OpenCode](https://opencode.ai/docs/) and create a
[proxy token](/docs/guide/endpoints#proxy-tokens). In the OpenCode CLI, run
\`/connect\`, select Modal as the
[provider](https://opencode.ai/docs/providers/), and enter the token as the
API key in its combined form, \`wk-<id>.ws-<secret>\`. Then run \`/models\` and
select your endpoint by hostname.

For CI or other headless use, set the token in the environment instead of
running \`/connect\`:

\`\`\`bash
export MODAL_PROXY_TOKEN="wk-<id>.ws-<secret>"
\`\`\`

## Codex

[Install Codex](https://learn.chatgpt.com/docs/codex/cli), create a
[proxy token](/docs/guide/endpoints#proxy-tokens), and define Modal as a model
provider in \`~/.codex/config.toml\`:

\`\`\`toml
# ~/.codex/config.toml
[model_providers.modal]
name = "Modal"
base_url = "https://inference.us-west.modal.direct/v1"
env_key = "MODAL_PROXY_TOKEN"
wire_api = "responses"
\`\`\`

Then you can run Codex via the following command with the endpoint hostname as
the model ID:

\`\`\`bash
export MODAL_PROXY_TOKEN="$MODAL_PROXY_TOKEN_ID.$MODAL_PROXY_TOKEN_SECRET"
codex \\
  --model my-endpoint.us-west.modal.direct \\
  --config model_provider='"modal"'
\`\`\`
`,meta:{title:`Endpoint integrations`,description:`OpenAI-compatible coding agents, such as OpenCode and Codex, can connect directly to your Shared Endpoints. Shared Endpoints are available through https://inference.us-west.modal.direct and are routed on the OpenAI model field, so the model ID is the endpoint’s hostname, for example my-endpoint.us-west.modal.direct.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>OpenAI-compatible coding agents, such as OpenCode and Codex, can connect
directly to your Shared Endpoints. Shared Endpoints are available through <code>https://inference.us-west.modal.direct</code> and are routed on the OpenAI <code>model</code> field, so the model ID is the endpoint’s hostname, for example <code>my-endpoint.us-west.modal.direct</code>.</p> <p>To see which Shared Endpoints a token can reach, list all model IDs with:</p> <!> <!> <p><!> and create a <!>. In the OpenCode CLI, run <code>/connect</code>, select Modal as the <!>, and enter the token as the
API key in its combined form, <code>wk-&lt;id&gt;.ws-&lt;secret&gt;</code>. Then run <code>/models</code> and
select your endpoint by hostname.</p> <p>For CI or other headless use, set the token in the environment instead of
running <code>/connect</code>:</p> <!> <!> <p><!>, create a <!>, and define Modal as a model
provider in <code>~/.codex/config.toml</code>:</p> <!> <p>Then you can run Codex via the following command with the endpoint hostname as
the model ID:</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`endpoint-integrations`,children:(e,t)=>{l(),i(e,r(`Endpoint integrations`))},$$slots:{default:!0}});var h=c(p,6);f(h,{code:`curl%20%22https%3A%2F%2Finference.us-west.modal.direct%2Fv1%2Fmodels%22%20%5C%0A%20%20-H%20%22Authorization%3A%20Bearer%20%24MODAL_PROXY_TOKEN_ID.%24MODAL_PROXY_TOKEN_SECRET%22`,lang:`bash`});var g=c(h,2);u(g,{id:`opencode`,children:(e,t)=>{l(),i(e,r(`OpenCode`))},$$slots:{default:!0}});var _=c(g,2),v=e(_);m(v,{href:`https://opencode.ai/docs/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Install OpenCode`))},$$slots:{default:!0}});var b=c(v,2);m(b,{href:`/docs/guide/endpoints#proxy-tokens`,children:(e,t)=>{l(),i(e,r(`proxy token`))},$$slots:{default:!0}}),m(c(b,4),{href:`https://opencode.ai/docs/providers/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`provider`))},$$slots:{default:!0}}),l(5),n(_);var x=c(_,4);f(x,{code:`export%20MODAL_PROXY_TOKEN%3D%22wk-%3Cid%3E.ws-%3Csecret%3E%22`,lang:`bash`});var S=c(x,2);u(S,{id:`codex`,children:(e,t)=>{l(),i(e,r(`Codex`))},$$slots:{default:!0}});var C=c(S,2),w=e(C);m(w,{href:`https://learn.chatgpt.com/docs/codex/cli`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Install Codex`))},$$slots:{default:!0}}),m(c(w,2),{href:`/docs/guide/endpoints#proxy-tokens`,children:(e,t)=>{l(),i(e,r(`proxy token`))},$$slots:{default:!0}}),l(3),n(C);var T=c(C,2);f(T,{code:`%23%20~%2F.codex%2Fconfig.toml%0A%5Bmodel_providers.modal%5D%0Aname%20%3D%20%22Modal%22%0Abase_url%20%3D%20%22https%3A%2F%2Finference.us-west.modal.direct%2Fv1%22%0Aenv_key%20%3D%20%22MODAL_PROXY_TOKEN%22%0Awire_api%20%3D%20%22responses%22`,lang:`toml`}),f(c(T,4),{code:`export%20MODAL_PROXY_TOKEN%3D%22%24MODAL_PROXY_TOKEN_ID.%24MODAL_PROXY_TOKEN_SECRET%22%0Acodex%20%5C%0A%20%20--model%20my-endpoint.us-west.modal.direct%20%5C%0A%20%20--config%20model_provider%3D'%22modal%22'`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BFZdyFH32.js.map
