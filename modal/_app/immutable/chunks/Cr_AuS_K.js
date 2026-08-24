(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3ee0d0fe-0da8-460e-9d4e-c3b138c5a0cd`,e._sentryDebugIdIdentifier=`sentry-dbid-3ee0d0fe-0da8-460e-9d4e-c3b138c5a0cd`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as l}from"./DYSGKh1I.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Web Function URLs`,id:`web-function-urls`,children:[{depth:2,value:`Determine the Web Function URL from code`,id:`determine-the-web-function-url-from-code`},{depth:2,value:`Auto-generated URLs`,id:`auto-generated-urls`},{depth:2,value:`User-specified labels`,id:`user-specified-labels`},{depth:2,value:`Ephemeral Apps`,id:`ephemeral-apps`},{depth:2,value:`Truncation`,id:`truncation`},{depth:2,value:`Custom domains`,id:`custom-domains`}]}],rawContent:`# Web Function URLs

This guide documents the behavior of URLs for [Web Functions](/docs/guide/webhooks)
on Modal: automatic generation, configuration, programmatic retrieval, and more.

## Determine the Web Function URL from code

Modal Functions with the
[\`fastapi_endpoint\`](/docs/sdk/py/latest/fastapi_endpoint),
[\`asgi_app\`](/docs/sdk/py/latest/asgi_app),
[\`wsgi_app\`](/docs/sdk/py/latest/wsgi_app),
or [\`web_server\`](/docs/sdk/py/latest/web_server) decorator
are made available over the Internet when they are
[\`serve\`d](/docs/cli/latest/serve) or [\`deploy\`ed](/docs/cli/latest/deploy)
and so they have a URL.

This URL is displayed in the \`modal\` CLI output
and is available in the Modal [dashboard](/apps) for the Function.

To determine a Function's URL programmatically,
check its [\`get_web_url()\`](/docs/sdk/py/latest/Function#get_web_url)
property:

\`\`\`python
@app.function(image=modal.Image.debian_slim().pip_install("fastapi[standard]"))
@modal.fastapi_endpoint(docs=True)
def show_url() -> str:
    return show_url.get_web_url()
\`\`\`

For deployed Functions, this also works from other Python code!
You just need to do a [\`from_name\`](/docs/sdk/py/latest/Function#from_name)
based on the name of the Function and its [App](/docs/guide/apps):

\`\`\`python notest
import requests

remote_function = modal.Function.from_name("app", "show_url")
remote_function.get_web_url() == requests.get(handle.get_web_url()).json()
\`\`\`

## Auto-generated URLs

By default, Modal Functions
will be served from the \`modal.run\` domain.
The full URL will be constructed from a number of pieces of information
to uniquely identify the endpoint.

At a high-level, Web Function URLs for deployed Apps have the
following structure: \`https://<source>--<label>.modal.run\`.

The \`source\` component represents the Workspace and Environment where the App is
deployed. If your Workspace has only a single Environment, the \`source\` will
just be the Workspace name. Multiple Environments are disambiguated by an
["Environment suffix"](/docs/guide/environments#environment-web-suffixes), so
the full source would be \`<workspace>-<suffix>\`. However, one Environment per
Workspace is allowed to have a null suffix, in which case the source would just
be \`<workspace>\`.

The \`label\` component represents the specific App and Function that the URL
routes to. By default, these are concatenated with a hyphen, so the label would
be \`<app>-<function>\`.

These components are normalized to contain only lowercase letters, numerals, and dashes.

To put this all together, consider the following example. If a member of the
\`ECorp\` Workspace uses the \`main\` Environment (which has \`prod\` as its web
suffix) to deploy the \`text_to_speech\` App with a webhook for the \`flask-app\`
Function, the URL will have the following components:

- _Source_:
  - _Workspace name slug_: \`ECorp\` → \`ecorp\`
  - _Environment web suffix slug_: \`main\` → \`prod\`
- _Label_:
  - _App name slug_: \`text_to_speech\` → \`text-to-speech\`
  - _Function name slug_: \`flask_app\` → \`flask-app\`

The full URL will be \`https://ecorp-prod--text-to-speech-flask-app.modal.run\`.

## User-specified labels

It's also possible to customize the \`label\` used for each Function
by passing a parameter to the relevant Web Function decorator:

\`\`\`python
import modal

image = modal.Image.debian_slim().pip_install("fastapi")
app = modal.App(name="text_to_speech", image=image)


@app.function()
@modal.fastapi_endpoint(label="speechify")
def web_endpoint_handler():
    ...
\`\`\`

Building on the example above, this code would produce the following URL:
\`https://ecorp-prod--speechify.modal.run\`.

User-specified labels are not automatically normalized, but labels with
invalid characters will be rejected.

## Ephemeral Apps

To support development workflows, webhooks for ephemeral Apps (i.e., Apps
created with \`modal serve\`) will have a \`-dev\` suffix appended to their URL
label (regardless of whether the label is auto-generated or user-specified).
This prevents development work from interfering with deployed versions of the
same App.

If an ephemeral App is serving a Web Function while another ephemeral App
is created seeking the same label, the new Function will _steal_ the running
Function's label.

This ensures that the latest iteration of the ephemeral Function is
serving requests and that older ones stop receiving web traffic.

## Truncation

If a generated subdomain label is longer than 63 characters, it will be
truncated.

For example, the following subdomain label is too long, 67 characters:
\`ecorp--text-to-speech-really-really-realllly-long-function-name-dev\`.

The truncation happens by calculating a SHA-256 hash of the overlong label, then
taking the first 6 characters of this hash. The overlong subdomain label is
truncated to 56 characters, and then joined by a dash to the hash prefix. In
the above example, the resulting URL would be
\`ecorp--text-to-speech-really-really-rea-1b964b-dev.modal.run\`.

The combination of the label hashing and truncation provides a unique list of 63
characters, complying with both DNS system limits and uniqueness requirements.

## Custom domains

<Callout variant="gated-feature">
Custom domains are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.
</Callout>

For more customization, you can use your own domain names with Web Functions.
If your [plan](/pricing) supports custom domains, visit the [Custom Domains
tab](/settings/custom-domains) in your Workspace settings to add a domain name to your
Workspace.

You can use three kinds of domains with Modal:

- **Apex:** root domain names like \`example.com\`
- **Subdomain:** single subdomain entries such as \`my-app.example.com\`,
  \`api.example.com\`, etc.
- **Wildcard domain:** either in a subdomain like \`*.example.com\`, or in a
  deeper level like \`*.modal.example.com\`

<Callout variant="info">
Adding a custom domain does not disable the auto-generated <code>.modal.run</code> URL. Both the custom domain and the original URL will continue to work.
</Callout>

You'll be asked to update your domain DNS records with your domain name
registrar and then validate the configuration in Modal. Once the records have
been properly updated and propagated, your custom domain will be ready to use.

You can assign any Modal Web Function to any registered domain in your Workspace
with the \`custom_domains\` argument.

\`\`\`python
import modal

app = modal.App("custom-domains-example")


@app.function()
@modal.fastapi_endpoint(custom_domains=["api.example.com"])
def hello(message: str):
    return {"message": f"hello {message}"}
\`\`\`

You can then run \`modal deploy\` to put your Web Functions online, live.

\`\`\`shell
$ curl -s https://api.example.com?message=world
{"message": "hello world"}
\`\`\`

Note that Modal automatically generates and renews TLS certificates for your
custom domains. Since we do this when your domain is first accessed, there may
be an additional 1-2s latency on the first request. Additional requests use a
cached certificate.

You can also register multiple domain names and associate them with the same Web
Function.

\`\`\`python
import modal

app = modal.App("custom-domains-example-2")


@app.function()
@modal.fastapi_endpoint(custom_domains=["api.example.com", "api.example.net"])
def hello(message: str):
    return {"message": f"hello {message}"}
\`\`\`

For **Wildcard** domains, Modal will automatically resolve arbitrary custom
endpoints (and issue TLS certificates). For example, if you add the wildcard
domain \`*.example.com\`, then you can create any custom domains under
\`example.com\`:

\`\`\`python
import random
import modal

app = modal.App("custom-domains-example-2")

random_domain_name = random.choice(range(10))


@app.function()
@modal.fastapi_endpoint(custom_domains=[f"{random_domain_name}.example.com"])
def hello(message: str):
    return {"message": f"hello {message}"}
\`\`\`

Custom domains can also be used with
[ASGI](https://modal.com/docs/sdk/py/latest/asgi_app) or
[WSGI](https://modal.com/docs/sdk/py/latest/wsgi_app) apps using the same
\`custom_domains\` argument.
`,meta:{title:`Web Function URLs`,description:`This guide documents the behavior of URLs for Web Functions on Modal: automatic generation, configuration, programmatic retrieval, and more.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>fastapi_endpoint</code>`),te=t(`<code>asgi_app</code>`),b=t(`<code>wsgi_app</code>`),x=t(`<code>web_server</code>`),S=t(`<code>serve</code>d`,1),ne=t(`<code>deploy</code>ed`,1),re=t(`<code>get_web_url()</code>`),C=t(`<code>from_name</code>`),w=t(`Custom domains are available on the <a href="/pricing">Team and Enterprise plans</a>. Visit <a href="/settings/plans">Workspace settings</a> to upgrade.`,1),T=t(`Adding a custom domain does not disable the auto-generated <code>.modal.run</code> URL. Both the custom domain and the original URL will continue to work.`,1),E=t(`<!> <p>This guide documents the behavior of URLs for <!> on Modal: automatic generation, configuration, programmatic retrieval, and more.</p> <!> <p>Modal Functions with the <!>, <!>, <!>,
or <!> decorator
are made available over the Internet when they are <!> or <!> and so they have a URL.</p> <p>This URL is displayed in the <code>modal</code> CLI output
and is available in the Modal <!> for the Function.</p> <p>To determine a Function’s URL programmatically,
check its <!> property:</p> <!> <p>For deployed Functions, this also works from other Python code!
You just need to do a <!> based on the name of the Function and its <!>:</p> <!> <!> <p>By default, Modal Functions
will be served from the <code>modal.run</code> domain.
The full URL will be constructed from a number of pieces of information
to uniquely identify the endpoint.</p> <p>At a high-level, Web Function URLs for deployed Apps have the
following structure: <code>https://&lt;source&gt;--&lt;label&gt;.modal.run</code>.</p> <p>The <code>source</code> component represents the Workspace and Environment where the App is
deployed. If your Workspace has only a single Environment, the <code>source</code> will
just be the Workspace name. Multiple Environments are disambiguated by an <!>, so
the full source would be <code>&lt;workspace&gt;-&lt;suffix&gt;</code>. However, one Environment per
Workspace is allowed to have a null suffix, in which case the source would just
be <code>&lt;workspace&gt;</code>.</p> <p>The <code>label</code> component represents the specific App and Function that the URL
routes to. By default, these are concatenated with a hyphen, so the label would
be <code>&lt;app&gt;-&lt;function&gt;</code>.</p> <p>These components are normalized to contain only lowercase letters, numerals, and dashes.</p> <p>To put this all together, consider the following example. If a member of the <code>ECorp</code> Workspace uses the <code>main</code> Environment (which has <code>prod</code> as its web
suffix) to deploy the <code>text_to_speech</code> App with a webhook for the <code>flask-app</code> Function, the URL will have the following components:</p> <ul><li><em>Source</em>: <ul><li><em>Workspace name slug</em>: <code>ECorp</code> → <code>ecorp</code></li> <li><em>Environment web suffix slug</em>: <code>main</code> → <code>prod</code></li></ul></li> <li><em>Label</em>: <ul><li><em>App name slug</em>: <code>text_to_speech</code> → <code>text-to-speech</code></li> <li><em>Function name slug</em>: <code>flask_app</code> → <code>flask-app</code></li></ul></li></ul> <p>The full URL will be <code>https://ecorp-prod--text-to-speech-flask-app.modal.run</code>.</p> <!> <p>It’s also possible to customize the <code>label</code> used for each Function
by passing a parameter to the relevant Web Function decorator:</p> <!> <p>Building on the example above, this code would produce the following URL: <code>https://ecorp-prod--speechify.modal.run</code>.</p> <p>User-specified labels are not automatically normalized, but labels with
invalid characters will be rejected.</p> <!> <p>To support development workflows, webhooks for ephemeral Apps (i.e., Apps
created with <code>modal serve</code>) will have a <code>-dev</code> suffix appended to their URL
label (regardless of whether the label is auto-generated or user-specified).
This prevents development work from interfering with deployed versions of the
same App.</p> <p>If an ephemeral App is serving a Web Function while another ephemeral App
is created seeking the same label, the new Function will <em>steal</em> the running
Function’s label.</p> <p>This ensures that the latest iteration of the ephemeral Function is
serving requests and that older ones stop receiving web traffic.</p> <!> <p>If a generated subdomain label is longer than 63 characters, it will be
truncated.</p> <p>For example, the following subdomain label is too long, 67 characters: <code>ecorp--text-to-speech-really-really-realllly-long-function-name-dev</code>.</p> <p>The truncation happens by calculating a SHA-256 hash of the overlong label, then
taking the first 6 characters of this hash. The overlong subdomain label is
truncated to 56 characters, and then joined by a dash to the hash prefix. In
the above example, the resulting URL would be <code>ecorp--text-to-speech-really-really-rea-1b964b-dev.modal.run</code>.</p> <p>The combination of the label hashing and truncation provides a unique list of 63
characters, complying with both DNS system limits and uniqueness requirements.</p> <!> <!> <p>For more customization, you can use your own domain names with Web Functions.
If your <!> supports custom domains, visit the <!> in your Workspace settings to add a domain name to your
Workspace.</p> <p>You can use three kinds of domains with Modal:</p> <ul><li><strong>Apex:</strong> root domain names like <code>example.com</code></li> <li><strong>Subdomain:</strong> single subdomain entries such as <code>my-app.example.com</code>, <code>api.example.com</code>, etc.</li> <li><strong>Wildcard domain:</strong> either in a subdomain like <code>*.example.com</code>, or in a
deeper level like <code>*.modal.example.com</code></li></ul> <!> <p>You’ll be asked to update your domain DNS records with your domain name
registrar and then validate the configuration in Modal. Once the records have
been properly updated and propagated, your custom domain will be ready to use.</p> <p>You can assign any Modal Web Function to any registered domain in your Workspace
with the <code>custom_domains</code> argument.</p> <!> <p>You can then run <code>modal deploy</code> to put your Web Functions online, live.</p> <!> <p>Note that Modal automatically generates and renews TLS certificates for your
custom domains. Since we do this when your domain is first accessed, there may
be an additional 1-2s latency on the first request. Additional requests use a
cached certificate.</p> <p>You can also register multiple domain names and associate them with the same Web
Function.</p> <!> <p>For <strong>Wildcard</strong> domains, Modal will automatically resolve arbitrary custom
endpoints (and issue TLS certificates). For example, if you add the wildcard
domain <code>*.example.com</code>, then you can create any custom domains under <code>example.com</code>:</p> <!> <p>Custom domains can also be used with <!> or <!> apps using the same <code>custom_domains</code> argument.</p>`,1);function D(t,g){let _=ee(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,a(()=>_,()=>h,{children:(t,ee)=>{var a=E(),p=o(a);d(p,{id:`web-function-urls`,children:(e,t)=>{c(),i(e,r(`Web Function URLs`))},$$slots:{default:!0}});var h=s(p,2);m(s(e(h)),{href:`/docs/guide/webhooks`,children:(e,t)=>{c(),i(e,r(`Web Functions`))},$$slots:{default:!0}}),c(),n(h);var g=s(h,2);u(g,{id:`determine-the-web-function-url-from-code`,children:(e,t)=>{c(),i(e,r(`Determine the Web Function URL from code`))},$$slots:{default:!0}});var _=s(g,2),v=s(e(_));m(v,{href:`/docs/sdk/py/latest/fastapi_endpoint`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}});var D=s(v,2);m(D,{href:`/docs/sdk/py/latest/asgi_app`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}});var O=s(D,2);m(O,{href:`/docs/sdk/py/latest/wsgi_app`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}});var k=s(O,2);m(k,{href:`/docs/sdk/py/latest/web_server`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var A=s(k,2);m(A,{href:`/docs/cli/latest/serve`,children:(e,t)=>{var n=S();c(),i(e,n)},$$slots:{default:!0}}),m(s(A,2),{href:`/docs/cli/latest/deploy`,children:(e,t)=>{var n=ne();c(),i(e,n)},$$slots:{default:!0}}),c(),n(_);var j=s(_,2);m(s(e(j),3),{href:`/apps`,children:(e,t)=>{c(),i(e,r(`dashboard`))},$$slots:{default:!0}}),c(),n(j);var M=s(j,2);m(s(e(M)),{href:`/docs/sdk/py/latest/Function#get_web_url`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),c(),n(M);var N=s(M,2);f(N,{code:`%40app.function(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22))%0A%40modal.fastapi_endpoint(docs%3DTrue)%0Adef%20show_url()%20-%3E%20str%3A%0A%20%20%20%20return%20show_url.get_web_url()`,lang:`python`});var P=s(N,2),F=s(e(P));m(F,{href:`/docs/sdk/py/latest/Function#from_name`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),m(s(F,2),{href:`/docs/guide/apps`,children:(e,t)=>{c(),i(e,r(`App`))},$$slots:{default:!0}}),c(),n(P);var I=s(P,2);f(I,{code:`import%20requests%0A%0Aremote_function%20%3D%20modal.Function.from_name(%22app%22%2C%20%22show_url%22)%0Aremote_function.get_web_url()%20%3D%3D%20requests.get(handle.get_web_url()).json()`,lang:`python`});var L=s(I,2);u(L,{id:`auto-generated-urls`,children:(e,t)=>{c(),i(e,r(`Auto-generated URLs`))},$$slots:{default:!0}});var R=s(L,6);m(s(e(R),5),{href:`/docs/guide/environments#environment-web-suffixes`,children:(e,t)=>{c(),i(e,r(`“Environment suffix”`))},$$slots:{default:!0}}),c(5),n(R);var z=s(R,12);u(z,{id:`user-specified-labels`,children:(e,t)=>{c(),i(e,r(`User-specified labels`))},$$slots:{default:!0}});var B=s(z,4);f(B,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%22)%0Aapp%20%3D%20modal.App(name%3D%22text_to_speech%22%2C%20image%3Dimage)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(label%3D%22speechify%22)%0Adef%20web_endpoint_handler()%3A%0A%20%20%20%20...`,lang:`python`});var V=s(B,6);u(V,{id:`ephemeral-apps`,children:(e,t)=>{c(),i(e,r(`Ephemeral Apps`))},$$slots:{default:!0}});var H=s(V,8);u(H,{id:`truncation`,children:(e,t)=>{c(),i(e,r(`Truncation`))},$$slots:{default:!0}});var U=s(H,10);u(U,{id:`custom-domains`,children:(e,t)=>{c(),i(e,r(`Custom domains`))},$$slots:{default:!0}});var W=s(U,2);l(W,{variant:`gated-feature`,children:(e,t)=>{c();var n=w();c(4),i(e,n)},$$slots:{default:!0}});var G=s(W,2),K=s(e(G));m(K,{href:`/pricing`,children:(e,t)=>{c(),i(e,r(`plan`))},$$slots:{default:!0}}),m(s(K,2),{href:`/settings/custom-domains`,children:(e,t)=>{c(),i(e,r(`Custom Domains
tab`))},$$slots:{default:!0}}),c(),n(G);var q=s(G,6);l(q,{variant:`info`,children:(e,t)=>{c();var n=T();c(2),i(e,n)},$$slots:{default:!0}});var J=s(q,6);f(J,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22custom-domains-example%22)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(custom_domains%3D%5B%22api.example.com%22%5D)%0Adef%20hello(message%3A%20str)%3A%0A%20%20%20%20return%20%7B%22message%22%3A%20f%22hello%20%7Bmessage%7D%22%7D`,lang:`python`});var Y=s(J,4);f(Y,{code:`%24%20curl%20-s%20https%3A%2F%2Fapi.example.com%3Fmessage%3Dworld%0A%7B%22message%22%3A%20%22hello%20world%22%7D`,lang:`shell`});var X=s(Y,6);f(X,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(%22custom-domains-example-2%22)%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(custom_domains%3D%5B%22api.example.com%22%2C%20%22api.example.net%22%5D)%0Adef%20hello(message%3A%20str)%3A%0A%20%20%20%20return%20%7B%22message%22%3A%20f%22hello%20%7Bmessage%7D%22%7D`,lang:`python`});var Z=s(X,4);f(Z,{code:`import%20random%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22custom-domains-example-2%22)%0A%0Arandom_domain_name%20%3D%20random.choice(range(10))%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(custom_domains%3D%5Bf%22%7Brandom_domain_name%7D.example.com%22%5D)%0Adef%20hello(message%3A%20str)%3A%0A%20%20%20%20return%20%7B%22message%22%3A%20f%22hello%20%7Bmessage%7D%22%7D`,lang:`python`});var Q=s(Z,2),$=s(e(Q));m($,{href:`https://modal.com/docs/sdk/py/latest/asgi_app`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`ASGI`))},$$slots:{default:!0}}),m(s($,2),{href:`https://modal.com/docs/sdk/py/latest/wsgi_app`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`WSGI`))},$$slots:{default:!0}}),c(3),n(Q),i(t,a)},$$slots:{default:!0}}))}export{D as default,h as metadata};
//# sourceMappingURL=Cr_AuS_K.js.map
