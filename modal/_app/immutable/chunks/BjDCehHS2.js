(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`1409d116-8a34-4371-833d-b4d498238f37`,e._sentryDebugIdIdentifier=`sentry-dbid-1409d116-8a34-4371-833d-b4d498238f37`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Maintain a pool of warm Sandboxes that are healthy and ready to serve requests`,id:`maintain-a-pool-of-warm-sandboxes-that-are-healthy-and-ready-to-serve-requests`,children:[{depth:2,value:`Main implementation`,id:`main-implementation`,children:[{depth:3,value:`Health check`,id:`health-check`},{depth:3,value:`Adding a Sandbox to the pool`,id:`adding-a-sandbox-to-the-pool`},{depth:3,value:`Claiming a Sandbox from the pool`,id:`claiming-a-sandbox-from-the-pool`},{depth:3,value:`Maintaining the pool`,id:`maintaining-the-pool`}]},{depth:2,value:`Local commands for interacting with the pool`,id:`local-commands-for-interacting-with-the-pool`,children:[{depth:3,value:`Deploy the app`,id:`deploy-the-app`},{depth:3,value:`Check the current state of the pool`,id:`check-the-current-state-of-the-pool`},{depth:3,value:`Claiming a Sandbox from the pool and print its URL`,id:`claiming-a-sandbox-from-the-pool-and-print-its-url`},{depth:3,value:`Run a demo of the Sandbox pool.`,id:`run-a-demo-of-the-sandbox-pool`},{depth:3,value:`Clean up`,id:`clean-up`}]}]}],rawContent:`# Maintain a pool of warm Sandboxes that are healthy and ready to serve requests

This example demonstrates how to build a pool of "warm"
[Modal Sandboxes](https://modal.com/docs/guide/sandbox), and deploy a
[Modal Web Function](https://modal.com/docs/guide/webhook-urls) that lets you claim
a Sandbox from the pool, getting a URL to the server running in the Sandbox.

Maintaining a pool of warm Sandboxes is useful for example if your Sandboxes need
to do significant work after being created, like downloading code, installing
dependencies, or running tests, before they are ready to serve requests.

It uses a [Modal Queue](https://modal.com/docs/guide/dicts-and-queues#modal-queues)
to store references to the warm Sandboxes, and functionality to maintain the pool
by adding and removing Sandboxes, checking the current size, etc.

The pool keeps track of the time to live for each Sandbox, and will always return
a Sandbox with enough time left.

Each Sandbox is configured with a
[readiness probe](https://modal.com/docs/guide/sandboxes#readiness-probes) so we can
reliably wait for the server to be ready before adding it to the pool.

It's structured into two Apps:
- \`example-sandbox-pool\` is the main App that contains all the control logic for maintaining
  the pool, exposing ways to claim Sandboxes, etc.
- \`example-sandbox-pool-sandboxes\` houses all the actual Sandboxes, and nothing else.

The implementation borrows from [pawalt](https://github.com/pawalt)'s [Sandbox pool
example gist](https://gist.github.com/pawalt/7a505c38bba75cafae0780a5dd40e8b8). 🙏

\`\`\`python
import argparse
import time
from dataclasses import dataclass
from datetime import datetime

import modal

APP_NAME = "example-sandbox-pool"
SANDBOX_APP_NAME = "example-sandbox-pool-sandboxes"
POOL_QUEUE_NAME = "example-sandbox-pool-queue"

app = modal.App(APP_NAME)

server_image = modal.Image.debian_slim(python_version="3.11").uv_pip_install(
    "fastapi[standard]~=0.115.14",
    "requests~=2.32.4",
)

## Configuration of the pool

\`\`\`

Here we define the image that will be used to run the server that runs in the
Sandbox. In this simple example, we just run the built in Python HTTP server that
returns a directory listing.

\`\`\`python
sandbox_image = modal.Image.debian_slim(python_version="3.11").apt_install("curl")
SANDBOX_SERVER_PORT = 8080
READINESS_PROBE_TIMEOUT_SECONDS = 10

\`\`\`

In this example Sandboxes live for 5 minutes, and we assume that they are used for
2 minutes, meaning that if a Sandbox has less than 2 minutes left it's considered
to be expiring too soon and will be terminated.

You'll want to adjust these values depending on your use case. We don't set
\`idle_timeout\`: pooled Sandboxes are idle by definition, so it would terminate them
before they can be claimed.

\`\`\`python
SANDBOX_TIMEOUT_SECONDS = 5 * 60
SANDBOX_USE_DURATION_SECONDS = 2 * 60
POOL_SIZE = 3
POOL_MAINTENANCE_SCHEDULE = modal.Period(minutes=2)


\`\`\`

## Main implementation

We keep track of all warm Sandboxes in a Modal Queue of \`SandboxReference\` objects.

\`\`\`python
pool_queue = modal.Queue.from_name(POOL_QUEUE_NAME, create_if_missing=True)


\`\`\`

Modal doesn't expose a Sandbox's remaining lifetime, so we track it ourselves.
\`expires_at\` is approximate: it's computed after \`create\` returns, and only
accounts for the wall-clock timeout, not other ways a Sandbox can die.

\`\`\`python
@dataclass
class SandboxReference:
    id: str
    url: str
    expires_at: int


\`\`\`

### Health check

We run a health check to determine 3 types of statuses: readiness
(\`wait_until_ready\`, once at creation), health (\`is_healthy\`, below), and remaining
lifetime (\`expires_at\`, not health at all). \`is_still_good\` combines the last two.

\`is_healthy\` returns false on three types of failures: the Sandbox is gone, the server
crashed, or the Tunnel is flaky. To tell them apart, check the Sandbox itself
(\`sb.poll()\` returns \`None\` while it's running, i.e. not finished).

\`\`\`python
def is_healthy(url: str) -> bool:
    """Check if a Sandbox is healthy by verifying the server responds to requests."""
    import requests

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False


def is_still_good(sr: SandboxReference, check_health: bool) -> bool:
    """Check if a Sandbox is still good to use.

    It assumes that it's already been added to the pool, so we don't wait for the
    container to start.
    """
    if sr.expires_at < time.time() + SANDBOX_USE_DURATION_SECONDS:
        return False

    if check_health and not is_healthy(sr.url):
        return False

    return True


\`\`\`

### Adding a Sandbox to the pool

This function creates and adds a new Sandbox to the pool. It waits for the
Sandbox's readiness probe to pass before adding it, ensuring the server is
ready to serve requests.

We deploy the Sandboxes in a separate Modal App called \`example-sandbox-pool-sandboxes\`,
to separate the control app (logs, etc.) from the Sandboxes.

\`\`\`python
@app.function(image=server_image, retries=3)
@modal.concurrent(max_inputs=20)
def add_sandbox_to_queue() -> None:
    sandbox_app = modal.App.lookup(SANDBOX_APP_NAME, create_if_missing=True)

    sandbox_cmd = ["python", "-m", "http.server", "8080"]
    sb = modal.Sandbox.create(
        *sandbox_cmd,
        app=sandbox_app,
        image=sandbox_image,
        encrypted_ports=[SANDBOX_SERVER_PORT],
        timeout=SANDBOX_TIMEOUT_SECONDS,
        readiness_probe=modal.Probe.with_exec(
            "curl", "-sf", f"http://localhost:{SANDBOX_SERVER_PORT}/"
        ),
    )
    expires_at = int(time.time()) + SANDBOX_TIMEOUT_SECONDS

    # A failed probe or tunnel lookup doesn't terminate the Sandbox, so we do it here.
    # Otherwise it keeps running untracked until its timeout expires, and \`retries=3\`
    # above turns each invocation into up to four orphans.
    pooled = False
    try:
        sb.wait_until_ready(timeout=READINESS_PROBE_TIMEOUT_SECONDS)
        url = sb.tunnels()[SANDBOX_SERVER_PORT].url
        pool_queue.put(
            SandboxReference(id=sb.object_id, url=url, expires_at=expires_at)
        )
        pooled = True
    except modal.exception.TimeoutError as exc:
        print(f"Sandbox '{sb.object_id}' timed out before it was ready: {exc}")
        raise  # let the Function's retries create a fresh Sandbox
    except modal.exception.ConflictError as exc:
        print(f"Sandbox '{sb.object_id}' finished before it was ready: {exc}")
        raise
    finally:
        if not pooled:
            sb.terminate()
        sb.detach()


\`\`\`

We also have a utility function that can be \`.spawn()\`ed to terminate Sandboxes.

\`\`\`python
@app.function()
def terminate_sandboxes(sandbox_ids: list[str]) -> int:
    num_terminated = 0
    for id in sandbox_ids:
        sb = modal.Sandbox.from_id(id)
        sb.terminate()
        sb.detach()
        num_terminated += 1

    print(f"Terminated {num_terminated} Sandboxes")
    return num_terminated


\`\`\`

### Claiming a Sandbox from the pool

We expose two ways to claim a Sandbox from the pool and get a URL to the server:

- a public Web Function that can be addressed via HTTP
- a Function that can be called using the Modal SDK (including from [Go or JS][1]).

[1]: https://modal.com/docs/guide/sdk-javascript-go

The Web Function proxies to \`claim_sandbox\` using a \`.local()\` invocation,
which runs in the same container without additional latency.

Health checks run before the URL is returned, yet a claimed Sandbox can still die or
expire before the caller connects. \`SANDBOX_USE_DURATION_SECONDS\` buffers against
expiry, but callers should be ready to claim again on a connection error. Passing
\`check_health=false\` bypasses the health check and may return a dead Sandbox.

\`\`\`python
@app.function(image=server_image)
@modal.fastapi_endpoint()
@modal.concurrent(max_inputs=20)
def claim_sandbox_web_function(check_health: bool = True) -> str:
    return claim_sandbox.local(check_health=check_health)


@app.function(image=server_image)
def claim_sandbox(check_health: bool = True) -> str:
    to_terminate: list[str] = []

    # Remove any expiring or unhealthy sandboxes, and return the first good one:
    while True:
        print(
            "Adding a new Sandbox to the pool to backfill "
            "(and ensure we have at least one)..."
        )
        add_sandbox_to_queue.spawn()

        # timeout=None here means we block in case we need to wait for the backfill:
        sr = pool_queue.get(timeout=None)
        if sr is None:
            continue

        if not is_still_good(sr, check_health):
            print(f"Sandbox '{sr.id}' was not good - terminating and trying another...")
            to_terminate.append(sr.id)
            continue

        break

    if to_terminate:
        terminate_sandboxes.spawn(to_terminate)

    print(f"Claimed Sandbox '{sr.id}', with URL: {sr.url}")
    return sr.url


\`\`\`

### Maintaining the pool

This function grows or shrinks the pool to SANDBOX_POOL_SIZE. It first removes any
expiring or unhealthy sandboxes, then adjusts the pool size to reach the target.

It runs on a schedule to ensure the pool doesn't drift too far from the target size.

\`\`\`python
@app.function(
    image=server_image,
    schedule=POOL_MAINTENANCE_SCHEDULE,
)
def maintain_pool():
    to_terminate: list[str] = []

    # First remove expiring and unhealthy sandboxes
    while True:
        sr = pool_queue.get(block=False)

        if sr is None:
            break

        if not is_still_good(sr, check_health=True):
            to_terminate.append(sr.id)
            continue

        # Found first good sandbox, but don't put it back in the queue to preserve
        # queue ordering.
        to_terminate.append(sr.id)
        break

    if to_terminate:
        print(f"Terminating {len(to_terminate)} expiring/unhealthy sandboxes...")
        terminate_sandboxes.spawn(to_terminate)

    # Now resize to target
    diff = POOL_SIZE - pool_queue.len()

    if diff > 0:
        for _ in add_sandbox_to_queue.starmap(() for _ in range(diff)):
            pass
    elif diff < 0:
        terminate_sandboxes.spawn(
            [sr.id for sr in pool_queue.get_many(n_values=-diff, timeout=0)]
        )

    print(f"Pool size after maintenance: {pool_queue.len()}")


\`\`\`

## Local commands for interacting with the pool

### Deploy the app

This also runs the \`maintain_pool\` function to ensure the pool is at the correct size
without having to wait for the first scheduled maintenance run.

Run it with \`python 13_sandboxes/sandbox_pool.py deploy\`.

\`\`\`python
def deploy():
    print("Deploying the app...")
    app.deploy()
    print("Done.")

    print("\\nRunning initial pool maintenance...")
    maintain_pool.remote()
    print("Done.")


\`\`\`

### Check the current state of the pool

Run it with \`python 13_sandboxes/sandbox_pool.py check\`.

\`\`\`python
def check():
    print(f"Number of Sandboxes in the pool: {pool_queue.len()}")

    for sr in pool_queue.iterate():
        seconds_left = sr.expires_at - time.time()
        print(
            f"- Sandbox '{sr.id}' is at {sr.url} and expires at "
            f"{datetime.fromtimestamp(sr.expires_at).isoformat()} "
            f"({int(seconds_left)} seconds left)"
        )


\`\`\`

### Claiming a Sandbox from the pool and print its URL

This is implemented as if you wanted to call the Function from a Python backend
application using the Modal SDK, i.e. using \`.from_name()\` to get the Function, etc.

Run it with \`python 13_sandboxes/sandbox_pool.py claim\`.

\`\`\`python
def claim() -> None:
    deployed_claim_sandbox = modal.Function.from_name(APP_NAME, "claim_sandbox")
    print(deployed_claim_sandbox.remote())


\`\`\`

### Run a demo of the Sandbox pool.

This is implemented as if you wanted to call the Function from a Python backend
application using the Modal SDK, i.e. using \`.from_name()\` to get the Function, etc.

Run it with \`python 13_sandboxes/sandbox_pool.py demo\`.

\`\`\`python
def demo():
    import urllib.request

    deploy()

    check()

    print("\\nClaiming a Sandbox using the \`claim_sandbox\` Function...")
    deployed_claim_sandbox = modal.Function.from_name(APP_NAME, "claim_sandbox")
    sandbox_url = deployed_claim_sandbox.remote()
    print(f"Claimed Sandbox URL: {sandbox_url}")

    print("\\nCall the server in the Sandbox...")
    with urllib.request.urlopen(sandbox_url) as response:
        result = response.read().decode("utf-8")
        print(f"Sandbox server response:\\n{result}")

    time.sleep(2)  # wait for the pool to be backfilled in the background
    check()

    deployed_web_function = modal.Function.from_name(
        APP_NAME, "claim_sandbox_web_function"
    )
    claim_url = deployed_web_function.get_web_url()
    print(f"\\nClaiming a Sandbox using the Function at '{claim_url}'...")
    with urllib.request.urlopen(claim_url) as response:
        sandbox_url = response.read().decode("utf-8").strip(' "')
        print(f"Claimed Sandbox URL: {sandbox_url}")

    print("\\nCall the server in the Sandbox...")
    with urllib.request.urlopen(sandbox_url) as response:
        result = response.read().decode("utf-8")
        print(f"Sandbox server response:\\n{result}")

    time.sleep(2)
    check()

    print("\\nWhen you're done, stop the App to clean up:")
    print(f"  modal app stop {APP_NAME}")


\`\`\`

### Clean up

\`deploy\` and \`demo\` leave the App deployed, so \`maintain_pool\` keeps refilling the
pool. Stopping it halts the schedule, after which the Sandboxes expire on their own
within \`SANDBOX_TIMEOUT_SECONDS\`:

\`\`\`
modal app stop example-sandbox-pool
modal queue delete example-sandbox-pool-queue
\`\`\`

See [Managing deployments](https://modal.com/docs/guide/managing-deployments) for
more on stopping Apps.

\`\`\`python
def main():
    parser = argparse.ArgumentParser(description="Manage Sandbox pool")
    parser.add_argument(
        "command",
        choices=["check", "deploy", "claim", "demo"],
        help="Command to execute",
    )
    args = parser.parse_args()

    if args.command == "check":
        check()
    elif args.command == "claim":
        claim()
    elif args.command == "deploy":
        deploy()
    elif args.command == "demo":
        demo()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()

\`\`\`
`,meta:{title:`Maintain a pool of warm Sandboxes that are healthy and ready to serve requests`,description:`This example demonstrates how to build a pool of “warm” Modal Sandboxes, and deploy a Modal Web Function that lets you claim a Sandbox from the pool, getting a URL to the server running in the Sandbox.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>This example demonstrates how to build a pool of “warm” <!>, and deploy a <!> that lets you claim
a Sandbox from the pool, getting a URL to the server running in the Sandbox.</p> <p>Maintaining a pool of warm Sandboxes is useful for example if your Sandboxes need
to do significant work after being created, like downloading code, installing
dependencies, or running tests, before they are ready to serve requests.</p> <p>It uses a <!> to store references to the warm Sandboxes, and functionality to maintain the pool
by adding and removing Sandboxes, checking the current size, etc.</p> <p>The pool keeps track of the time to live for each Sandbox, and will always return
a Sandbox with enough time left.</p> <p>Each Sandbox is configured with a <!> so we can
reliably wait for the server to be ready before adding it to the pool.</p> <p>It’s structured into two Apps:</p> <ul><li><code>example-sandbox-pool</code> is the main App that contains all the control logic for maintaining
the pool, exposing ways to claim Sandboxes, etc.</li> <li><code>example-sandbox-pool-sandboxes</code> houses all the actual Sandboxes, and nothing else.</li></ul> <p>The implementation borrows from <!>’s <!>. 🙏</p> <!> <p>Here we define the image that will be used to run the server that runs in the
Sandbox. In this simple example, we just run the built in Python HTTP server that
returns a directory listing.</p> <!> <p>In this example Sandboxes live for 5 minutes, and we assume that they are used for
2 minutes, meaning that if a Sandbox has less than 2 minutes left it’s considered
to be expiring too soon and will be terminated.</p> <p>You’ll want to adjust these values depending on your use case. We don’t set <code>idle_timeout</code>: pooled Sandboxes are idle by definition, so it would terminate them
before they can be claimed.</p> <!> <!> <p>We keep track of all warm Sandboxes in a Modal Queue of <code>SandboxReference</code> objects.</p> <!> <p>Modal doesn’t expose a Sandbox’s remaining lifetime, so we track it ourselves. <code>expires_at</code> is approximate: it’s computed after <code>create</code> returns, and only
accounts for the wall-clock timeout, not other ways a Sandbox can die.</p> <!> <!> <p>We run a health check to determine 3 types of statuses: readiness
(<code>wait_until_ready</code>, once at creation), health (<code>is_healthy</code>, below), and remaining
lifetime (<code>expires_at</code>, not health at all). <code>is_still_good</code> combines the last two.</p> <p><code>is_healthy</code> returns false on three types of failures: the Sandbox is gone, the server
crashed, or the Tunnel is flaky. To tell them apart, check the Sandbox itself
(<code>sb.poll()</code> returns <code>None</code> while it’s running, i.e. not finished).</p> <!> <!> <p>This function creates and adds a new Sandbox to the pool. It waits for the
Sandbox’s readiness probe to pass before adding it, ensuring the server is
ready to serve requests.</p> <p>We deploy the Sandboxes in a separate Modal App called <code>example-sandbox-pool-sandboxes</code>,
to separate the control app (logs, etc.) from the Sandboxes.</p> <!> <p>We also have a utility function that can be <code>.spawn()</code>ed to terminate Sandboxes.</p> <!> <!> <p>We expose two ways to claim a Sandbox from the pool and get a URL to the server:</p> <ul><li>a public Web Function that can be addressed via HTTP</li> <li>a Function that can be called using the Modal SDK (including from <!>).</li></ul> <p>The Web Function proxies to <code>claim_sandbox</code> using a <code>.local()</code> invocation,
which runs in the same container without additional latency.</p> <p>Health checks run before the URL is returned, yet a claimed Sandbox can still die or
expire before the caller connects. <code>SANDBOX_USE_DURATION_SECONDS</code> buffers against
expiry, but callers should be ready to claim again on a connection error. Passing <code>check_health=false</code> bypasses the health check and may return a dead Sandbox.</p> <!> <!> <p>This function grows or shrinks the pool to SANDBOX_POOL_SIZE. It first removes any
expiring or unhealthy sandboxes, then adjusts the pool size to reach the target.</p> <p>It runs on a schedule to ensure the pool doesn’t drift too far from the target size.</p> <!> <!> <!> <p>This also runs the <code>maintain_pool</code> function to ensure the pool is at the correct size
without having to wait for the first scheduled maintenance run.</p> <p>Run it with <code>python 13_sandboxes/sandbox_pool.py deploy</code>.</p> <!> <!> <p>Run it with <code>python 13_sandboxes/sandbox_pool.py check</code>.</p> <!> <!> <p>This is implemented as if you wanted to call the Function from a Python backend
application using the Modal SDK, i.e. using <code>.from_name()</code> to get the Function, etc.</p> <p>Run it with <code>python 13_sandboxes/sandbox_pool.py claim</code>.</p> <!> <!> <p>This is implemented as if you wanted to call the Function from a Python backend
application using the Modal SDK, i.e. using <code>.from_name()</code> to get the Function, etc.</p> <p>Run it with <code>python 13_sandboxes/sandbox_pool.py demo</code>.</p> <!> <!> <p><code>deploy</code> and <code>demo</code> leave the App deployed, so <code>maintain_pool</code> keeps refilling the
pool. Stopping it halts the schedule, after which the Sandboxes expire on their own
within <code>SANDBOX_TIMEOUT_SECONDS</code>:</p> <!> <p>See <!> for
more on stopping Apps.</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`maintain-a-pool-of-warm-sandboxes-that-are-healthy-and-ready-to-serve-requests`,children:(e,t)=>{l(),i(e,r(`Maintain a pool of warm Sandboxes that are healthy and ready to serve requests`))},$$slots:{default:!0}});var g=c(m,2),_=c(e(g));h(_,{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Sandboxes`))},$$slots:{default:!0}}),h(c(_,2),{href:`https://modal.com/docs/guide/webhook-urls`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Web Function`))},$$slots:{default:!0}}),l(),n(g);var v=c(g,4);h(c(e(v)),{href:`https://modal.com/docs/guide/dicts-and-queues#modal-queues`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Queue`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4);h(c(e(y)),{href:`https://modal.com/docs/guide/sandboxes#readiness-probes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`readiness probe`))},$$slots:{default:!0}}),l(),n(y);var x=c(y,6),S=c(e(x));h(S,{href:`https://github.com/pawalt`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`pawalt`))},$$slots:{default:!0}}),h(c(S,2),{href:`https://gist.github.com/pawalt/7a505c38bba75cafae0780a5dd40e8b8`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox pool
example gist`))},$$slots:{default:!0}}),l(),n(x);var C=c(x,2);p(C,{code:`import%20argparse%0Aimport%20time%0Afrom%20dataclasses%20import%20dataclass%0Afrom%20datetime%20import%20datetime%0A%0Aimport%20modal%0A%0AAPP_NAME%20%3D%20%22example-sandbox-pool%22%0ASANDBOX_APP_NAME%20%3D%20%22example-sandbox-pool-sandboxes%22%0APOOL_QUEUE_NAME%20%3D%20%22example-sandbox-pool-queue%22%0A%0Aapp%20%3D%20modal.App(APP_NAME)%0A%0Aserver_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).uv_pip_install(%0A%20%20%20%20%22fastapi%5Bstandard%5D~%3D0.115.14%22%2C%0A%20%20%20%20%22requests~%3D2.32.4%22%2C%0A)%0A%0A%23%23%20Configuration%20of%20the%20pool%0A`,lang:`python`});var w=c(C,4);p(w,{code:`sandbox_image%20%3D%20modal.Image.debian_slim(python_version%3D%223.11%22).apt_install(%22curl%22)%0ASANDBOX_SERVER_PORT%20%3D%208080%0AREADINESS_PROBE_TIMEOUT_SECONDS%20%3D%2010%0A`,lang:`python`});var T=c(w,6);p(T,{code:`SANDBOX_TIMEOUT_SECONDS%20%3D%205%20*%2060%0ASANDBOX_USE_DURATION_SECONDS%20%3D%202%20*%2060%0APOOL_SIZE%20%3D%203%0APOOL_MAINTENANCE_SCHEDULE%20%3D%20modal.Period(minutes%3D2)%0A%0A`,lang:`python`});var E=c(T,2);u(E,{id:`main-implementation`,children:(e,t)=>{l(),i(e,r(`Main implementation`))},$$slots:{default:!0}});var D=c(E,4);p(D,{code:`pool_queue%20%3D%20modal.Queue.from_name(POOL_QUEUE_NAME%2C%20create_if_missing%3DTrue)%0A%0A`,lang:`python`});var O=c(D,4);p(O,{code:`%40dataclass%0Aclass%20SandboxReference%3A%0A%20%20%20%20id%3A%20str%0A%20%20%20%20url%3A%20str%0A%20%20%20%20expires_at%3A%20int%0A%0A`,lang:`python`});var k=c(O,2);d(k,{id:`health-check`,children:(e,t)=>{l(),i(e,r(`Health check`))},$$slots:{default:!0}});var A=c(k,6);p(A,{code:`def%20is_healthy(url%3A%20str)%20-%3E%20bool%3A%0A%20%20%20%20%22%22%22Check%20if%20a%20Sandbox%20is%20healthy%20by%20verifying%20the%20server%20responds%20to%20requests.%22%22%22%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20response%20%3D%20requests.get(url%2C%20timeout%3D10)%0A%20%20%20%20%20%20%20%20response.raise_for_status()%0A%20%20%20%20%20%20%20%20return%20True%0A%20%20%20%20except%20requests.RequestException%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%0Adef%20is_still_good(sr%3A%20SandboxReference%2C%20check_health%3A%20bool)%20-%3E%20bool%3A%0A%20%20%20%20%22%22%22Check%20if%20a%20Sandbox%20is%20still%20good%20to%20use.%0A%0A%20%20%20%20It%20assumes%20that%20it's%20already%20been%20added%20to%20the%20pool%2C%20so%20we%20don't%20wait%20for%20the%0A%20%20%20%20container%20to%20start.%0A%20%20%20%20%22%22%22%0A%20%20%20%20if%20sr.expires_at%20%3C%20time.time()%20%2B%20SANDBOX_USE_DURATION_SECONDS%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%20%20%20%20if%20check_health%20and%20not%20is_healthy(sr.url)%3A%0A%20%20%20%20%20%20%20%20return%20False%0A%0A%20%20%20%20return%20True%0A%0A`,lang:`python`});var j=c(A,2);d(j,{id:`adding-a-sandbox-to-the-pool`,children:(e,t)=>{l(),i(e,r(`Adding a Sandbox to the pool`))},$$slots:{default:!0}});var M=c(j,6);p(M,{code:`%40app.function(image%3Dserver_image%2C%20retries%3D3)%0A%40modal.concurrent(max_inputs%3D20)%0Adef%20add_sandbox_to_queue()%20-%3E%20None%3A%0A%20%20%20%20sandbox_app%20%3D%20modal.App.lookup(SANDBOX_APP_NAME%2C%20create_if_missing%3DTrue)%0A%0A%20%20%20%20sandbox_cmd%20%3D%20%5B%22python%22%2C%20%22-m%22%2C%20%22http.server%22%2C%20%228080%22%5D%0A%20%20%20%20sb%20%3D%20modal.Sandbox.create(%0A%20%20%20%20%20%20%20%20*sandbox_cmd%2C%0A%20%20%20%20%20%20%20%20app%3Dsandbox_app%2C%0A%20%20%20%20%20%20%20%20image%3Dsandbox_image%2C%0A%20%20%20%20%20%20%20%20encrypted_ports%3D%5BSANDBOX_SERVER_PORT%5D%2C%0A%20%20%20%20%20%20%20%20timeout%3DSANDBOX_TIMEOUT_SECONDS%2C%0A%20%20%20%20%20%20%20%20readiness_probe%3Dmodal.Probe.with_exec(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22curl%22%2C%20%22-sf%22%2C%20f%22http%3A%2F%2Flocalhost%3A%7BSANDBOX_SERVER_PORT%7D%2F%22%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20)%0A%20%20%20%20expires_at%20%3D%20int(time.time())%20%2B%20SANDBOX_TIMEOUT_SECONDS%0A%0A%20%20%20%20%23%20A%20failed%20probe%20or%20tunnel%20lookup%20doesn't%20terminate%20the%20Sandbox%2C%20so%20we%20do%20it%20here.%0A%20%20%20%20%23%20Otherwise%20it%20keeps%20running%20untracked%20until%20its%20timeout%20expires%2C%20and%20%60retries%3D3%60%0A%20%20%20%20%23%20above%20turns%20each%20invocation%20into%20up%20to%20four%20orphans.%0A%20%20%20%20pooled%20%3D%20False%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20sb.wait_until_ready(timeout%3DREADINESS_PROBE_TIMEOUT_SECONDS)%0A%20%20%20%20%20%20%20%20url%20%3D%20sb.tunnels()%5BSANDBOX_SERVER_PORT%5D.url%0A%20%20%20%20%20%20%20%20pool_queue.put(%0A%20%20%20%20%20%20%20%20%20%20%20%20SandboxReference(id%3Dsb.object_id%2C%20url%3Durl%2C%20expires_at%3Dexpires_at)%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20pooled%20%3D%20True%0A%20%20%20%20except%20modal.exception.TimeoutError%20as%20exc%3A%0A%20%20%20%20%20%20%20%20print(f%22Sandbox%20'%7Bsb.object_id%7D'%20timed%20out%20before%20it%20was%20ready%3A%20%7Bexc%7D%22)%0A%20%20%20%20%20%20%20%20raise%20%20%23%20let%20the%20Function's%20retries%20create%20a%20fresh%20Sandbox%0A%20%20%20%20except%20modal.exception.ConflictError%20as%20exc%3A%0A%20%20%20%20%20%20%20%20print(f%22Sandbox%20'%7Bsb.object_id%7D'%20finished%20before%20it%20was%20ready%3A%20%7Bexc%7D%22)%0A%20%20%20%20%20%20%20%20raise%0A%20%20%20%20finally%3A%0A%20%20%20%20%20%20%20%20if%20not%20pooled%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20sb.terminate()%0A%20%20%20%20%20%20%20%20sb.detach()%0A%0A`,lang:`python`});var N=c(M,4);p(N,{code:`%40app.function()%0Adef%20terminate_sandboxes(sandbox_ids%3A%20list%5Bstr%5D)%20-%3E%20int%3A%0A%20%20%20%20num_terminated%20%3D%200%0A%20%20%20%20for%20id%20in%20sandbox_ids%3A%0A%20%20%20%20%20%20%20%20sb%20%3D%20modal.Sandbox.from_id(id)%0A%20%20%20%20%20%20%20%20sb.terminate()%0A%20%20%20%20%20%20%20%20sb.detach()%0A%20%20%20%20%20%20%20%20num_terminated%20%2B%3D%201%0A%0A%20%20%20%20print(f%22Terminated%20%7Bnum_terminated%7D%20Sandboxes%22)%0A%20%20%20%20return%20num_terminated%0A%0A`,lang:`python`});var P=c(N,2);d(P,{id:`claiming-a-sandbox-from-the-pool`,children:(e,t)=>{l(),i(e,r(`Claiming a Sandbox from the pool`))},$$slots:{default:!0}});var F=c(P,4),I=c(e(F),2);h(c(e(I)),{href:`https://modal.com/docs/guide/sdk-javascript-go`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Go or JS`))},$$slots:{default:!0}}),l(),n(I),n(F);var L=c(F,6);p(L,{code:`%40app.function(image%3Dserver_image)%0A%40modal.fastapi_endpoint()%0A%40modal.concurrent(max_inputs%3D20)%0Adef%20claim_sandbox_web_function(check_health%3A%20bool%20%3D%20True)%20-%3E%20str%3A%0A%20%20%20%20return%20claim_sandbox.local(check_health%3Dcheck_health)%0A%0A%0A%40app.function(image%3Dserver_image)%0Adef%20claim_sandbox(check_health%3A%20bool%20%3D%20True)%20-%3E%20str%3A%0A%20%20%20%20to_terminate%3A%20list%5Bstr%5D%20%3D%20%5B%5D%0A%0A%20%20%20%20%23%20Remove%20any%20expiring%20or%20unhealthy%20sandboxes%2C%20and%20return%20the%20first%20good%20one%3A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20%22Adding%20a%20new%20Sandbox%20to%20the%20pool%20to%20backfill%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%22(and%20ensure%20we%20have%20at%20least%20one)...%22%0A%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20add_sandbox_to_queue.spawn()%0A%0A%20%20%20%20%20%20%20%20%23%20timeout%3DNone%20here%20means%20we%20block%20in%20case%20we%20need%20to%20wait%20for%20the%20backfill%3A%0A%20%20%20%20%20%20%20%20sr%20%3D%20pool_queue.get(timeout%3DNone)%0A%20%20%20%20%20%20%20%20if%20sr%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20if%20not%20is_still_good(sr%2C%20check_health)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Sandbox%20'%7Bsr.id%7D'%20was%20not%20good%20-%20terminating%20and%20trying%20another...%22)%0A%20%20%20%20%20%20%20%20%20%20%20%20to_terminate.append(sr.id)%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20if%20to_terminate%3A%0A%20%20%20%20%20%20%20%20terminate_sandboxes.spawn(to_terminate)%0A%0A%20%20%20%20print(f%22Claimed%20Sandbox%20'%7Bsr.id%7D'%2C%20with%20URL%3A%20%7Bsr.url%7D%22)%0A%20%20%20%20return%20sr.url%0A%0A`,lang:`python`});var R=c(L,2);d(R,{id:`maintaining-the-pool`,children:(e,t)=>{l(),i(e,r(`Maintaining the pool`))},$$slots:{default:!0}});var z=c(R,6);p(z,{code:`%40app.function(%0A%20%20%20%20image%3Dserver_image%2C%0A%20%20%20%20schedule%3DPOOL_MAINTENANCE_SCHEDULE%2C%0A)%0Adef%20maintain_pool()%3A%0A%20%20%20%20to_terminate%3A%20list%5Bstr%5D%20%3D%20%5B%5D%0A%0A%20%20%20%20%23%20First%20remove%20expiring%20and%20unhealthy%20sandboxes%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20sr%20%3D%20pool_queue.get(block%3DFalse)%0A%0A%20%20%20%20%20%20%20%20if%20sr%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20%20%20%20%20if%20not%20is_still_good(sr%2C%20check_health%3DTrue)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20to_terminate.append(sr.id)%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%23%20Found%20first%20good%20sandbox%2C%20but%20don't%20put%20it%20back%20in%20the%20queue%20to%20preserve%0A%20%20%20%20%20%20%20%20%23%20queue%20ordering.%0A%20%20%20%20%20%20%20%20to_terminate.append(sr.id)%0A%20%20%20%20%20%20%20%20break%0A%0A%20%20%20%20if%20to_terminate%3A%0A%20%20%20%20%20%20%20%20print(f%22Terminating%20%7Blen(to_terminate)%7D%20expiring%2Funhealthy%20sandboxes...%22)%0A%20%20%20%20%20%20%20%20terminate_sandboxes.spawn(to_terminate)%0A%0A%20%20%20%20%23%20Now%20resize%20to%20target%0A%20%20%20%20diff%20%3D%20POOL_SIZE%20-%20pool_queue.len()%0A%0A%20%20%20%20if%20diff%20%3E%200%3A%0A%20%20%20%20%20%20%20%20for%20_%20in%20add_sandbox_to_queue.starmap(()%20for%20_%20in%20range(diff))%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20elif%20diff%20%3C%200%3A%0A%20%20%20%20%20%20%20%20terminate_sandboxes.spawn(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5Bsr.id%20for%20sr%20in%20pool_queue.get_many(n_values%3D-diff%2C%20timeout%3D0)%5D%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20print(f%22Pool%20size%20after%20maintenance%3A%20%7Bpool_queue.len()%7D%22)%0A%0A`,lang:`python`});var B=c(z,2);u(B,{id:`local-commands-for-interacting-with-the-pool`,children:(e,t)=>{l(),i(e,r(`Local commands for interacting with the pool`))},$$slots:{default:!0}});var V=c(B,2);d(V,{id:`deploy-the-app`,children:(e,t)=>{l(),i(e,r(`Deploy the app`))},$$slots:{default:!0}});var H=c(V,6);p(H,{code:`def%20deploy()%3A%0A%20%20%20%20print(%22Deploying%20the%20app...%22)%0A%20%20%20%20app.deploy()%0A%20%20%20%20print(%22Done.%22)%0A%0A%20%20%20%20print(%22%5CnRunning%20initial%20pool%20maintenance...%22)%0A%20%20%20%20maintain_pool.remote()%0A%20%20%20%20print(%22Done.%22)%0A%0A`,lang:`python`});var U=c(H,2);d(U,{id:`check-the-current-state-of-the-pool`,children:(e,t)=>{l(),i(e,r(`Check the current state of the pool`))},$$slots:{default:!0}});var W=c(U,4);p(W,{code:`def%20check()%3A%0A%20%20%20%20print(f%22Number%20of%20Sandboxes%20in%20the%20pool%3A%20%7Bpool_queue.len()%7D%22)%0A%0A%20%20%20%20for%20sr%20in%20pool_queue.iterate()%3A%0A%20%20%20%20%20%20%20%20seconds_left%20%3D%20sr.expires_at%20-%20time.time()%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22-%20Sandbox%20'%7Bsr.id%7D'%20is%20at%20%7Bsr.url%7D%20and%20expires%20at%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Bdatetime.fromtimestamp(sr.expires_at).isoformat()%7D%20%22%0A%20%20%20%20%20%20%20%20%20%20%20%20f%22(%7Bint(seconds_left)%7D%20seconds%20left)%22%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var G=c(W,2);d(G,{id:`claiming-a-sandbox-from-the-pool-and-print-its-url`,children:(e,t)=>{l(),i(e,r(`Claiming a Sandbox from the pool and print its URL`))},$$slots:{default:!0}});var K=c(G,6);p(K,{code:`def%20claim()%20-%3E%20None%3A%0A%20%20%20%20deployed_claim_sandbox%20%3D%20modal.Function.from_name(APP_NAME%2C%20%22claim_sandbox%22)%0A%20%20%20%20print(deployed_claim_sandbox.remote())%0A%0A`,lang:`python`});var q=c(K,2);d(q,{id:`run-a-demo-of-the-sandbox-pool`,children:(e,t)=>{l(),i(e,r(`Run a demo of the Sandbox pool.`))},$$slots:{default:!0}});var J=c(q,6);p(J,{code:`def%20demo()%3A%0A%20%20%20%20import%20urllib.request%0A%0A%20%20%20%20deploy()%0A%0A%20%20%20%20check()%0A%0A%20%20%20%20print(%22%5CnClaiming%20a%20Sandbox%20using%20the%20%60claim_sandbox%60%20Function...%22)%0A%20%20%20%20deployed_claim_sandbox%20%3D%20modal.Function.from_name(APP_NAME%2C%20%22claim_sandbox%22)%0A%20%20%20%20sandbox_url%20%3D%20deployed_claim_sandbox.remote()%0A%20%20%20%20print(f%22Claimed%20Sandbox%20URL%3A%20%7Bsandbox_url%7D%22)%0A%0A%20%20%20%20print(%22%5CnCall%20the%20server%20in%20the%20Sandbox...%22)%0A%20%20%20%20with%20urllib.request.urlopen(sandbox_url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20response.read().decode(%22utf-8%22)%0A%20%20%20%20%20%20%20%20print(f%22Sandbox%20server%20response%3A%5Cn%7Bresult%7D%22)%0A%0A%20%20%20%20time.sleep(2)%20%20%23%20wait%20for%20the%20pool%20to%20be%20backfilled%20in%20the%20background%0A%20%20%20%20check()%0A%0A%20%20%20%20deployed_web_function%20%3D%20modal.Function.from_name(%0A%20%20%20%20%20%20%20%20APP_NAME%2C%20%22claim_sandbox_web_function%22%0A%20%20%20%20)%0A%20%20%20%20claim_url%20%3D%20deployed_web_function.get_web_url()%0A%20%20%20%20print(f%22%5CnClaiming%20a%20Sandbox%20using%20the%20Function%20at%20'%7Bclaim_url%7D'...%22)%0A%20%20%20%20with%20urllib.request.urlopen(claim_url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20sandbox_url%20%3D%20response.read().decode(%22utf-8%22).strip('%20%22')%0A%20%20%20%20%20%20%20%20print(f%22Claimed%20Sandbox%20URL%3A%20%7Bsandbox_url%7D%22)%0A%0A%20%20%20%20print(%22%5CnCall%20the%20server%20in%20the%20Sandbox...%22)%0A%20%20%20%20with%20urllib.request.urlopen(sandbox_url)%20as%20response%3A%0A%20%20%20%20%20%20%20%20result%20%3D%20response.read().decode(%22utf-8%22)%0A%20%20%20%20%20%20%20%20print(f%22Sandbox%20server%20response%3A%5Cn%7Bresult%7D%22)%0A%0A%20%20%20%20time.sleep(2)%0A%20%20%20%20check()%0A%0A%20%20%20%20print(%22%5CnWhen%20you're%20done%2C%20stop%20the%20App%20to%20clean%20up%3A%22)%0A%20%20%20%20print(f%22%20%20modal%20app%20stop%20%7BAPP_NAME%7D%22)%0A%0A`,lang:`python`});var Y=c(J,2);d(Y,{id:`clean-up`,children:(e,t)=>{l(),i(e,r(`Clean up`))},$$slots:{default:!0}});var X=c(Y,4);p(X,{code:`modal%20app%20stop%20example-sandbox-pool%0Amodal%20queue%20delete%20example-sandbox-pool-queue`,lang:`text`});var Z=c(X,2);h(c(e(Z)),{href:`https://modal.com/docs/guide/managing-deployments`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Managing deployments`))},$$slots:{default:!0}}),l(),n(Z),p(c(Z,2),{code:`def%20main()%3A%0A%20%20%20%20parser%20%3D%20argparse.ArgumentParser(description%3D%22Manage%20Sandbox%20pool%22)%0A%20%20%20%20parser.add_argument(%0A%20%20%20%20%20%20%20%20%22command%22%2C%0A%20%20%20%20%20%20%20%20choices%3D%5B%22check%22%2C%20%22deploy%22%2C%20%22claim%22%2C%20%22demo%22%5D%2C%0A%20%20%20%20%20%20%20%20help%3D%22Command%20to%20execute%22%2C%0A%20%20%20%20)%0A%20%20%20%20args%20%3D%20parser.parse_args()%0A%0A%20%20%20%20if%20args.command%20%3D%3D%20%22check%22%3A%0A%20%20%20%20%20%20%20%20check()%0A%20%20%20%20elif%20args.command%20%3D%3D%20%22claim%22%3A%0A%20%20%20%20%20%20%20%20claim()%0A%20%20%20%20elif%20args.command%20%3D%3D%20%22deploy%22%3A%0A%20%20%20%20%20%20%20%20deploy()%0A%20%20%20%20elif%20args.command%20%3D%3D%20%22demo%22%3A%0A%20%20%20%20%20%20%20%20demo()%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20parser.print_help()%0A%0A%0Aif%20__name__%20%3D%3D%20%22__main__%22%3A%0A%20%20%20%20main()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BjDCehHS2.js.map
