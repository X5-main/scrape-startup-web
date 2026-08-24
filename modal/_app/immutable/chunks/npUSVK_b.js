(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`22aa22d0-0098-4c62-993f-725cccd36eba`,e._sentryDebugIdIdentifier=`sentry-dbid-22aa22d0-0098-4c62-993f-725cccd36eba`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Watch a Browser Use agent drive Chromium over VNC`,id:`watch-a-browser-use-agent-drive-chromium-over-vnc`,children:[{depth:2,value:`Run the example`,id:`run-the-example`},{depth:2,value:`Set up`,id:`set-up`},{depth:2,value:`Set up a shareable virtual desktop`,id:`set-up-a-shareable-virtual-desktop`},{depth:2,value:`Driving the browser with an agent loop`,id:`driving-the-browser-with-an-agent-loop`},{depth:2,value:`Creating the shared Endpoint`,id:`creating-the-shared-endpoint`},{depth:2,value:`Running the agent`,id:`running-the-agent`},{depth:2,value:`Serve the web UI`,id:`serve-the-web-ui`},{depth:2,value:`Test the session API`,id:`test-the-session-api`},{depth:2,value:`Cleaning up`,id:`cleaning-up`}]}],rawContent:`# Watch a Browser Use agent drive Chromium over VNC

Computer-use agents are LLMs that can interact with a web browser in a loop.
Rather than calling a fixed set of APIs, they look at a rendered page or screen,
decide what to click or type next, take that action, and look again.

This example builds one with [Browser Use](https://docs.browser-use.com/).
An open-weights model served from a Modal
[Endpoint](https://modal.com/docs/guide/endpoints) powers the agent. The agent
drives Chromium inside a Modal
[VM Sandbox](https://modal.com/docs/guide/vm-sandboxes),
while a small web UI embeds a noVNC desktop so you can watch it work in real-time.

## Run the example

To programmatically test the example:

\`\`\`bash
modal run 13_sandboxes/cua/computer_use_vnc.py
\`\`\`

You can also start the interactive UI:

\`\`\`bash
modal serve 13_sandboxes/cua/computer_use_vnc.py
\`\`\`

## Set up

\`\`\`python
import asyncio
import json
import subprocess
import sys
import textwrap
import time
import urllib.request
from pathlib import Path

import fastapi
import modal
from fastapi.responses import HTMLResponse

app = modal.App("example-computer-use-vnc")
MINUTES = 60

\`\`\`

We could point Browser Use at a hosted provider like OpenAI or Anthropic using
your API key. For our purposes, however, we serve an open-weights model
ourselves via a Modal [Endpoint](https://modal.com/docs/guide/endpoints).
It takes one command to create an OpenAI-compatible server for the agent to
call. No external API key is needed, and the whole demo runs on Modal.

\`\`\`python
ENDPOINT_MODEL = "Qwen/Qwen3.6-27B-FP8"
ENDPOINT_NAME = "example-computer-use-vnc"
ENDPOINT_ROUTING_REGION = "us-west"
ENDPOINT_WARMUP_TIME = 5 * MINUTES
endpoint_server = modal.Server.from_name(f"ep-{ENDPOINT_NAME}", "Server")

VNC_PORT = 6080
SESSION_START_TIMEOUT = 2 * MINUTES
SANDBOX_TIMEOUT = 60 * MINUTES

PAGE_PATH = Path(__file__).parent / "computer_use_vnc.html"
PAGE_REMOTE = "/root/computer_use_vnc.html"
RESULT_PREFIX = "__BROWSER_USE_RESULT__="
DESKTOP_READY_PATH = "/tmp/desktop_ready"

\`\`\`

## Set up a shareable virtual desktop

By default, Browser Use launches Chromium headless. However, we want to watch the
browser in real time. In each Sandbox, Xvfb provides a virtual display,
x11vnc serves it over VNC, and websockify bridges the stream into the noVNC
page that the UI embeds.

\`\`\`python
base_image = modal.Image.debian_slim(python_version="3.12")
web_image = base_image.uv_pip_install("fastapi[standard]==0.139.2").add_local_file(
    PAGE_PATH, remote_path=PAGE_REMOTE
)
sandbox_image = (
    base_image.apt_install("novnc", "websockify", "x11vnc", "xvfb")
    .uv_pip_install("browser-use==0.13.6", "playwright==1.61.0")
    .run_commands("playwright install --with-deps chromium")
)

SANDBOX_COMMAND = textwrap.dedent(
    """
    set -euo pipefail
    export DISPLAY=:99
    Xvfb :99 -screen 0 1280x720x24 >/tmp/xvfb.log 2>&1 &
    sleep 1
    x11vnc -display :99 -forever -shared -nopw -listen 0.0.0.0 -rfbport 5900 -xkb >/tmp/x11vnc.log 2>&1 &
    websockify --web=/usr/share/novnc/ 6080 localhost:5900 >/tmp/websockify.log 2>&1 &
    exec python -c "$AGENT_SCRIPT"
    """
).strip()

\`\`\`

## Driving the browser with an agent loop

The agent loop is the core of the agent. At each step, it looks at the current
page, picks an action such as click, type, or navigate, and executes it with
Browser Use. The loop repeats until the model decides the task is done.

\`\`\`python
AGENT_SCRIPT = textwrap.dedent(
    """
    import asyncio
    import json
    import os
    import time
    import urllib.parse
    import urllib.request
    from pathlib import Path

    from browser_use import Agent, Browser, ChatOpenAI, Tools

    model = os.environ["ENDPOINT_MODEL"]
    base_url = os.environ["ENDPOINT_BASE_URL"]
    start_page = "data:text/html," + urllib.parse.quote(
        "<body style='margin:0;background:#222;color:#ddd;font:28px system-ui;"
        "display:grid;place-items:center;height:100vh'>Starting desktop...</body>"
    )


    def wait_for_endpoint() -> None:
        deadline = time.monotonic() + int(os.environ["ENDPOINT_WARMUP_TIME"])
        while True:
            try:
                urllib.request.urlopen(f"{base_url}/health", timeout=5).close()
                return
            except Exception:
                pass
            if time.monotonic() >= deadline:
                raise TimeoutError("Timed out waiting for the model Endpoint.")
            time.sleep(1)


    async def main() -> None:
        browser = Browser(
            headless=False,
            window_size={"width": 1280, "height": 720},
            chromium_sandbox=False,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        )
        await browser.start()
        await browser.navigate_to(start_page)
        Path(os.environ["DESKTOP_READY_PATH"]).write_text("1", encoding="utf-8")
        await asyncio.to_thread(wait_for_endpoint)
        llm = ChatOpenAI(
            model=model,
            api_key="unused",
            base_url=f"{base_url}/v1",
            reasoning_effort="none",
            reasoning_models=[model],
            timeout=3 * 60,
        )
        agent = Agent(
            task=os.environ["AGENT_TASK"],
            llm=llm,
            tools=Tools(),
            browser=browser,
            use_thinking=False,
            llm_timeout=3 * 60,
        )
        history = await agent.run()
        result = history.final_result() or "Agent stopped without a final result."
        print(os.environ["RESULT_PREFIX"] + json.dumps(result), flush=True)


    asyncio.run(main())
    """
).strip()

\`\`\`

## Creating the shared Endpoint

The Endpoint can take time to become ready because its containers scale to zero.
Startup waits in two places:
1. \`start_session\` waits for a new Endpoint to register its Server and expose a URL.
2. The Sandbox waits until the endpoint is ready before starting the agent.

\`\`\`python
def create_endpoint_if_missing() -> None:
    command = [sys.executable, "-m", "modal", "endpoint"]
    endpoints = json.loads(
        subprocess.check_output([*command, "list", "--json"], text=True)
    )
    if any(endpoint["name"] == ENDPOINT_NAME for endpoint in endpoints):
        print(f"Using existing Endpoint {ENDPOINT_NAME!r}.")
        return
    subprocess.run(
        [
            *command,
            "create",
            "--name",
            ENDPOINT_NAME,
            "--model",
            ENDPOINT_MODEL,
            "--routing-region",
            ENDPOINT_ROUTING_REGION,
            "--unauthenticated",
        ],
        check=True,
    )
    print(f"Created Endpoint {ENDPOINT_NAME!r}.")


async def wait_for_endpoint_url(deadline: float) -> str:
    while True:
        try:
            url = await endpoint_server.get_url.aio()
        except modal.exception.NotFoundError:
            url = None
        if url:
            return url
        if time.monotonic() >= deadline:
            raise TimeoutError(f"Timed out waiting for Endpoint {ENDPOINT_NAME!r}.")
        await asyncio.sleep(1)


def is_server_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            return response.status == 200
    except Exception:
        return False


\`\`\`

## Running the agent

A request from the UI creates one Sandbox for one task. Its entrypoint starts
the virtual desktop, paints Chromium, then runs Browser Use. \`start_session\`
waits until the desktop-ready marker exists and the noVNC page responds, then
returns the Sandbox ID and watch URL.

The browser embeds that URL and polls the status route with the ID. When the
agent exits, the Sandbox terminates and the status route returns its final
result. A failed startup terminates the Sandbox before returning the error.

\`\`\`python
@app.function(image=web_image, timeout=SESSION_START_TIMEOUT + 30)
async def start_session(task: str):
    sandbox = None
    try:
        deadline = time.monotonic() + SESSION_START_TIMEOUT
        await asyncio.to_thread(create_endpoint_if_missing)
        endpoint_url = await wait_for_endpoint_url(deadline)
        sandbox = await modal.Sandbox.create.aio(
            "bash",
            "-lc",
            SANDBOX_COMMAND,
            app=app,
            image=sandbox_image,
            experimental_options={"vm_runtime": True},
            env={
                "AGENT_SCRIPT": AGENT_SCRIPT,
                "AGENT_TASK": task,
                "DESKTOP_READY_PATH": DESKTOP_READY_PATH,
                "ENDPOINT_BASE_URL": endpoint_url,
                "ENDPOINT_MODEL": ENDPOINT_MODEL,
                "ENDPOINT_WARMUP_TIME": str(ENDPOINT_WARMUP_TIME),
                "RESULT_PREFIX": RESULT_PREFIX,
            },
            encrypted_ports=[VNC_PORT],
            timeout=SANDBOX_TIMEOUT,
            readiness_probe=modal.Probe.with_exec("test", "-f", DESKTOP_READY_PATH),
        )
        remaining = max(1, int(deadline - time.monotonic()))
        await sandbox.wait_until_ready.aio(timeout=remaining)
        remaining = max(1, int(deadline - time.monotonic()))
        tunnel = (await sandbox.tunnels.aio(timeout=remaining))[VNC_PORT]
        watch_url = (
            f"{tunnel.url.rstrip('/')}/vnc.html?autoconnect=1&resize=scale&reconnect=1"
        )
        while not is_server_up(watch_url):
            if time.monotonic() >= deadline:
                raise TimeoutError("Timed out waiting for noVNC.")
            await asyncio.sleep(1)
        return {"sandbox_id": sandbox.object_id, "watch_url": watch_url}
    except Exception:
        if sandbox is not None:
            await sandbox.terminate.aio()
        raise
    finally:
        if sandbox is not None:
            await sandbox.detach.aio()


\`\`\`

## Serve the web UI

The code below is a simple FastAPI app that serves the web UI and the API.

\`\`\`python
web_app = fastapi.FastAPI()


@web_app.get("/")
async def index():
    return HTMLResponse(Path(PAGE_REMOTE).read_text())


@web_app.post("/api/session")
async def create_session(body: dict):
    task = str(body.get("task", "")).strip()
    if not task:
        raise fastapi.HTTPException(status_code=400, detail="Task must not be empty.")
    try:
        return await start_session.remote.aio(task)
    except Exception as exc:
        raise fastapi.HTTPException(500, f"Starting Sandbox: {exc}") from exc


@web_app.get("/api/session/{sandbox_id}")
async def session_status(sandbox_id: str):
    try:
        sandbox = await modal.Sandbox.from_id.aio(sandbox_id)
    except modal.exception.NotFoundError as exc:
        raise fastapi.HTTPException(404, "Session not found.") from exc

    try:
        returncode = await sandbox.poll.aio()
        if returncode is None:
            return {"state": "running"}
        stdout = await sandbox.stdout.read.aio()
        stderr = await sandbox.stderr.read.aio()
    finally:
        await sandbox.detach.aio()

    if returncode == 0:
        result = None
        for line in reversed(stdout.splitlines()):
            if line.startswith(RESULT_PREFIX):
                result = json.loads(line.removeprefix(RESULT_PREFIX))
                break
        if result is None:
            result = "Agent finished without a result."
        return {"state": "succeeded", "result": result}
    message = (stderr or stdout).strip()[-4000:]
    return {
        "state": "failed",
        "result": message or f"Agent exited with code {returncode}.",
    }


@app.function(image=web_image)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def web():
    return web_app


\`\`\`

## Test the session API

We can test this example programmatically without the web UI.
The entrypoint below hits \`POST /api/session\` on the ephemeral web App,
asserts the Sandbox and noVNC URL came back,
checks that \`GET /api/session/{id}\` reports a live session, and
terminates the Sandbox.

\`\`\`python
@app.local_entrypoint()
def test_session(
    task: str = "Open https://example.com and report the page title in one line.",
):
    url: str | None = web.get_web_url()
    if not url:
        raise RuntimeError("web App has no URL.")
    print(f"web url: {url}")

    payload = json.dumps({"task": task}).encode()
    request = urllib.request.Request(
        f"{url.rstrip('/')}/api/session",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(
        request, timeout=SESSION_START_TIMEOUT + 60
    ) as response:
        session = json.loads(response.read().decode())

    sandbox_id = session.get("sandbox_id")
    watch_url = session.get("watch_url")
    if not sandbox_id or not watch_url:
        raise RuntimeError(f"Session response missing fields: {session}")
    print(f"sandbox_id={sandbox_id}")
    print(f"watch_url={watch_url}")

    if not is_server_up(watch_url):
        raise RuntimeError(f"noVNC not reachable at {watch_url}")

    status_url = f"{url.rstrip('/')}/api/session/{sandbox_id}"
    with urllib.request.urlopen(status_url, timeout=30) as response:
        status = json.loads(response.read().decode())
    print(f"status={status}")
    if status.get("state") not in ("running", "succeeded"):
        raise RuntimeError(f"Unexpected session state: {status}")

    sandbox = modal.Sandbox.from_id(sandbox_id)
    try:
        sandbox.terminate()
    finally:
        sandbox.detach()
    print("session start ok")


\`\`\`

## Cleaning up

Each Sandbox uses the agent process as its entrypoint, so it stops when the
task finishes or its timeout expires. Startup failures terminate it
immediately, and every code path detaches its local Sandbox handle.
\`test_session\` also terminates the Sandbox after the API check.

Stop \`modal serve\` with \`Ctrl-C\`. The shared Endpoint scales to zero when idle,
but remains available for later prompts. Shut it down when you are done:

\`\`\`bash
modal endpoint stop example-computer-use-vnc
\`\`\`
`,meta:{title:`Watch a Browser Use agent drive Chromium over VNC`,description:`Computer-use agents are LLMs that can interact with a web browser in a loop. Rather than calling a fixed set of APIs, they look at a rendered page or screen, decide what to click or type next, take that action, and look again.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<!> <p>Computer-use agents are LLMs that can interact with a web browser in a loop.
Rather than calling a fixed set of APIs, they look at a rendered page or screen,
decide what to click or type next, take that action, and look again.</p> <p>This example builds one with <!>.
An open-weights model served from a Modal <!> powers the agent. The agent
drives Chromium inside a Modal <!>,
while a small web UI embeds a noVNC desktop so you can watch it work in real-time.</p> <!> <p>To programmatically test the example:</p> <!> <p>You can also start the interactive UI:</p> <!> <!> <!> <p>We could point Browser Use at a hosted provider like OpenAI or Anthropic using
your API key. For our purposes, however, we serve an open-weights model
ourselves via a Modal <!>.
It takes one command to create an OpenAI-compatible server for the agent to
call. No external API key is needed, and the whole demo runs on Modal.</p> <!> <!> <p>By default, Browser Use launches Chromium headless. However, we want to watch the
browser in real time. In each Sandbox, Xvfb provides a virtual display,
x11vnc serves it over VNC, and websockify bridges the stream into the noVNC
page that the UI embeds.</p> <!> <!> <p>The agent loop is the core of the agent. At each step, it looks at the current
page, picks an action such as click, type, or navigate, and executes it with
Browser Use. The loop repeats until the model decides the task is done.</p> <!> <!> <p>The Endpoint can take time to become ready because its containers scale to zero.
Startup waits in two places:</p> <ol><li><code>start_session</code> waits for a new Endpoint to register its Server and expose a URL.</li> <li>The Sandbox waits until the endpoint is ready before starting the agent.</li></ol> <!> <!> <p>A request from the UI creates one Sandbox for one task. Its entrypoint starts
the virtual desktop, paints Chromium, then runs Browser Use. <code>start_session</code> waits until the desktop-ready marker exists and the noVNC page responds, then
returns the Sandbox ID and watch URL.</p> <p>The browser embeds that URL and polls the status route with the ID. When the
agent exits, the Sandbox terminates and the status route returns its final
result. A failed startup terminates the Sandbox before returning the error.</p> <!> <!> <p>The code below is a simple FastAPI app that serves the web UI and the API.</p> <!> <!> <p>We can test this example programmatically without the web UI.
The entrypoint below hits <code>POST /api/session</code> on the ephemeral web App,
asserts the Sandbox and noVNC URL came back,
checks that <code>GET /api/session/&#123;id&#125;</code> reports a live session, and
terminates the Sandbox.</p> <!> <!> <p>Each Sandbox uses the agent process as its entrypoint, so it stops when the
task finishes or its timeout expires. Startup failures terminate it
immediately, and every code path detaches its local Sandbox handle. <code>test_session</code> also terminates the Sandbox after the API check.</p> <p>Stop <code>modal serve</code> with <code>Ctrl-C</code>. The shared Endpoint scales to zero when idle,
but remains available for later prompts. Shut it down when you are done:</p> <!>`,1);function b(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=y(),p=s(o);d(p,{id:`watch-a-browser-use-agent-drive-chromium-over-vnc`,children:(e,t)=>{l(),i(e,r(`Watch a Browser Use agent drive Chromium over VNC`))},$$slots:{default:!0}});var h=c(p,4),g=c(e(h));m(g,{href:`https://docs.browser-use.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Browser Use`))},$$slots:{default:!0}});var _=c(g,2);m(_,{href:`https://modal.com/docs/guide/endpoints`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Endpoint`))},$$slots:{default:!0}}),m(c(_,2),{href:`https://modal.com/docs/guide/vm-sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`VM Sandbox`))},$$slots:{default:!0}}),l(),n(h);var v=c(h,2);u(v,{id:`run-the-example`,children:(e,t)=>{l(),i(e,r(`Run the example`))},$$slots:{default:!0}});var b=c(v,4);f(b,{code:`modal%20run%2013_sandboxes%2Fcua%2Fcomputer_use_vnc.py`,lang:`bash`});var x=c(b,4);f(x,{code:`modal%20serve%2013_sandboxes%2Fcua%2Fcomputer_use_vnc.py`,lang:`bash`});var S=c(x,2);u(S,{id:`set-up`,children:(e,t)=>{l(),i(e,r(`Set up`))},$$slots:{default:!0}});var C=c(S,2);f(C,{code:`import%20asyncio%0Aimport%20json%0Aimport%20subprocess%0Aimport%20sys%0Aimport%20textwrap%0Aimport%20time%0Aimport%20urllib.request%0Afrom%20pathlib%20import%20Path%0A%0Aimport%20fastapi%0Aimport%20modal%0Afrom%20fastapi.responses%20import%20HTMLResponse%0A%0Aapp%20%3D%20modal.App(%22example-computer-use-vnc%22)%0AMINUTES%20%3D%2060%0A`,lang:`python`});var w=c(C,2);m(c(e(w)),{href:`https://modal.com/docs/guide/endpoints`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Endpoint`))},$$slots:{default:!0}}),l(),n(w);var T=c(w,2);f(T,{code:`ENDPOINT_MODEL%20%3D%20%22Qwen%2FQwen3.6-27B-FP8%22%0AENDPOINT_NAME%20%3D%20%22example-computer-use-vnc%22%0AENDPOINT_ROUTING_REGION%20%3D%20%22us-west%22%0AENDPOINT_WARMUP_TIME%20%3D%205%20*%20MINUTES%0Aendpoint_server%20%3D%20modal.Server.from_name(f%22ep-%7BENDPOINT_NAME%7D%22%2C%20%22Server%22)%0A%0AVNC_PORT%20%3D%206080%0ASESSION_START_TIMEOUT%20%3D%202%20*%20MINUTES%0ASANDBOX_TIMEOUT%20%3D%2060%20*%20MINUTES%0A%0APAGE_PATH%20%3D%20Path(__file__).parent%20%2F%20%22computer_use_vnc.html%22%0APAGE_REMOTE%20%3D%20%22%2Froot%2Fcomputer_use_vnc.html%22%0ARESULT_PREFIX%20%3D%20%22__BROWSER_USE_RESULT__%3D%22%0ADESKTOP_READY_PATH%20%3D%20%22%2Ftmp%2Fdesktop_ready%22%0A`,lang:`python`});var E=c(T,2);u(E,{id:`set-up-a-shareable-virtual-desktop`,children:(e,t)=>{l(),i(e,r(`Set up a shareable virtual desktop`))},$$slots:{default:!0}});var D=c(E,4);f(D,{code:`base_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22)%0Aweb_image%20%3D%20base_image.uv_pip_install(%22fastapi%5Bstandard%5D%3D%3D0.139.2%22).add_local_file(%0A%20%20%20%20PAGE_PATH%2C%20remote_path%3DPAGE_REMOTE%0A)%0Asandbox_image%20%3D%20(%0A%20%20%20%20base_image.apt_install(%22novnc%22%2C%20%22websockify%22%2C%20%22x11vnc%22%2C%20%22xvfb%22)%0A%20%20%20%20.uv_pip_install(%22browser-use%3D%3D0.13.6%22%2C%20%22playwright%3D%3D1.61.0%22)%0A%20%20%20%20.run_commands(%22playwright%20install%20--with-deps%20chromium%22)%0A)%0A%0ASANDBOX_COMMAND%20%3D%20textwrap.dedent(%0A%20%20%20%20%22%22%22%0A%20%20%20%20set%20-euo%20pipefail%0A%20%20%20%20export%20DISPLAY%3D%3A99%0A%20%20%20%20Xvfb%20%3A99%20-screen%200%201280x720x24%20%3E%2Ftmp%2Fxvfb.log%202%3E%261%20%26%0A%20%20%20%20sleep%201%0A%20%20%20%20x11vnc%20-display%20%3A99%20-forever%20-shared%20-nopw%20-listen%200.0.0.0%20-rfbport%205900%20-xkb%20%3E%2Ftmp%2Fx11vnc.log%202%3E%261%20%26%0A%20%20%20%20websockify%20--web%3D%2Fusr%2Fshare%2Fnovnc%2F%206080%20localhost%3A5900%20%3E%2Ftmp%2Fwebsockify.log%202%3E%261%20%26%0A%20%20%20%20exec%20python%20-c%20%22%24AGENT_SCRIPT%22%0A%20%20%20%20%22%22%22%0A).strip()%0A`,lang:`python`});var O=c(D,2);u(O,{id:`driving-the-browser-with-an-agent-loop`,children:(e,t)=>{l(),i(e,r(`Driving the browser with an agent loop`))},$$slots:{default:!0}});var k=c(O,4);f(k,{code:`AGENT_SCRIPT%20%3D%20textwrap.dedent(%0A%20%20%20%20%22%22%22%0A%20%20%20%20import%20asyncio%0A%20%20%20%20import%20json%0A%20%20%20%20import%20os%0A%20%20%20%20import%20time%0A%20%20%20%20import%20urllib.parse%0A%20%20%20%20import%20urllib.request%0A%20%20%20%20from%20pathlib%20import%20Path%0A%0A%20%20%20%20from%20browser_use%20import%20Agent%2C%20Browser%2C%20ChatOpenAI%2C%20Tools%0A%0A%20%20%20%20model%20%3D%20os.environ%5B%22ENDPOINT_MODEL%22%5D%0A%20%20%20%20base_url%20%3D%20os.environ%5B%22ENDPOINT_BASE_URL%22%5D%0A%20%20%20%20start_page%20%3D%20%22data%3Atext%2Fhtml%2C%22%20%2B%20urllib.parse.quote(%0A%20%20%20%20%20%20%20%20%22%3Cbody%20style%3D'margin%3A0%3Bbackground%3A%23222%3Bcolor%3A%23ddd%3Bfont%3A28px%20system-ui%3B%22%0A%20%20%20%20%20%20%20%20%22display%3Agrid%3Bplace-items%3Acenter%3Bheight%3A100vh'%3EStarting%20desktop...%3C%2Fbody%3E%22%0A%20%20%20%20)%0A%0A%0A%20%20%20%20def%20wait_for_endpoint()%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20int(os.environ%5B%22ENDPOINT_WARMUP_TIME%22%5D)%0A%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20urllib.request.urlopen(f%22%7Bbase_url%7D%2Fhealth%22%2C%20timeout%3D5).close()%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20TimeoutError(%22Timed%20out%20waiting%20for%20the%20model%20Endpoint.%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20time.sleep(1)%0A%0A%0A%20%20%20%20async%20def%20main()%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20browser%20%3D%20Browser(%0A%20%20%20%20%20%20%20%20%20%20%20%20headless%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20window_size%3D%7B%22width%22%3A%201280%2C%20%22height%22%3A%20720%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20chromium_sandbox%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20args%3D%5B%22--no-sandbox%22%2C%20%22--disable-gpu%22%2C%20%22--disable-dev-shm-usage%22%5D%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20await%20browser.start()%0A%20%20%20%20%20%20%20%20await%20browser.navigate_to(start_page)%0A%20%20%20%20%20%20%20%20Path(os.environ%5B%22DESKTOP_READY_PATH%22%5D).write_text(%221%22%2C%20encoding%3D%22utf-8%22)%0A%20%20%20%20%20%20%20%20await%20asyncio.to_thread(wait_for_endpoint)%0A%20%20%20%20%20%20%20%20llm%20%3D%20ChatOpenAI(%0A%20%20%20%20%20%20%20%20%20%20%20%20model%3Dmodel%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20api_key%3D%22unused%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20base_url%3Df%22%7Bbase_url%7D%2Fv1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20reasoning_effort%3D%22none%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20reasoning_models%3D%5Bmodel%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3D3%20*%2060%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20agent%20%3D%20Agent(%0A%20%20%20%20%20%20%20%20%20%20%20%20task%3Dos.environ%5B%22AGENT_TASK%22%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20llm%3Dllm%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20tools%3DTools()%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20browser%3Dbrowser%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20use_thinking%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20llm_timeout%3D3%20*%2060%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20history%20%3D%20await%20agent.run()%0A%20%20%20%20%20%20%20%20result%20%3D%20history.final_result()%20or%20%22Agent%20stopped%20without%20a%20final%20result.%22%0A%20%20%20%20%20%20%20%20print(os.environ%5B%22RESULT_PREFIX%22%5D%20%2B%20json.dumps(result)%2C%20flush%3DTrue)%0A%0A%0A%20%20%20%20asyncio.run(main())%0A%20%20%20%20%22%22%22%0A).strip()%0A`,lang:`python`});var A=c(k,2);u(A,{id:`creating-the-shared-endpoint`,children:(e,t)=>{l(),i(e,r(`Creating the shared Endpoint`))},$$slots:{default:!0}});var j=c(A,6);f(j,{code:`def%20create_endpoint_if_missing()%20-%3E%20None%3A%0A%20%20%20%20command%20%3D%20%5Bsys.executable%2C%20%22-m%22%2C%20%22modal%22%2C%20%22endpoint%22%5D%0A%20%20%20%20endpoints%20%3D%20json.loads(%0A%20%20%20%20%20%20%20%20subprocess.check_output(%5B*command%2C%20%22list%22%2C%20%22--json%22%5D%2C%20text%3DTrue)%0A%20%20%20%20)%0A%20%20%20%20if%20any(endpoint%5B%22name%22%5D%20%3D%3D%20ENDPOINT_NAME%20for%20endpoint%20in%20endpoints)%3A%0A%20%20%20%20%20%20%20%20print(f%22Using%20existing%20Endpoint%20%7BENDPOINT_NAME!r%7D.%22)%0A%20%20%20%20%20%20%20%20return%0A%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20*command%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22create%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20ENDPOINT_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--model%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20ENDPOINT_MODEL%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--routing-region%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20ENDPOINT_ROUTING_REGION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--unauthenticated%22%2C%0A%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20check%3DTrue%2C%0A%20%20%20%20)%0A%20%20%20%20print(f%22Created%20Endpoint%20%7BENDPOINT_NAME!r%7D.%22)%0A%0A%0Aasync%20def%20wait_for_endpoint_url(deadline%3A%20float)%20-%3E%20str%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20await%20endpoint_server.get_url.aio()%0A%20%20%20%20%20%20%20%20except%20modal.exception.NotFoundError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20None%0A%20%20%20%20%20%20%20%20if%20url%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20url%0A%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20raise%20TimeoutError(f%22Timed%20out%20waiting%20for%20Endpoint%20%7BENDPOINT_NAME!r%7D.%22)%0A%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%0A%0Adef%20is_server_up(url%3A%20str)%20-%3E%20bool%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20with%20urllib.request.urlopen(url%2C%20timeout%3D5)%20as%20response%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20response.status%20%3D%3D%20200%0A%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A`,lang:`python`});var M=c(j,2);u(M,{id:`running-the-agent`,children:(e,t)=>{l(),i(e,r(`Running the agent`))},$$slots:{default:!0}});var N=c(M,6);f(N,{code:`%40app.function(image%3Dweb_image%2C%20timeout%3DSESSION_START_TIMEOUT%20%2B%2030)%0Aasync%20def%20start_session(task%3A%20str)%3A%0A%20%20%20%20sandbox%20%3D%20None%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20deadline%20%3D%20time.monotonic()%20%2B%20SESSION_START_TIMEOUT%0A%20%20%20%20%20%20%20%20await%20asyncio.to_thread(create_endpoint_if_missing)%0A%20%20%20%20%20%20%20%20endpoint_url%20%3D%20await%20wait_for_endpoint_url(deadline)%0A%20%20%20%20%20%20%20%20sandbox%20%3D%20await%20modal.Sandbox.create.aio(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22bash%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22-lc%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20SANDBOX_COMMAND%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20app%3Dapp%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20image%3Dsandbox_image%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20experimental_options%3D%7B%22vm_runtime%22%3A%20True%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20env%3D%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22AGENT_SCRIPT%22%3A%20AGENT_SCRIPT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22AGENT_TASK%22%3A%20task%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22DESKTOP_READY_PATH%22%3A%20DESKTOP_READY_PATH%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ENDPOINT_BASE_URL%22%3A%20endpoint_url%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ENDPOINT_MODEL%22%3A%20ENDPOINT_MODEL%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ENDPOINT_WARMUP_TIME%22%3A%20str(ENDPOINT_WARMUP_TIME)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22RESULT_PREFIX%22%3A%20RESULT_PREFIX%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20encrypted_ports%3D%5BVNC_PORT%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20timeout%3DSANDBOX_TIMEOUT%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20readiness_probe%3Dmodal.Probe.with_exec(%22test%22%2C%20%22-f%22%2C%20DESKTOP_READY_PATH)%2C%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20remaining%20%3D%20max(1%2C%20int(deadline%20-%20time.monotonic()))%0A%20%20%20%20%20%20%20%20await%20sandbox.wait_until_ready.aio(timeout%3Dremaining)%0A%20%20%20%20%20%20%20%20remaining%20%3D%20max(1%2C%20int(deadline%20-%20time.monotonic()))%0A%20%20%20%20%20%20%20%20tunnel%20%3D%20(await%20sandbox.tunnels.aio(timeout%3Dremaining))%5BVNC_PORT%5D%0A%20%20%20%20%20%20%20%20watch_url%20%3D%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Btunnel.url.rstrip('%2F')%7D%2Fvnc.html%3Fautoconnect%3D1%26resize%3Dscale%26reconnect%3D1%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20while%20not%20is_server_up(watch_url)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20time.monotonic()%20%3E%3D%20deadline%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20raise%20TimeoutError(%22Timed%20out%20waiting%20for%20noVNC.%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20asyncio.sleep(1)%0A%20%20%20%20%20%20%20%20return%20%7B%22sandbox_id%22%3A%20sandbox.object_id%2C%20%22watch_url%22%3A%20watch_url%7D%0A%20%20%20%20except%20Exception%3A%0A%20%20%20%20%20%20%20%20if%20sandbox%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20sandbox.terminate.aio()%0A%20%20%20%20%20%20%20%20raise%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20if%20sandbox%20is%20not%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20await%20sandbox.detach.aio()%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`serve-the-web-ui`,children:(e,t)=>{l(),i(e,r(`Serve the web UI`))},$$slots:{default:!0}});var F=c(P,4);f(F,{code:`web_app%20%3D%20fastapi.FastAPI()%0A%0A%0A%40web_app.get(%22%2F%22)%0Aasync%20def%20index()%3A%0A%20%20%20%20return%20HTMLResponse(Path(PAGE_REMOTE).read_text())%0A%0A%0A%40web_app.post(%22%2Fapi%2Fsession%22)%0Aasync%20def%20create_session(body%3A%20dict)%3A%0A%20%20%20%20task%20%3D%20str(body.get(%22task%22%2C%20%22%22)).strip()%0A%20%20%20%20if%20not%20task%3A%0A%20%20%20%20%20%20%20%20raise%20fastapi.HTTPException(status_code%3D400%2C%20detail%3D%22Task%20must%20not%20be%20empty.%22)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20return%20await%20start_session.remote.aio(task)%0A%20%20%20%20except%20Exception%20as%20exc%3A%0A%20%20%20%20%20%20%20%20raise%20fastapi.HTTPException(500%2C%20f%22Starting%20Sandbox%3A%20%7Bexc%7D%22)%20from%20exc%0A%0A%0A%40web_app.get(%22%2Fapi%2Fsession%2F%7Bsandbox_id%7D%22)%0Aasync%20def%20session_status(sandbox_id%3A%20str)%3A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20sandbox%20%3D%20await%20modal.Sandbox.from_id.aio(sandbox_id)%0A%20%20%20%20except%20modal.exception.NotFoundError%20as%20exc%3A%0A%20%20%20%20%20%20%20%20raise%20fastapi.HTTPException(404%2C%20%22Session%20not%20found.%22)%20from%20exc%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20returncode%20%3D%20await%20sandbox.poll.aio()%0A%20%20%20%20%20%20%20%20if%20returncode%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20%7B%22state%22%3A%20%22running%22%7D%0A%20%20%20%20%20%20%20%20stdout%20%3D%20await%20sandbox.stdout.read.aio()%0A%20%20%20%20%20%20%20%20stderr%20%3D%20await%20sandbox.stderr.read.aio()%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20await%20sandbox.detach.aio()%0A%0A%20%20%20%20if%20returncode%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20None%0A%20%20%20%20%20%20%20%20for%20line%20in%20reversed(stdout.splitlines())%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20line.startswith(RESULT_PREFIX)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20json.loads(line.removeprefix(RESULT_PREFIX))%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20if%20result%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20result%20%3D%20%22Agent%20finished%20without%20a%20result.%22%0A%20%20%20%20%20%20%20%20return%20%7B%22state%22%3A%20%22succeeded%22%2C%20%22result%22%3A%20result%7D%0A%20%20%20%20message%20%3D%20(stderr%20or%20stdout).strip()%5B-4000%3A%5D%0A%20%20%20%20return%20%7B%0A%20%20%20%20%20%20%20%20%22state%22%3A%20%22failed%22%2C%0A%20%20%20%20%20%20%20%20%22result%22%3A%20message%20or%20f%22Agent%20exited%20with%20code%20%7Breturncode%7D.%22%2C%0A%20%20%20%20%7D%0A%0A%0A%40app.function(image%3Dweb_image)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20web()%3A%0A%20%20%20%20return%20web_app%0A%0A`,lang:`python`});var I=c(F,2);u(I,{id:`test-the-session-api`,children:(e,t)=>{l(),i(e,r(`Test the session API`))},$$slots:{default:!0}});var L=c(I,4);f(L,{code:`%40app.local_entrypoint()%0Adef%20test_session(%0A%20%20%20%20task%3A%20str%20%3D%20%22Open%20https%3A%2F%2Fexample.com%20and%20report%20the%20page%20title%20in%20one%20line.%22%2C%0A)%3A%0A%20%20%20%20url%3A%20str%20%7C%20None%20%3D%20web.get_web_url()%0A%20%20%20%20if%20not%20url%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(%22web%20App%20has%20no%20URL.%22)%0A%20%20%20%20print(f%22web%20url%3A%20%7Burl%7D%22)%0A%0A%20%20%20%20payload%20%3D%20json.dumps(%7B%22task%22%3A%20task%7D).encode()%0A%20%20%20%20request%20%3D%20urllib.request.Request(%0A%20%20%20%20%20%20%20%20f%22%7Burl.rstrip('%2F')%7D%2Fapi%2Fsession%22%2C%0A%20%20%20%20%20%20%20%20data%3Dpayload%2C%0A%20%20%20%20%20%20%20%20headers%3D%7B%22Content-Type%22%3A%20%22application%2Fjson%22%7D%2C%0A%20%20%20%20%20%20%20%20method%3D%22POST%22%2C%0A%20%20%20%20)%0A%20%20%20%20with%20urllib.request.urlopen(%0A%20%20%20%20%20%20%20%20request%2C%20timeout%3DSESSION_START_TIMEOUT%20%2B%2060%0A%20%20%20%20)%20as%20response%3A%0A%20%20%20%20%20%20%20%20session%20%3D%20json.loads(response.read().decode())%0A%0A%20%20%20%20sandbox_id%20%3D%20session.get(%22sandbox_id%22)%0A%20%20%20%20watch_url%20%3D%20session.get(%22watch_url%22)%0A%20%20%20%20if%20not%20sandbox_id%20or%20not%20watch_url%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Session%20response%20missing%20fields%3A%20%7Bsession%7D%22)%0A%20%20%20%20print(f%22sandbox_id%3D%7Bsandbox_id%7D%22)%0A%20%20%20%20print(f%22watch_url%3D%7Bwatch_url%7D%22)%0A%0A%20%20%20%20if%20not%20is_server_up(watch_url)%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22noVNC%20not%20reachable%20at%20%7Bwatch_url%7D%22)%0A%0A%20%20%20%20status_url%20%3D%20f%22%7Burl.rstrip('%2F')%7D%2Fapi%2Fsession%2F%7Bsandbox_id%7D%22%0A%20%20%20%20with%20urllib.request.urlopen(status_url%2C%20timeout%3D30)%20as%20response%3A%0A%20%20%20%20%20%20%20%20status%20%3D%20json.loads(response.read().decode())%0A%20%20%20%20print(f%22status%3D%7Bstatus%7D%22)%0A%20%20%20%20if%20status.get(%22state%22)%20not%20in%20(%22running%22%2C%20%22succeeded%22)%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22Unexpected%20session%20state%3A%20%7Bstatus%7D%22)%0A%0A%20%20%20%20sandbox%20%3D%20modal.Sandbox.from_id(sandbox_id)%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20sandbox.terminate()%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20sandbox.detach()%0A%20%20%20%20print(%22session%20start%20ok%22)%0A%0A`,lang:`python`});var R=c(L,2);u(R,{id:`cleaning-up`,children:(e,t)=>{l(),i(e,r(`Cleaning up`))},$$slots:{default:!0}}),f(c(R,6),{code:`modal%20endpoint%20stop%20example-computer-use-vnc`,lang:`bash`}),i(t,o)},$$slots:{default:!0}}))}export{b as default,h as metadata};
//# sourceMappingURL=npUSVK_b.js.map
