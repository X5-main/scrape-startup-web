(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fb3440fc-99ee-4fb2-842d-38136613ce05`,e._sentryDebugIdIdentifier=`sentry-dbid-fb3440fc-99ee-4fb2-842d-38136613ce05`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Inject Secrets into a Sandbox with a proxy Sidecar`,id:`inject-secrets-into-a-sandbox-with-a-proxy-sidecar`,children:[{depth:2,value:`Configure the proxy`,id:`configure-the-proxy`},{depth:2,value:`Build the Images`,id:`build-the-images`},{depth:2,value:`Start the Sandbox`,id:`start-the-sandbox`},{depth:2,value:`Start the proxy Sidecar`,id:`start-the-proxy-sidecar`},{depth:2,value:`Call the API from the Sandbox`,id:`call-the-api-from-the-sandbox`}]}],rawContent:`# Inject Secrets into a Sandbox with a proxy Sidecar

Code running in a [Sandbox](https://modal.com/docs/guide/sandbox) often needs to call an
external API that requires an API key. Rather than passing that key into the Sandbox,
you can keep it in a separate, trusted container and let that container add it to
outbound requests:

\`\`\`
Sandbox code  ->  proxy Sidecar  ->  api.anthropic.com
(no API key)      (adds the key)
\`\`\`

The proxy runs as a [Sidecar](https://modal.com/docs/guide/sandbox-sidecars): a sibling
container that shares a private network with the Sandbox. That network is reachable only
from inside the Sandbox, so the proxy is available to your Sandbox code and to nothing
else, while the key itself stays in a Modal
[Secret](https://modal.com/docs/guide/secrets) mounted on the Sidecar alone.

We use [Caddy](https://caddyserver.com/) as the proxy and the Anthropic API as the
upstream, but any proxy that can set request headers (nginx, Envoy, or something you
write yourself) and any authenticated API will do.

Sandbox Sidecars are in alpha and access is restricted to allowlisted workspaces.

To run this example, create the Secret it reads the key from:

\`\`\`
modal secret create anthropic-secret ANTHROPIC_API_KEY=sk-ant-...
\`\`\`

\`\`\`python
import argparse
import tempfile
from pathlib import Path

import modal

app = modal.App.lookup("example-sidecar-secrets-injection", create_if_missing=True)

MINUTES = 60  # seconds

\`\`\`

## Configure the proxy

Each Sidecar is reachable from the Sandbox at the name we give it, resolved through
\`/etc/hosts\` on the shared bridge network.

\`\`\`python
SIDECAR_NAME = "egress-proxy"
SIDECAR_PORT = 8080
PROXY_URL = f"http://{SIDECAR_NAME}:{SIDECAR_PORT}"

\`\`\`

The proxy's behavior is defined by a
[Caddyfile](https://caddyserver.com/docs/caddyfile). Ours forwards every request to the
Anthropic API, filling in the real key from the Sidecar's own environment. It also
drops any \`Authorization\` header that came from the Sandbox, so the proxy decides which
key reaches the upstream.

\`\`\`python
DEFAULT_CADDYFILE = """\\
{
    admin off
}

:8080 {
    reverse_proxy https://api.anthropic.com {
        header_up Host api.anthropic.com
        header_up x-api-key {env.ANTHROPIC_API_KEY}
        header_up -Authorization
    }
}
"""

\`\`\`

To point the proxy at a different upstream, or to add rules of your own — rate limits,
path restrictions, extra headers — pass your own config instead:

\`\`\`python
parser = argparse.ArgumentParser()
parser.add_argument(
    "--caddyfile",
    type=Path,
    default=None,
    help="path to a Caddyfile to use instead of the default",
)
args = parser.parse_args()

caddyfile = args.caddyfile.read_text() if args.caddyfile else DEFAULT_CADDYFILE

\`\`\`

## Build the Images

We write the config out and copy it to the path the \`caddy\` Image already reads on
startup, so the Sidecar needs no command of its own.

Sidecars can't build their Image lazily on startup, so we
[build it up front](https://modal.com/docs/guide/sandboxes#separating-image-builds-from-sandbox-creation)
with \`Image.build\` and pass the resolved Image along.

\`\`\`python
with tempfile.TemporaryDirectory() as tmp_dir:
    caddyfile_path = Path(tmp_dir) / "Caddyfile"
    caddyfile_path.write_text(caddyfile)
    with modal.enable_output():
        sidecar_image = (
            modal.Image.from_registry("caddy:2.11")
            .add_local_file(caddyfile_path, "/etc/caddy/Caddyfile", copy=True)
            .build(app)
        )

sandbox_image = modal.Image.debian_slim(python_version="3.12").pip_install(
    "anthropic==0.121.0"
)

\`\`\`

## Start the Sandbox

The Sandbox is told where the proxy is but is given no Secrets. An empty
\`outbound_cidr_allowlist\` cuts off its access to the public internet while leaving the
private network to its Sidecars intact, so the proxy becomes the Sandbox's only way out.

We pass no command, so the Sandbox stays alive waiting for us to send it work.

\`\`\`python
with modal.enable_output():
    sandbox = modal.Sandbox.create(
        app=app,
        image=sandbox_image,
        env={"ANTHROPIC_BASE_URL": PROXY_URL},
        outbound_cidr_allowlist=[],
        timeout=5 * MINUTES,
    )
print(f"Sandbox ID: {sandbox.object_id}")

\`\`\`

## Start the proxy Sidecar

Now we start Caddy alongside it, with the Anthropic Secret mounted here and only here.

\`\`\`python
sidecar = sandbox._experimental_sidecars.create(
    name=SIDECAR_NAME,
    image=sidecar_image,
    secrets=[
        modal.Secret.from_name("anthropic-secret", required_keys=["ANTHROPIC_API_KEY"])
    ],
)
print(f"Sidecar ID: {sidecar.object_id}")

\`\`\`

Creating a Sidecar returns as soon as its container starts, which is before Caddy is
listening, so we wait for the port to start accepting connections.

\`\`\`python
sandbox.exec(
    "bash",
    "-c",
    f"until (echo > /dev/tcp/{SIDECAR_NAME}/{SIDECAR_PORT}) 2>/dev/null; do sleep 0.1; done",
    timeout=1 * MINUTES,
).wait()

\`\`\`

## Call the API from the Sandbox

The code below runs inside the Sandbox. It first shows what it has to work with — no key,
and no direct route to Anthropic — then calls the API with an invalid key, which the
proxy swaps out for the real one on the way through.

Note that the call itself is unmodified from what it would be without a proxy: the
Anthropic SDK, like most SDKs and agent harnesses, picks up its base URL from the
environment.

\`\`\`python
UNTRUSTED_CODE = """
import os
import socket

import anthropic

print(f"ANTHROPIC_API_KEY in Sandbox env: {'ANTHROPIC_API_KEY' in os.environ}")

try:
    socket.create_connection(("api.anthropic.com", 443), timeout=10).close()
    print("Direct connection to api.anthropic.com: succeeded")
except OSError as exc:
    print(f"Direct connection to api.anthropic.com: blocked ({type(exc).__name__})")

print(f"Calling Anthropic through {os.environ['ANTHROPIC_BASE_URL']} with an invalid key")
client = anthropic.Anthropic(api_key="not-a-real-key")
message = client.messages.create(
    model="claude-haiku-4-5-20251001",
    max_tokens=256,
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)
print(f"Response: {message.content[0].text}")
"""

process = sandbox.exec("python", "-c", UNTRUSTED_CODE)
for line in process.stdout:
    print(line, end="")
if process.wait() != 0:
    raise RuntimeError(process.stderr.read())

\`\`\`

The output should look something like

\`\`\`
ANTHROPIC_API_KEY in Sandbox env: False
Direct connection to api.anthropic.com: blocked (OSError)
Calling Anthropic through http://egress-proxy:8080 with an invalid key
Response: Hello! It's nice to meet you.
\`\`\`

Terminating the Sandbox tears down its Sidecars along with it.

\`\`\`python
sandbox.terminate()

\`\`\`

It's worth knowing where this boundary ends: the Sandbox never sees the key, but
it can still use it, and can make as many Anthropic calls as it likes. If that matters
for your workload, the proxy is also the natural place to add rate limits or to restrict
which paths it forwards.
`,meta:{title:`Inject Secrets into a Sandbox with a proxy Sidecar`,description:`Code running in a Sandbox often needs to call an external API that requires an API key. Rather than passing that key into the Sandbox, you can keep it in a separate, trusted container and let that container add it to outbound requests:`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>Code running in a <!> often needs to call an
external API that requires an API key. Rather than passing that key into the Sandbox,
you can keep it in a separate, trusted container and let that container add it to
outbound requests:</p> <!> <p>The proxy runs as a <!>: a sibling
container that shares a private network with the Sandbox. That network is reachable only
from inside the Sandbox, so the proxy is available to your Sandbox code and to nothing
else, while the key itself stays in a Modal <!> mounted on the Sidecar alone.</p> <p>We use <!> as the proxy and the Anthropic API as the
upstream, but any proxy that can set request headers (nginx, Envoy, or something you
write yourself) and any authenticated API will do.</p> <p>Sandbox Sidecars are in alpha and access is restricted to allowlisted workspaces.</p> <p>To run this example, create the Secret it reads the key from:</p> <!> <!> <!> <p>Each Sidecar is reachable from the Sandbox at the name we give it, resolved through <code>/etc/hosts</code> on the shared bridge network.</p> <!> <p>The proxy’s behavior is defined by a <!>. Ours forwards every request to the
Anthropic API, filling in the real key from the Sidecar’s own environment. It also
drops any <code>Authorization</code> header that came from the Sandbox, so the proxy decides which
key reaches the upstream.</p> <!> <p>To point the proxy at a different upstream, or to add rules of your own — rate limits,
path restrictions, extra headers — pass your own config instead:</p> <!> <!> <p>We write the config out and copy it to the path the <code>caddy</code> Image already reads on
startup, so the Sidecar needs no command of its own.</p> <p>Sidecars can’t build their Image lazily on startup, so we <!> with <code>Image.build</code> and pass the resolved Image along.</p> <!> <!> <p>The Sandbox is told where the proxy is but is given no Secrets. An empty <code>outbound_cidr_allowlist</code> cuts off its access to the public internet while leaving the
private network to its Sidecars intact, so the proxy becomes the Sandbox’s only way out.</p> <p>We pass no command, so the Sandbox stays alive waiting for us to send it work.</p> <!> <!> <p>Now we start Caddy alongside it, with the Anthropic Secret mounted here and only here.</p> <!> <p>Creating a Sidecar returns as soon as its container starts, which is before Caddy is
listening, so we wait for the port to start accepting connections.</p> <!> <!> <p>The code below runs inside the Sandbox. It first shows what it has to work with — no key,
and no direct route to Anthropic — then calls the API with an invalid key, which the
proxy swaps out for the real one on the way through.</p> <p>Note that the call itself is unmodified from what it would be without a proxy: the
Anthropic SDK, like most SDKs and agent harnesses, picks up its base URL from the
environment.</p> <!> <p>The output should look something like</p> <!> <p>Terminating the Sandbox tears down its Sidecars along with it.</p> <!> <p>It’s worth knowing where this boundary ends: the Sandbox never sees the key, but
it can still use it, and can make as many Anthropic calls as it likes. If that matters
for your workload, the proxy is also the natural place to add rate limits or to restrict
which paths it forwards.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`inject-secrets-into-a-sandbox-with-a-proxy-sidecar`,children:(e,t)=>{l(),i(e,r(`Inject Secrets into a Sandbox with a proxy Sidecar`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);f(g,{code:`Sandbox%20code%20%20-%3E%20%20proxy%20Sidecar%20%20-%3E%20%20api.anthropic.com%0A(no%20API%20key)%20%20%20%20%20%20(adds%20the%20key)`,lang:`text`});var _=c(g,2),v=c(e(_));m(v,{href:`https://modal.com/docs/guide/sandbox-sidecars`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sidecar`))},$$slots:{default:!0}}),m(c(v,2),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secret`))},$$slots:{default:!0}}),l(),n(_);var b=c(_,2);m(c(e(b)),{href:`https://caddyserver.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Caddy`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,6);f(x,{code:`modal%20secret%20create%20anthropic-secret%20ANTHROPIC_API_KEY%3Dsk-ant-...`,lang:`text`});var S=c(x,2);f(S,{code:`import%20argparse%0Aimport%20tempfile%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22example-sidecar-secrets-injection%22%2C%20create_if_missing%3DTrue)%0A%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A`,lang:`python`});var C=c(S,2);u(C,{id:`configure-the-proxy`,children:(e,t)=>{l(),i(e,r(`Configure the proxy`))},$$slots:{default:!0}});var w=c(C,4);f(w,{code:`SIDECAR_NAME%20%3D%20%22egress-proxy%22%0ASIDECAR_PORT%20%3D%208080%0APROXY_URL%20%3D%20f%22http%3A%2F%2F%7BSIDECAR_NAME%7D%3A%7BSIDECAR_PORT%7D%22%0A`,lang:`python`});var T=c(w,2);m(c(e(T)),{href:`https://caddyserver.com/docs/caddyfile`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Caddyfile`))},$$slots:{default:!0}}),l(3),n(T);var E=c(T,2);f(E,{code:`DEFAULT_CADDYFILE%20%3D%20%22%22%22%5C%0A%7B%0A%20%20%20%20admin%20off%0A%7D%0A%0A%3A8080%20%7B%0A%20%20%20%20reverse_proxy%20https%3A%2F%2Fapi.anthropic.com%20%7B%0A%20%20%20%20%20%20%20%20header_up%20Host%20api.anthropic.com%0A%20%20%20%20%20%20%20%20header_up%20x-api-key%20%7Benv.ANTHROPIC_API_KEY%7D%0A%20%20%20%20%20%20%20%20header_up%20-Authorization%0A%20%20%20%20%7D%0A%7D%0A%22%22%22%0A`,lang:`python`});var D=c(E,4);f(D,{code:`parser%20%3D%20argparse.ArgumentParser()%0Aparser.add_argument(%0A%20%20%20%20%22--caddyfile%22%2C%0A%20%20%20%20type%3DPath%2C%0A%20%20%20%20default%3DNone%2C%0A%20%20%20%20help%3D%22path%20to%20a%20Caddyfile%20to%20use%20instead%20of%20the%20default%22%2C%0A)%0Aargs%20%3D%20parser.parse_args()%0A%0Acaddyfile%20%3D%20args.caddyfile.read_text()%20if%20args.caddyfile%20else%20DEFAULT_CADDYFILE%0A`,lang:`python`});var O=c(D,2);u(O,{id:`build-the-images`,children:(e,t)=>{l(),i(e,r(`Build the Images`))},$$slots:{default:!0}});var k=c(O,4);m(c(e(k)),{href:`https://modal.com/docs/guide/sandboxes#separating-image-builds-from-sandbox-creation`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`build it up front`))},$$slots:{default:!0}}),l(3),n(k);var A=c(k,2);f(A,{code:`with%20tempfile.TemporaryDirectory()%20as%20tmp_dir%3A%0A%20%20%20%20caddyfile_path%20%3D%20Path(tmp_dir)%20%2F%20%22Caddyfile%22%0A%20%20%20%20caddyfile_path.write_text(caddyfile)%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20sidecar_image%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20modal.Image.from_registry(%22caddy%3A2.11%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20.add_local_file(caddyfile_path%2C%20%22%2Fetc%2Fcaddy%2FCaddyfile%22%2C%20copy%3DTrue)%0A%20%20%20%20%20%20%20%20%20%20%20%20.build(app)%0A%20%20%20%20%20%20%20%20)%0A%0Asandbox_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).pip_install(%0A%20%20%20%20%22anthropic%3D%3D0.121.0%22%0A)%0A`,lang:`python`});var j=c(A,2);u(j,{id:`start-the-sandbox`,children:(e,t)=>{l(),i(e,r(`Start the Sandbox`))},$$slots:{default:!0}});var M=c(j,6);f(M,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20image%3Dsandbox_image%2C%0A%20%20%20%20%20%20%20%20env%3D%7B%22ANTHROPIC_BASE_URL%22%3A%20PROXY_URL%7D%2C%0A%20%20%20%20%20%20%20%20outbound_cidr_allowlist%3D%5B%5D%2C%0A%20%20%20%20%20%20%20%20timeout%3D5%20*%20MINUTES%2C%0A%20%20%20%20)%0Aprint(f%22Sandbox%20ID%3A%20%7Bsandbox.object_id%7D%22)%0A`,lang:`python`});var N=c(M,2);u(N,{id:`start-the-proxy-sidecar`,children:(e,t)=>{l(),i(e,r(`Start the proxy Sidecar`))},$$slots:{default:!0}});var P=c(N,4);f(P,{code:`sidecar%20%3D%20sandbox._experimental_sidecars.create(%0A%20%20%20%20name%3DSIDECAR_NAME%2C%0A%20%20%20%20image%3Dsidecar_image%2C%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22anthropic-secret%22%2C%20required_keys%3D%5B%22ANTHROPIC_API_KEY%22%5D)%0A%20%20%20%20%5D%2C%0A)%0Aprint(f%22Sidecar%20ID%3A%20%7Bsidecar.object_id%7D%22)%0A`,lang:`python`});var F=c(P,4);f(F,{code:`sandbox.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20f%22until%20(echo%20%3E%20%2Fdev%2Ftcp%2F%7BSIDECAR_NAME%7D%2F%7BSIDECAR_PORT%7D)%202%3E%2Fdev%2Fnull%3B%20do%20sleep%200.1%3B%20done%22%2C%0A%20%20%20%20timeout%3D1%20*%20MINUTES%2C%0A).wait()%0A`,lang:`python`});var I=c(F,2);u(I,{id:`call-the-api-from-the-sandbox`,children:(e,t)=>{l(),i(e,r(`Call the API from the Sandbox`))},$$slots:{default:!0}});var L=c(I,6);f(L,{code:`UNTRUSTED_CODE%20%3D%20%22%22%22%0Aimport%20os%0Aimport%20socket%0A%0Aimport%20anthropic%0A%0Aprint(f%22ANTHROPIC_API_KEY%20in%20Sandbox%20env%3A%20%7B'ANTHROPIC_API_KEY'%20in%20os.environ%7D%22)%0A%0Atry%3A%0A%20%20%20%20socket.create_connection((%22api.anthropic.com%22%2C%20443)%2C%20timeout%3D10).close()%0A%20%20%20%20print(%22Direct%20connection%20to%20api.anthropic.com%3A%20succeeded%22)%0Aexcept%20OSError%20as%20exc%3A%0A%20%20%20%20print(f%22Direct%20connection%20to%20api.anthropic.com%3A%20blocked%20(%7Btype(exc).__name__%7D)%22)%0A%0Aprint(f%22Calling%20Anthropic%20through%20%7Bos.environ%5B'ANTHROPIC_BASE_URL'%5D%7D%20with%20an%20invalid%20key%22)%0Aclient%20%3D%20anthropic.Anthropic(api_key%3D%22not-a-real-key%22)%0Amessage%20%3D%20client.messages.create(%0A%20%20%20%20model%3D%22claude-haiku-4-5-20251001%22%2C%0A%20%20%20%20max_tokens%3D256%2C%0A%20%20%20%20messages%3D%5B%7B%22role%22%3A%20%22user%22%2C%20%22content%22%3A%20%22Say%20hello%20in%20one%20sentence.%22%7D%5D%2C%0A)%0Aprint(f%22Response%3A%20%7Bmessage.content%5B0%5D.text%7D%22)%0A%22%22%22%0A%0Aprocess%20%3D%20sandbox.exec(%22python%22%2C%20%22-c%22%2C%20UNTRUSTED_CODE)%0Afor%20line%20in%20process.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Aif%20process.wait()%20!%3D%200%3A%0A%20%20%20%20raise%20RuntimeError(process.stderr.read())%0A`,lang:`python`});var R=c(L,4);f(R,{code:`ANTHROPIC_API_KEY%20in%20Sandbox%20env%3A%20False%0ADirect%20connection%20to%20api.anthropic.com%3A%20blocked%20(OSError)%0ACalling%20Anthropic%20through%20http%3A%2F%2Fegress-proxy%3A8080%20with%20an%20invalid%20key%0AResponse%3A%20Hello!%20It's%20nice%20to%20meet%20you.`,lang:`text`}),f(c(R,4),{code:`sandbox.terminate()%0A`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=DzgDjt7X2.js.map
