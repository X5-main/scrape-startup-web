(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`41a14240-9ddf-4e7b-ab6a-82d37de8eb80`,e._sentryDebugIdIdentifier=`sentry-dbid-41a14240-9ddf-4e7b-ab6a-82d37de8eb80`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Run a Jupyter notebook in a Modal Sandbox`,id:`run-a-jupyter-notebook-in-a-modal-sandbox`,children:[{depth:2,value:`Setting up the Sandbox`,id:`setting-up-the-sandbox`},{depth:2,value:`Starting a Jupyter server in a Sandbox`,id:`starting-a-jupyter-server-in-a-sandbox`},{depth:2,value:`Communicating with a Jupyter server`,id:`communicating-with-a-jupyter-server`}]}],rawContent:`# Run a Jupyter notebook in a Modal Sandbox

This example demonstrates how to run a Jupyter notebook in a Modal
[Sandbox](https://modal.com/docs/guide/sandbox).

## Setting up the Sandbox

All Sandboxes are associated with an App.

We look up our app by name, creating it if it doesn't exist.

\`\`\`python
import json
import secrets
import time
import urllib.request

import modal

app = modal.App.lookup("example-jupyter-sandbox", create_if_missing=True)

\`\`\`

We define a custom Docker image that has Jupyter and some other dependencies installed.
Using a pre-defined image allows us to avoid re-installing packages on every Sandbox startup.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.12").uv_pip_install("jupyter~=1.1.0")
    # .uv_pip_install("pandas", "numpy", "seaborn")  # Any other deps
)

\`\`\`

## Starting a Jupyter server in a Sandbox

Since we'll be exposing a Jupyter server over the Internet, we need to create a password.
We'll use \`secrets\` from the standard library to create a token
and then store it in a Modal [Secret](https://modal.com/docs/guide/secrets).

\`\`\`python
token = secrets.token_urlsafe(13)
token_secret = modal.Secret.from_dict({"JUPYTER_TOKEN": token})

\`\`\`

Now, we can start our Sandbox. Note our use of the \`encrypted_ports\` argument, which
allows us to securely expose the Jupyter server to the public Internet. We use
\`modal.enable_output()\` to print the Sandbox's image build logs to the console.

\`\`\`python
JUPYTER_PORT = 8888

print("🏖️  Creating sandbox")

with modal.enable_output():
    sandbox = modal.Sandbox.create(
        "jupyter",
        "notebook",
        "--no-browser",
        "--allow-root",
        "--ip=0.0.0.0",
        f"--port={JUPYTER_PORT}",
        "--NotebookApp.allow_origin='*'",
        "--NotebookApp.allow_remote_access=1",
        encrypted_ports=[JUPYTER_PORT],
        secrets=[token_secret],
        timeout=5 * 60,  # 5 minutes
        image=image,
        app=app,
        gpu=None,  # add a GPU if you need it!
    )

print(f"🏖️  Sandbox ID: {sandbox.object_id}")

\`\`\`

## Communicating with a Jupyter server

Next, we print out a URL that we can use to connect to our Jupyter server.
Note that we have to call [\`Sandbox.tunnels\`](https://modal.com/docs/reference/modal.Sandbox#tunnels)
to get the URL. The Sandbox is not publicly accessible until we do so.

\`\`\`python
tunnel = sandbox.tunnels()[JUPYTER_PORT]
url = f"{tunnel.url}/?token={token}"
print(f"🏖️  Jupyter notebook is running at: {url}")

\`\`\`

Jupyter servers expose a [REST API](https://jupyter-server.readthedocs.io/en/latest/developers/rest-api.html)
that you can use for programmatic manipulation.

For example, we can check the server's status by
sending a GET request to the \`/api/status\` endpoint.

\`\`\`python
def is_jupyter_up():
    try:
        response = urllib.request.urlopen(f"{tunnel.url}/api/status?token={token}")
        if response.getcode() == 200:
            data = json.loads(response.read().decode())
            return data.get("started", False)
    except Exception:
        return False
    return False


\`\`\`

We'll now wait for the Jupyter server to be ready by hitting that endpoint.

\`\`\`python
timeout = 60  # seconds
start_time = time.time()
while time.time() - start_time < timeout:
    if is_jupyter_up():
        print("🏖️  Jupyter is up and running!")
        break
    time.sleep(1)
else:
    print("🏖️  Timed out waiting for Jupyter to start.")


\`\`\`

You can now open this URL in your browser to access the Jupyter notebook!

When you're done, terminate the sandbox using your [Modal dashboard](https://modal.com/sandboxes)
or by running \`Sandbox.from_id(sandbox.object_id).terminate()\`.
`,meta:{title:`Run a Jupyter notebook in a Modal Sandbox`,description:`This example demonstrates how to run a Jupyter notebook in a Modal Sandbox.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Sandbox.tunnels</code>`),b=t(`<!> <p>This example demonstrates how to run a Jupyter notebook in a Modal <!>.</p> <!> <p>All Sandboxes are associated with an App.</p> <p>We look up our app by name, creating it if it doesn’t exist.</p> <!> <p>We define a custom Docker image that has Jupyter and some other dependencies installed.
Using a pre-defined image allows us to avoid re-installing packages on every Sandbox startup.</p> <!> <!> <p>Since we’ll be exposing a Jupyter server over the Internet, we need to create a password.
We’ll use <code>secrets</code> from the standard library to create a token
and then store it in a Modal <!>.</p> <!> <p>Now, we can start our Sandbox. Note our use of the <code>encrypted_ports</code> argument, which
allows us to securely expose the Jupyter server to the public Internet. We use <code>modal.enable_output()</code> to print the Sandbox’s image build logs to the console.</p> <!> <!> <p>Next, we print out a URL that we can use to connect to our Jupyter server.
Note that we have to call <!> to get the URL. The Sandbox is not publicly accessible until we do so.</p> <!> <p>Jupyter servers expose a <!> that you can use for programmatic manipulation.</p> <p>For example, we can check the server’s status by
sending a GET request to the <code>/api/status</code> endpoint.</p> <!> <p>We’ll now wait for the Jupyter server to be ready by hitting that endpoint.</p> <!> <p>You can now open this URL in your browser to access the Jupyter notebook!</p> <p>When you’re done, terminate the sandbox using your <!> or by running <code>Sandbox.from_id(sandbox.object_id).terminate()</code>.</p>`,1);function x(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=b(),p=s(o);d(p,{id:`run-a-jupyter-notebook-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Run a Jupyter notebook in a Modal Sandbox`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,2);u(g,{id:`setting-up-the-sandbox`,children:(e,t)=>{l(),i(e,r(`Setting up the Sandbox`))},$$slots:{default:!0}});var _=c(g,6);f(_,{code:`import%20json%0Aimport%20secrets%0Aimport%20time%0Aimport%20urllib.request%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App.lookup(%22example-jupyter-sandbox%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var v=c(_,4);f(v,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.12%22).uv_pip_install(%22jupyter~%3D1.1.0%22)%0A%20%20%20%20%23%20.uv_pip_install(%22pandas%22%2C%20%22numpy%22%2C%20%22seaborn%22)%20%20%23%20Any%20other%20deps%0A)%0A`,lang:`python`});var x=c(v,2);u(x,{id:`starting-a-jupyter-server-in-a-sandbox`,children:(e,t)=>{l(),i(e,r(`Starting a Jupyter server in a Sandbox`))},$$slots:{default:!0}});var S=c(x,2);m(c(e(S),3),{href:`https://modal.com/docs/guide/secrets`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Secret`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,2);f(C,{code:`token%20%3D%20secrets.token_urlsafe(13)%0Atoken_secret%20%3D%20modal.Secret.from_dict(%7B%22JUPYTER_TOKEN%22%3A%20token%7D)%0A`,lang:`python`});var w=c(C,4);f(w,{code:`JUPYTER_PORT%20%3D%208888%0A%0Aprint(%22%F0%9F%8F%96%EF%B8%8F%20%20Creating%20sandbox%22)%0A%0Awith%20modal.enable_output()%3A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20%22jupyter%22%2C%0A%20%20%20%20%20%20%20%20%22notebook%22%2C%0A%20%20%20%20%20%20%20%20%22--no-browser%22%2C%0A%20%20%20%20%20%20%20%20%22--allow-root%22%2C%0A%20%20%20%20%20%20%20%20%22--ip%3D0.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20f%22--port%3D%7BJUPYTER_PORT%7D%22%2C%0A%20%20%20%20%20%20%20%20%22--NotebookApp.allow_origin%3D'*'%22%2C%0A%20%20%20%20%20%20%20%20%22--NotebookApp.allow_remote_access%3D1%22%2C%0A%20%20%20%20%20%20%20%20encrypted_ports%3D%5BJUPYTER_PORT%5D%2C%0A%20%20%20%20%20%20%20%20secrets%3D%5Btoken_secret%5D%2C%0A%20%20%20%20%20%20%20%20timeout%3D5%20*%2060%2C%20%20%23%205%20minutes%0A%20%20%20%20%20%20%20%20image%3Dimage%2C%0A%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20gpu%3DNone%2C%20%20%23%20add%20a%20GPU%20if%20you%20need%20it!%0A%20%20%20%20)%0A%0Aprint(f%22%F0%9F%8F%96%EF%B8%8F%20%20Sandbox%20ID%3A%20%7Bsandbox.object_id%7D%22)%0A`,lang:`python`});var T=c(w,2);u(T,{id:`communicating-with-a-jupyter-server`,children:(e,t)=>{l(),i(e,r(`Communicating with a Jupyter server`))},$$slots:{default:!0}});var E=c(T,2);m(c(e(E)),{href:`https://modal.com/docs/reference/modal.Sandbox#tunnels`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),l(),n(E);var D=c(E,2);f(D,{code:`tunnel%20%3D%20sandbox.tunnels()%5BJUPYTER_PORT%5D%0Aurl%20%3D%20f%22%7Btunnel.url%7D%2F%3Ftoken%3D%7Btoken%7D%22%0Aprint(f%22%F0%9F%8F%96%EF%B8%8F%20%20Jupyter%20notebook%20is%20running%20at%3A%20%7Burl%7D%22)%0A`,lang:`python`});var O=c(D,2);m(c(e(O)),{href:`https://jupyter-server.readthedocs.io/en/latest/developers/rest-api.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`REST API`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);f(k,{code:`def%20is_jupyter_up()%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20response%20%3D%20urllib.request.urlopen(f%22%7Btunnel.url%7D%2Fapi%2Fstatus%3Ftoken%3D%7Btoken%7D%22)%0A%20%20%20%20%20%20%20%20if%20response.getcode()%20%3D%3D%20200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20json.loads(response.read().decode())%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20data.get(%22started%22%2C%20False)%0A%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%20%20%20%20return%20False%0A%0A`,lang:`python`});var A=c(k,4);f(A,{code:`timeout%20%3D%2060%20%20%23%20seconds%0Astart_time%20%3D%20time.time()%0Awhile%20time.time()%20-%20start_time%20%3C%20timeout%3A%0A%20%20%20%20if%20is_jupyter_up()%3A%0A%20%20%20%20%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Jupyter%20is%20up%20and%20running!%22)%0A%20%20%20%20%20%20%20%20break%0A%20%20%20%20time.sleep(1)%0Aelse%3A%0A%20%20%20%20print(%22%F0%9F%8F%96%EF%B8%8F%20%20Timed%20out%20waiting%20for%20Jupyter%20to%20start.%22)%0A%0A`,lang:`python`});var j=c(A,4);m(c(e(j)),{href:`https://modal.com/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(3),n(j),i(t,o)},$$slots:{default:!0}}))}export{x as default,h as metadata};
//# sourceMappingURL=DkxONER2.js.map
