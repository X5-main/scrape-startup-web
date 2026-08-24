(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`2a53c3cb-de5a-4785-9fe1-7a240cf9ce04`,e._sentryDebugIdIdentifier=`sentry-dbid-2a53c3cb-de5a-4785-9fe1-7a240cf9ce04`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run Anthropic’s computer use demo in a Modal Sandbox`,id:`run-anthropics-computer-use-demo-in-a-modal-sandbox`,children:[{depth:2,value:`Sandbox Setup`,id:`sandbox-setup`}]}],rawContent:`# Run Anthropic's computer use demo in a Modal Sandbox

This example demonstrates how to run Anthropic's [Computer Use demo](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo)
in a Modal [Sandbox](https://modal.com/docs/guide/sandbox).

## Sandbox Setup

All Sandboxes are associated with an App.

We start by looking up an existing App by name, or creating one if it doesn't exist.

\`\`\`python
import time
import urllib.request

import modal

app = modal.App.lookup("example-anthropic-computer-use", create_if_missing=True)

\`\`\`

The Computer Use [quickstart](https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo)
provides a prebuilt Docker image. We use this hosted image to create our sandbox environment.

\`\`\`python
sandbox_image = (
    modal.Image.from_registry(
        "ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest",
    )
    .env({"WIDTH": "1920", "HEIGHT": "1080"})
    .workdir("/home/computeruse")
    .entrypoint([])
)

\`\`\`

We'll provide the Anthropic API key via a Modal [Secret](https://modal.com/docs/guide/secrets)
which the sandbox can access at runtime.

\`\`\`python
secret = modal.Secret.from_name("anthropic-secret", required_keys=["ANTHROPIC_API_KEY"])

\`\`\`

Now, we can start our Sandbox.
We use \`modal.enable_output()\` to print the Sandbox's image build logs to the console.
We'll also expose the ports required for the demo's interfaces:

- Port 8501 serves the Streamlit UI for interacting with the agent loop
- Port 6080 serves the VNC desktop view via a browser-based noVNC client

\`\`\`python
with modal.enable_output():
    sandbox = modal.Sandbox.create(
        "sudo",
        "--preserve-env=ANTHROPIC_API_KEY,DISPLAY_NUM,WIDTH,HEIGHT,PATH",
        "-u",
        "computeruse",
        "./entrypoint.sh",
        app=app,
        image=sandbox_image,
        secrets=[secret],
        encrypted_ports=[8501, 6080],
        timeout=60 * 60,  # stay alive for one hour, maximum one day
    )

print(f"🏖️  Sandbox ID: {sandbox.object_id}")

\`\`\`

After starting the sandbox, we retrieve the public URLs for the exposed ports.

\`\`\`python
tunnels = sandbox.tunnels()
for port, tunnel in tunnels.items():
    print(f"Waiting for service on port {port} to start at {tunnel.url}")

\`\`\`

We can check on each server's status by making an HTTP request to the server's URL
and verifying that it responds with a 200 status code.

\`\`\`python
def is_server_up(url):
    try:
        response = urllib.request.urlopen(url)
        return response.getcode() == 200
    except Exception:
        return False


timeout = 60  # seconds
start_time = time.time()
up_ports = set()
while time.time() - start_time < timeout:
    for port, tunnel in tunnels.items():
        if port not in up_ports and is_server_up(tunnel.url):
            print(f"🏖️  Server is up and running on port {port}!")
            up_ports.add(port)
    if len(up_ports) == len(tunnels):
        break
    time.sleep(1)
else:
    print("🏖️  Timed out waiting for server to start.")


\`\`\`

You can now open the URLs in your browser to interact with the demo!
Note: The sandbox logs may mention \`localhost:8080\`.
Ignore this and use the printed tunnel URLs instead.

When finished, you can terminate the sandbox from your [Modal dashboard](https://modal.com/containers)
or by running \`Sandbox.from_id(sandbox.object_id).terminate()\`.
The Sandbox will also spin down after one hour.
`,meta:{title:`Run Anthropic’s computer use demo in a Modal Sandbox`,description:`This example demonstrates how to run Anthropic’s Computer Use demo in a Modal Sandbox.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>This example demonstrates how to run Anthropic’s <!> in a Modal <!>.</p> <!> <p>All Sandboxes are associated with an App.</p> <p>We start by looking up an existing App by name, or creating one if it doesn’t exist.</p> <!> <p>The Computer Use <!> provides a prebuilt Docker image. We use this hosted image to create our sandbox environment.</p> <!> <p>We’ll provide the Anthropic API key via a Modal <!> which the sandbox can access at runtime.</p> <!> <p>Now, we can start our Sandbox.
We use <code>modal.enable_output()</code> to print the Sandbox’s image build logs to the console.
We’ll also expose the ports required for the demo’s interfaces:</p> <ul><li>Port 8501 serves the Streamlit UI for interacting with the agent loop</li> <li>Port 6080 serves the VNC desktop view via a browser-based noVNC client</li></ul> <!> <p>After starting the sandbox, we retrieve the public URLs for the exposed ports.</p> <!> <p>We can check on each server’s status by making an HTTP request to the server’s URL
and verifying that it responds with a 200 status code.</p> <!> <p>You can now open the URLs in your browser to interact with the demo!
Note: The sandbox logs may mention <code>localhost:8080</code>.
Ignore this and use the printed tunnel URLs instead.</p> <p>When finished, you can terminate the sandbox from your <!> or by running <code>Sandbox.from_id(sandbox.object_id).terminate()</code>.
The Sandbox will also spin down after one hour.</p>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`run-anthropics-computer-use-demo-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Run Anthropic’s computer use demo in a Modal Sandbox`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Computer Use demo`))},$$slots:{default:!0}}),m(c(g,2),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(h);var _=c(h,2);u(_,{id:`sandbox-setup`,children:(e,t)=>{l(),i(e,r(`Sandbox Setup`))},$$slots:{default:!0}});var v=c(_,6);f(v,{code:`import%20time%0Aimport%20urllib.request%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22example-anthropic-computer-use%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var b=c(v,2);m(c(e(b)),{href:`https://github.com/anthropics/anthropic-quickstarts/tree/main/computer-use-demo`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`quickstart`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,2);f(x,{code:`sandbox_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%0A%20%20%20%20%20%20%20%20%22ghcr.io%2Fanthropics%2Fanthropic-quickstarts%3Acomputer-use-demo-latest%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22WIDTH%22%3A%20%221920%22%2C%20%22HEIGHT%22%3A%20%221080%22%7D)%0A%20%20%20%20.workdir(%22%2Fhome%2Fcomputeruse%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A)%0A`,lang:`python`});var S=c(x,2);m(c(e(S)),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secret`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);f(C,{code:`secret%20%3D%20modal.Secret.from_name(%22anthropic-secret%22%2C%20required_keys%3D%5B%22ANTHROPIC_API_KEY%22%5D)%0A`,lang:`python`});var w=c(C,6);f(w,{code:`with%20modal.enable_output()%3A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%22sudo%22%2C%0A%20%20%20%20%20%20%20%20%22--preserve-env%3DANTHROPIC_API_KEY%2CDISPLAY_NUM%2CWIDTH%2CHEIGHT%2CPATH%22%2C%0A%20%20%20%20%20%20%20%20%22-u%22%2C%0A%20%20%20%20%20%20%20%20%22computeruse%22%2C%0A%20%20%20%20%20%20%20%20%22.%2Fentrypoint.sh%22%2C%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20image%3Dsandbox_image%2C%0A%20%20%20%20%20%20%20%20secrets%3D%5Bsecret%5D%2C%0A%20%20%20%20%20%20%20%20encrypted_ports%3D%5B8501%2C%206080%5D%2C%0A%20%20%20%20%20%20%20%20timeout%3D60%20*%2060%2C%20%20%23%20stay%20alive%20for%20one%20hour%2C%20maximum%20one%20day%0A%20%20%20%20)%0A%0Aprint(f%22%F0%9F%8F%96%EF%B8%8F%20%20Sandbox%20ID%3A%20%7Bsandbox.object_id%7D%22)%0A`,lang:`python`});var T=c(w,4);f(T,{code:`tunnels%20%3D%20sandbox.tunnels()%0Afor%20port%2C%20tunnel%20in%20tunnels.items()%3A%0A%20%20%20%20print(f%22Waiting%20for%20service%20on%20port%20%7Bport%7D%20to%20start%20at%20%7Btunnel.url%7D%22)%0A`,lang:`python`});var E=c(T,4);f(E,{code:`def%20is_server_up(url)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20response%20%3D%20urllib.request.urlopen(url)%0A%20%20%20%20%20%20%20%20return%20response.getcode()%20%3D%3D%20200%0A%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%0Atimeout%20%3D%2060%20%20%23%20seconds%0Astart_time%20%3D%20time.time()%0Aup_ports%20%3D%20set()%0Awhile%20time.time()%20-%20start_time%20%3C%20timeout%3A%0A%20%20%20%20for%20port%2C%20tunnel%20in%20tunnels.items()%3A%0A%20%20%20%20%20%20%20%20if%20port%20not%20in%20up_ports%20and%20is_server_up(tunnel.url)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22%F0%9F%8F%96%EF%B8%8F%20%20Server%20is%20up%20and%20running%20on%20port%20%7Bport%7D!%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20up_ports.add(port)%0A%20%20%20%20if%20len(up_ports)%20%3D%3D%20len(tunnels)%3A%0A%20%20%20%20%20%20%20%20break%0A%20%20%20%20time.sleep(1)%0Aelse%3A%0A%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Timed%20out%20waiting%20for%20server%20to%20start.%22)%0A%0A`,lang:`python`});var D=c(E,4);m(c(e(D)),{href:`https://modal.com/containers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(3),n(D),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=BMMLHrAN.js.map
