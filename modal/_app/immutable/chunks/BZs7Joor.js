(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3b8b58a0-5006-4b50-a1ea-d562142d2057`,e._sentryDebugIdIdentifier=`sentry-dbid-3b8b58a0-5006-4b50-a1ea-d562142d2057`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Orchestrate a multi-step pipeline with Modal Functions`,id:`orchestrate-a-multi-step-pipeline-with-modal-functions`,children:[{depth:2,value:`Set up`,id:`set-up`},{depth:2,value:`Construct artifact keys`,id:`construct-artifact-keys`},{depth:2,value:`Coordinate work handoff`,id:`coordinate-work-handoff`},{depth:2,value:`Save the results`,id:`save-the-results`},{depth:2,value:`Trigger a run from a local driver`,id:`trigger-a-run-from-a-local-driver`}]}],rawContent:`# Orchestrate a multi-step pipeline with Modal Functions

Every step of this pipeline is a Modal Function that hands off to the next one,
so you can run each stage with its own resources without standing up a separate orchestrator. A step looks up its successor by name
with [\`Function.from_name\`](https://modal.com/docs/guide/trigger-deployed-functions)
and starts it with [\`Function.spawn\`](https://modal.com/docs/guide/trigger-deployed-functions#invocation-patterns).

The toy computation used here is to build a range of numbers, square them, and sum them. Each
step caches its output on a Volume, so a rerun skips work already done.

Run it and see its trace:

\`\`\`bash
modal run 09_job_queues/pipeline_orchestration.py --n 10
\`\`\`

Because the steps hand off by name against a pinned version, the App has to be
deployed before it runs. The entrypoint deploys it for you if it isn't already,
but you can also deploy explicitly:

\`\`\`bash
modal deploy 09_job_queues/pipeline_orchestration.py
\`\`\`

Run that again with the same \`n\` and every step hits the cache. Deploy again and
every step recomputes regardless of which step you edited because keys are constructed partly by App version,
which a deploy bumps for the whole App.

## Set up

\`\`\`python
import hashlib
import io
import json
import subprocess
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import NamedTuple

import modal

APP_NAME = "example-pipeline-orchestration"
DATA_DIR = Path("/data")
MINUTES = 60  # seconds

app = modal.App(APP_NAME)
image = modal.Image.debian_slim(python_version="3.12").pip_install("numpy==2.2.6")

with image.imports():
    import numpy as np

\`\`\`

A [Dict](https://modal.com/docs/guide/dicts-and-queues) holds each run's trace and a
[Volume](https://modal.com/docs/guide/volumes) holds the input and the artifacts
steps pass along.

\`\`\`python
state = modal.Dict.from_name(f"{APP_NAME}-state", create_if_missing=True)
data = modal.Volume.from_name(f"{APP_NAME}-data", create_if_missing=True)


class Step(NamedTuple):
    name: str  # the Function that runs it
    output: str  # the artifact it leaves under its key


STEPS = [
    Step("build", "numbers.npy"),
    Step("square", "squared.npy"),
    Step("total", "total.json"),
]


@dataclass
class Pipeline:
    run_id: str  # unique per execution
    app_version: int  # deployed code version this run is pinned to
    input_id: str  # identifies the input and names its directory on the Volume
    function_call_ids: list[str] = field(default_factory=list)  # \`fc-\`, per step
    done: bool = False


\`\`\`

## Construct artifact keys

A step skips work whose output is already on the Volume, so its key changes
whenever its output would. A key is constructed by the deployed App version
and the step's inputs, which enter as its predecessor's key. Chaining
the keys means both only have to enter once, at the seed.

\`\`\`python
def cache_key(pipeline: Pipeline, step_num: int) -> str:
    key = f"{pipeline.input_id}@v{pipeline.app_version}"  # the version seeds the chain
    for step in STEPS[: step_num + 1]:
        digest = hashlib.sha256(f"{step.name}/{key}".encode()).hexdigest()
        key = f"{step.name}-{digest[:16]}"
    return key


def artifact(pipeline: Pipeline, step_num: int) -> Path:
    return DATA_DIR / cache_key(pipeline, step_num) / STEPS[step_num].output


\`\`\`

## Coordinate work handoff

Whoever spawns a step stamps its call id onto the run, so the trace builds up as the
pipeline moves and always ends with the step that is currently pending. Every
hand-off goes through the one pinned lookup in \`step_function\`.

\`\`\`python
def start_step(pipeline: Pipeline, step_num: int) -> Path:
    data.reload()  # a container only sees the Volume as of when it started
    pipeline.function_call_ids.append(modal.current_function_call_id())

    out = artifact(pipeline, step_num)
    out.parent.mkdir(parents=True, exist_ok=True)
    status = "cached" if out.exists() else "computing"
    print(f"[{STEPS[step_num].name}] {status} {out.name}")
    return out


def step_function(step_num: int, app_version: int) -> modal.Function:
    return modal.Function.from_name(APP_NAME, STEPS[step_num].name, version=app_version)


def spawn_step(pipeline: Pipeline, step_num: int) -> modal.FunctionCall:
    step = step_function(step_num, pipeline.app_version)
    call = step.spawn(pipeline, step_num)
    pipeline.function_call_ids.append(call.object_id)
    state[pipeline.run_id] = pipeline
    return call


def spawn_next(pipeline: Pipeline, step_num: int) -> None:
    if step_num + 1 >= len(STEPS):
        pipeline.done = True
        state[pipeline.run_id] = pipeline
        print("[done]")
        return

    spawn_step(pipeline, step_num + 1)


\`\`\`

## Save the results

The data for each step must be persisted to the Volume before the next step starts.
[Background commits](https://modal.com/docs/guide/volumes#background-commits) also
land every few seconds, but on their own schedule, so we run \`Volume.commit()\`
manually before each hand-off. Committing doesn't make the write atomic, so a crash
mid-write can still leave a corrupted artifact.

\`\`\`python
@app.function(image=image, volumes={DATA_DIR: data})
def build(pipeline: Pipeline, step_num: int) -> None:
    out = start_step(pipeline, step_num)
    if not out.exists():
        with open(DATA_DIR / pipeline.input_id / "input.json") as f:
            n = json.load(f)["n"]
        np.save(out, np.arange(1, n + 1))
        data.commit()
    spawn_next(pipeline, step_num)


@app.function(image=image, volumes={DATA_DIR: data})
def square(pipeline: Pipeline, step_num: int) -> None:
    out = start_step(pipeline, step_num)
    if not out.exists():
        numbers = np.load(artifact(pipeline, step_num - 1))
        np.save(out, numbers**2)
        data.commit()
    spawn_next(pipeline, step_num)


@app.function(image=image, volumes={DATA_DIR: data})
def total(pipeline: Pipeline, step_num: int) -> None:
    out = start_step(pipeline, step_num)
    if not out.exists():
        # Reaches back past \`square\` to also read what \`build\` wrote, by key.
        squared = np.load(artifact(pipeline, step_num - 1))
        numbers = np.load(artifact(pipeline, 0))
        with open(out, "w") as f:
            json.dump({"total": int(squared.sum()), "count": numbers.size}, f)
        data.commit()
    spawn_next(pipeline, step_num)


\`\`\`

## Trigger a run from a local driver

The driver reads the version that's live now, deploys if there isn't one, and pins
the run to it. Note, version pinning is a
[Team and Enterprise feature](https://modal.com/docs/guide/trigger-deployed-functions#version-pinned-lookups).

\`\`\`python
def latest_version() -> int | None:
    history = subprocess.run(
        ["modal", "app", "history", APP_NAME, "--json"], capture_output=True, text=True
    )
    versions = json.loads(history.stdout) if history.returncode == 0 else []
    numbers = [str(v.get("version", "")).removeprefix("v") for v in versions]
    return max((int(n) for n in numbers if n.isdigit()), default=None)


def deployed_version() -> int | None:
    version = latest_version()
    if version is None:
        return None
    try:
        step_function(0, version).hydrate()
    except modal.exception.NotFoundError:
        return None
    return version


def ensure_deployed() -> int:
    version = deployed_version()
    if version is None:
        subprocess.run(["modal", "deploy", __file__], check=True)
        version = deployed_version()
    if version is None:
        raise RuntimeError(f"no version to pin to: modal app history {APP_NAME}")
    return version


def stage_input(n: int) -> str:
    input_id = f"n-{n}"
    try:
        staged = bool(data.listdir(f"{input_id}/input.json"))
    except (FileNotFoundError, modal.exception.NotFoundError):
        staged = False
    if not staged:
        with data.batch_upload() as batch:
            blob = io.BytesIO(json.dumps({"n": n}).encode())
            batch.put_file(blob, f"{input_id}/input.json")
    return input_id


def trigger(n: int, app_version: int) -> str:
    pipeline = Pipeline(
        run_id=f"run-{uuid.uuid4().hex[:8]}",
        app_version=app_version,
        input_id=stage_input(n),
    )
    call = spawn_step(pipeline, 0)
    print(f"Started {pipeline.run_id} on v{pipeline.app_version}: {call.object_id}")
    return pipeline.run_id


def wait(run_id: str, timeout: int = 5 * MINUTES) -> Pipeline:
    deadline = time.time() + timeout
    while time.time() < deadline:
        pipeline = state.get(run_id)
        if pipeline is not None and pipeline.function_call_ids:
            if pipeline.done:
                return pipeline
            call_id = pipeline.function_call_ids[-1]
            try:
                modal.FunctionCall.from_id(call_id).get(timeout=0)
            except TimeoutError:
                pass
        time.sleep(1)
    raise TimeoutError(f"{run_id} did not finish in {timeout}s")


\`\`\`

The trace prints each step's key, so a rerun of the same input on the same code
shows the same keys.

\`\`\`python
def report(pipeline: Pipeline) -> None:
    print(f"\\n{pipeline.run_id} finished on v{pipeline.app_version}:")
    for step_num, call_id in enumerate(pipeline.function_call_ids):
        print(f"  {cache_key(pipeline, step_num)}  function_call={call_id}")
    final_key = cache_key(pipeline, len(STEPS) - 1)
    result = json.loads(b"".join(data.read_file(f"{final_key}/{STEPS[-1].output}")))
    print(f"  result: sum of {result['count']} squares = {result['total']}\\n")


@app.local_entrypoint()
def run(n: int = 10) -> None:
    app_version = ensure_deployed()
    report(wait(trigger(n, app_version)))

\`\`\`
`,meta:{title:`Orchestrate a multi-step pipeline with Modal Functions`,description:`Every step of this pipeline is a Modal Function that hands off to the next one, so you can run each stage with its own resources without standing up a separate orchestrator. A step looks up its successor by name with Function.from_name and starts it with Function.spawn.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Function.from_name</code>`),b=t(`<code>Function.spawn</code>`),x=t(`<!> <p>Every step of this pipeline is a Modal Function that hands off to the next one,
so you can run each stage with its own resources without standing up a separate orchestrator. A step looks up its successor by name
with <!> and starts it with <!>.</p> <p>The toy computation used here is to build a range of numbers, square them, and sum them. Each
step caches its output on a Volume, so a rerun skips work already done.</p> <p>Run it and see its trace:</p> <!> <p>Because the steps hand off by name against a pinned version, the App has to be
deployed before it runs. The entrypoint deploys it for you if it isn’t already,
but you can also deploy explicitly:</p> <!> <p>Run that again with the same <code>n</code> and every step hits the cache. Deploy again and
every step recomputes regardless of which step you edited because keys are constructed partly by App version,
which a deploy bumps for the whole App.</p> <!> <!> <p>A <!> holds each run’s trace and a <!> holds the input and the artifacts
steps pass along.</p> <!> <!> <p>A step skips work whose output is already on the Volume, so its key changes
whenever its output would. A key is constructed by the deployed App version
and the step’s inputs, which enter as its predecessor’s key. Chaining
the keys means both only have to enter once, at the seed.</p> <!> <!> <p>Whoever spawns a step stamps its call id onto the run, so the trace builds up as the
pipeline moves and always ends with the step that is currently pending. Every
hand-off goes through the one pinned lookup in <code>step_function</code>.</p> <!> <!> <p>The data for each step must be persisted to the Volume before the next step starts. <!> also
land every few seconds, but on their own schedule, so we run <code>Volume.commit()</code> manually before each hand-off. Committing doesn’t make the write atomic, so a crash
mid-write can still leave a corrupted artifact.</p> <!> <!> <p>The driver reads the version that’s live now, deploys if there isn’t one, and pins
the run to it. Note, version pinning is a <!>.</p> <!> <p>The trace prints each step’s key, so a rerun of the same input on the same code
shows the same keys.</p> <!>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`orchestrate-a-multi-step-pipeline-with-modal-functions`,children:(e,t)=>{l(),i(e,r(`Orchestrate a multi-step pipeline with Modal Functions`))},$$slots:{default:!0}});var h=c(p,2),g=c(e(h));m(g,{href:`https://modal.com/docs/guide/trigger-deployed-functions`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),m(c(g,2),{href:`https://modal.com/docs/guide/trigger-deployed-functions#invocation-patterns`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(h);var _=c(h,6);f(_,{code:`modal%20run%2009_job_queues%2Fpipeline_orchestration.py%20--n%2010`,lang:`bash`});var v=c(_,4);f(v,{code:`modal%20deploy%2009_job_queues%2Fpipeline_orchestration.py`,lang:`bash`});var S=c(v,4);u(S,{id:`set-up`,children:(e,t)=>{l(),i(e,r(`Set up`))},$$slots:{default:!0}});var C=c(S,2);f(C,{code:`import%20hashlib%0Aimport%20io%0Aimport%20json%0Aimport%20subprocess%0Aimport%20time%0Aimport%20uuid%0Afrom%20dataclasses%20import%20dataclass%2C%20field%0Afrom%20pathlib%20import%20Path%0Afrom%20typing%20import%20NamedTuple%0A%0Aimport%20modal%0A%0AAPP_NAME%20%3D%20%22example-pipeline-orchestration%22%0ADATA_DIR%20%3D%20Path(%22%2Fdata%22)%0AMINUTES%20%3D%2060%20%20%23%20seconds%0A%0Aapp%20%3D%20modal.App(APP_NAME)%0Aimage%20%3D%20modal.Image.debian_slim(python_version%3D%223.12%22).pip_install(%22numpy%3D%3D2.2.6%22)%0A%0Awith%20image.imports()%3A%0A%20%20%20%20import%20numpy%20as%20np%0A`,lang:`python`});var w=c(C,2),T=c(e(w));m(T,{href:`https://modal.com/docs/guide/dicts-and-queues`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Dict`))},$$slots:{default:!0}}),m(c(T,2),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Volume`))},$$slots:{default:!0}}),l(),n(w);var E=c(w,2);f(E,{code:`state%20%3D%20modal.Dict.from_name(f%22%7BAPP_NAME%7D-state%22%2C%20create_if_missing%3DTrue)%0Adata%20%3D%20modal.Volume.from_name(f%22%7BAPP_NAME%7D-data%22%2C%20create_if_missing%3DTrue)%0A%0A%0Aclass%20Step(NamedTuple)%3A%0A%20%20%20%20name%3A%20str%20%20%23%20the%20Function%20that%20runs%20it%0A%20%20%20%20output%3A%20str%20%20%23%20the%20artifact%20it%20leaves%20under%20its%20key%0A%0A%0ASTEPS%20%3D%20%5B%0A%20%20%20%20Step(%22build%22%2C%20%22numbers.npy%22)%2C%0A%20%20%20%20Step(%22square%22%2C%20%22squared.npy%22)%2C%0A%20%20%20%20Step(%22total%22%2C%20%22total.json%22)%2C%0A%5D%0A%0A%0A%40dataclass%0Aclass%20Pipeline%3A%0A%20%20%20%20run_id%3A%20str%20%20%23%20unique%20per%20execution%0A%20%20%20%20app_version%3A%20int%20%20%23%20deployed%20code%20version%20this%20run%20is%20pinned%20to%0A%20%20%20%20input_id%3A%20str%20%20%23%20identifies%20the%20input%20and%20names%20its%20directory%20on%20the%20Volume%0A%20%20%20%20function_call_ids%3A%20list%5Bstr%5D%20%3D%20field(default_factory%3Dlist)%20%20%23%20%60fc-%60%2C%20per%20step%0A%20%20%20%20done%3A%20bool%20%3D%20False%0A%0A`,lang:`python`});var D=c(E,2);u(D,{id:`construct-artifact-keys`,children:(e,t)=>{l(),i(e,r(`Construct artifact keys`))},$$slots:{default:!0}});var O=c(D,4);f(O,{code:`def%20cache_key(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20str%3A%0A%20%20%20%20key%20%3D%20f%22%7Bpipeline.input_id%7D%40v%7Bpipeline.app_version%7D%22%20%20%23%20the%20version%20seeds%20the%20chain%0A%20%20%20%20for%20step%20in%20STEPS%5B%3A%20step_num%20%2B%201%5D%3A%0A%20%20%20%20%20%20%20%20digest%20%3D%20hashlib.sha256(f%22%7Bstep.name%7D%2F%7Bkey%7D%22.encode()).hexdigest()%0A%20%20%20%20%20%20%20%20key%20%3D%20f%22%7Bstep.name%7D-%7Bdigest%5B%3A16%5D%7D%22%0A%20%20%20%20return%20key%0A%0A%0Adef%20artifact(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20Path%3A%0A%20%20%20%20return%20DATA_DIR%20%2F%20cache_key(pipeline%2C%20step_num)%20%2F%20STEPS%5Bstep_num%5D.output%0A%0A`,lang:`python`});var k=c(O,2);u(k,{id:`coordinate-work-handoff`,children:(e,t)=>{l(),i(e,r(`Coordinate work handoff`))},$$slots:{default:!0}});var A=c(k,4);f(A,{code:`def%20start_step(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20Path%3A%0A%20%20%20%20data.reload()%20%20%23%20a%20container%20only%20sees%20the%20Volume%20as%20of%20when%20it%20started%0A%20%20%20%20pipeline.function_call_ids.append(modal.current_function_call_id())%0A%0A%20%20%20%20out%20%3D%20artifact(pipeline%2C%20step_num)%0A%20%20%20%20out.parent.mkdir(parents%3DTrue%2C%20exist_ok%3DTrue)%0A%20%20%20%20status%20%3D%20%22cached%22%20if%20out.exists()%20else%20%22computing%22%0A%20%20%20%20print(f%22%5B%7BSTEPS%5Bstep_num%5D.name%7D%5D%20%7Bstatus%7D%20%7Bout.name%7D%22)%0A%20%20%20%20return%20out%0A%0A%0Adef%20step_function(step_num%3A%20int%2C%20app_version%3A%20int)%20-%3E%20modal.Function%3A%0A%20%20%20%20return%20modal.Function.from_name(APP_NAME%2C%20STEPS%5Bstep_num%5D.name%2C%20version%3Dapp_version)%0A%0A%0Adef%20spawn_step(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20modal.FunctionCall%3A%0A%20%20%20%20step%20%3D%20step_function(step_num%2C%20pipeline.app_version)%0A%20%20%20%20call%20%3D%20step.spawn(pipeline%2C%20step_num)%0A%20%20%20%20pipeline.function_call_ids.append(call.object_id)%0A%20%20%20%20state%5Bpipeline.run_id%5D%20%3D%20pipeline%0A%20%20%20%20return%20call%0A%0A%0Adef%20spawn_next(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20if%20step_num%20%2B%201%20%3E%3D%20len(STEPS)%3A%0A%20%20%20%20%20%20%20%20pipeline.done%20%3D%20True%0A%20%20%20%20%20%20%20%20state%5Bpipeline.run_id%5D%20%3D%20pipeline%0A%20%20%20%20%20%20%20%20print(%22%5Bdone%5D%22)%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20spawn_step(pipeline%2C%20step_num%20%2B%201)%0A%0A`,lang:`python`});var j=c(A,2);u(j,{id:`save-the-results`,children:(e,t)=>{l(),i(e,r(`Save the results`))},$$slots:{default:!0}});var M=c(j,2);m(c(e(M)),{href:`https://modal.com/docs/guide/volumes#background-commits`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Background commits`))},$$slots:{default:!0}}),l(3),n(M);var N=c(M,2);f(N,{code:`%40app.function(image%3Dimage%2C%20volumes%3D%7BDATA_DIR%3A%20data%7D)%0Adef%20build(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20out%20%3D%20start_step(pipeline%2C%20step_num)%0A%20%20%20%20if%20not%20out.exists()%3A%0A%20%20%20%20%20%20%20%20with%20open(DATA_DIR%20%2F%20pipeline.input_id%20%2F%20%22input.json%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20n%20%3D%20json.load(f)%5B%22n%22%5D%0A%20%20%20%20%20%20%20%20np.save(out%2C%20np.arange(1%2C%20n%20%2B%201))%0A%20%20%20%20%20%20%20%20data.commit()%0A%20%20%20%20spawn_next(pipeline%2C%20step_num)%0A%0A%0A%40app.function(image%3Dimage%2C%20volumes%3D%7BDATA_DIR%3A%20data%7D)%0Adef%20square(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20out%20%3D%20start_step(pipeline%2C%20step_num)%0A%20%20%20%20if%20not%20out.exists()%3A%0A%20%20%20%20%20%20%20%20numbers%20%3D%20np.load(artifact(pipeline%2C%20step_num%20-%201))%0A%20%20%20%20%20%20%20%20np.save(out%2C%20numbers**2)%0A%20%20%20%20%20%20%20%20data.commit()%0A%20%20%20%20spawn_next(pipeline%2C%20step_num)%0A%0A%0A%40app.function(image%3Dimage%2C%20volumes%3D%7BDATA_DIR%3A%20data%7D)%0Adef%20total(pipeline%3A%20Pipeline%2C%20step_num%3A%20int)%20-%3E%20None%3A%0A%20%20%20%20out%20%3D%20start_step(pipeline%2C%20step_num)%0A%20%20%20%20if%20not%20out.exists()%3A%0A%20%20%20%20%20%20%20%20%23%20Reaches%20back%20past%20%60square%60%20to%20also%20read%20what%20%60build%60%20wrote%2C%20by%20key.%0A%20%20%20%20%20%20%20%20squared%20%3D%20np.load(artifact(pipeline%2C%20step_num%20-%201))%0A%20%20%20%20%20%20%20%20numbers%20%3D%20np.load(artifact(pipeline%2C%200))%0A%20%20%20%20%20%20%20%20with%20open(out%2C%20%22w%22)%20as%20f%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20json.dump(%7B%22total%22%3A%20int(squared.sum())%2C%20%22count%22%3A%20numbers.size%7D%2C%20f)%0A%20%20%20%20%20%20%20%20data.commit()%0A%20%20%20%20spawn_next(pipeline%2C%20step_num)%0A%0A`,lang:`python`});var P=c(N,2);u(P,{id:`trigger-a-run-from-a-local-driver`,children:(e,t)=>{l(),i(e,r(`Trigger a run from a local driver`))},$$slots:{default:!0}});var F=c(P,2);m(c(e(F)),{href:`https://modal.com/docs/guide/trigger-deployed-functions#version-pinned-lookups`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Team and Enterprise feature`))},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);f(I,{code:`def%20latest_version()%20-%3E%20int%20%7C%20None%3A%0A%20%20%20%20history%20%3D%20subprocess.run(%0A%20%20%20%20%20%20%20%20%5B%22modal%22%2C%20%22app%22%2C%20%22history%22%2C%20APP_NAME%2C%20%22--json%22%5D%2C%20capture_output%3DTrue%2C%20text%3DTrue%0A%20%20%20%20)%0A%20%20%20%20versions%20%3D%20json.loads(history.stdout)%20if%20history.returncode%20%3D%3D%200%20else%20%5B%5D%0A%20%20%20%20numbers%20%3D%20%5Bstr(v.get(%22version%22%2C%20%22%22)).removeprefix(%22v%22)%20for%20v%20in%20versions%5D%0A%20%20%20%20return%20max((int(n)%20for%20n%20in%20numbers%20if%20n.isdigit())%2C%20default%3DNone)%0A%0A%0Adef%20deployed_version()%20-%3E%20int%20%7C%20None%3A%0A%20%20%20%20version%20%3D%20latest_version()%0A%20%20%20%20if%20version%20is%20None%3A%0A%20%20%20%20%20%20%20%20return%20None%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20step_function(0%2C%20version).hydrate()%0A%20%20%20%20except%20modal.exception.NotFoundError%3A%0A%20%20%20%20%20%20%20%20return%20None%0A%20%20%20%20return%20version%0A%0A%0Adef%20ensure_deployed()%20-%3E%20int%3A%0A%20%20%20%20version%20%3D%20deployed_version()%0A%20%20%20%20if%20version%20is%20None%3A%0A%20%20%20%20%20%20%20%20subprocess.run(%5B%22modal%22%2C%20%22deploy%22%2C%20__file__%5D%2C%20check%3DTrue)%0A%20%20%20%20%20%20%20%20version%20%3D%20deployed_version()%0A%20%20%20%20if%20version%20is%20None%3A%0A%20%20%20%20%20%20%20%20raise%20RuntimeError(f%22no%20version%20to%20pin%20to%3A%20modal%20app%20history%20%7BAPP_NAME%7D%22)%0A%20%20%20%20return%20version%0A%0A%0Adef%20stage_input(n%3A%20int)%20-%3E%20str%3A%0A%20%20%20%20input_id%20%3D%20f%22n-%7Bn%7D%22%0A%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20staged%20%3D%20bool(data.listdir(f%22%7Binput_id%7D%2Finput.json%22))%0A%20%20%20%20except%20(FileNotFoundError%2C%20modal.exception.NotFoundError)%3A%0A%20%20%20%20%20%20%20%20staged%20%3D%20False%0A%20%20%20%20if%20not%20staged%3A%0A%20%20%20%20%20%20%20%20with%20data.batch_upload()%20as%20batch%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20blob%20%3D%20io.BytesIO(json.dumps(%7B%22n%22%3A%20n%7D).encode())%0A%20%20%20%20%20%20%20%20%20%20%20%20batch.put_file(blob%2C%20f%22%7Binput_id%7D%2Finput.json%22)%0A%20%20%20%20return%20input_id%0A%0A%0Adef%20trigger(n%3A%20int%2C%20app_version%3A%20int)%20-%3E%20str%3A%0A%20%20%20%20pipeline%20%3D%20Pipeline(%0A%20%20%20%20%20%20%20%20run_id%3Df%22run-%7Buuid.uuid4().hex%5B%3A8%5D%7D%22%2C%0A%20%20%20%20%20%20%20%20app_version%3Dapp_version%2C%0A%20%20%20%20%20%20%20%20input_id%3Dstage_input(n)%2C%0A%20%20%20%20)%0A%20%20%20%20call%20%3D%20spawn_step(pipeline%2C%200)%0A%20%20%20%20print(f%22Started%20%7Bpipeline.run_id%7D%20on%20v%7Bpipeline.app_version%7D%3A%20%7Bcall.object_id%7D%22)%0A%20%20%20%20return%20pipeline.run_id%0A%0A%0Adef%20wait(run_id%3A%20str%2C%20timeout%3A%20int%20%3D%205%20*%20MINUTES)%20-%3E%20Pipeline%3A%0A%20%20%20%20deadline%20%3D%20time.time()%20%2B%20timeout%0A%20%20%20%20while%20time.time()%20%3C%20deadline%3A%0A%20%20%20%20%20%20%20%20pipeline%20%3D%20state.get(run_id)%0A%20%20%20%20%20%20%20%20if%20pipeline%20is%20not%20None%20and%20pipeline.function_call_ids%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20pipeline.done%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%20pipeline%0A%20%20%20%20%20%20%20%20%20%20%20%20call_id%20%3D%20pipeline.function_call_ids%5B-1%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20modal.FunctionCall.from_id(call_id).get(timeout%3D0)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20TimeoutError%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20pass%0A%20%20%20%20%20%20%20%20time.sleep(1)%0A%20%20%20%20raise%20TimeoutError(f%22%7Brun_id%7D%20did%20not%20finish%20in%20%7Btimeout%7Ds%22)%0A%0A`,lang:`python`}),f(c(I,4),{code:`def%20report(pipeline%3A%20Pipeline)%20-%3E%20None%3A%0A%20%20%20%20print(f%22%5Cn%7Bpipeline.run_id%7D%20finished%20on%20v%7Bpipeline.app_version%7D%3A%22)%0A%20%20%20%20for%20step_num%2C%20call_id%20in%20enumerate(pipeline.function_call_ids)%3A%0A%20%20%20%20%20%20%20%20print(f%22%20%20%7Bcache_key(pipeline%2C%20step_num)%7D%20%20function_call%3D%7Bcall_id%7D%22)%0A%20%20%20%20final_key%20%3D%20cache_key(pipeline%2C%20len(STEPS)%20-%201)%0A%20%20%20%20result%20%3D%20json.loads(b%22%22.join(data.read_file(f%22%7Bfinal_key%7D%2F%7BSTEPS%5B-1%5D.output%7D%22)))%0A%20%20%20%20print(f%22%20%20result%3A%20sum%20of%20%7Bresult%5B'count'%5D%7D%20squares%20%3D%20%7Bresult%5B'total'%5D%7D%5Cn%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20run(n%3A%20int%20%3D%2010)%20-%3E%20None%3A%0A%20%20%20%20app_version%20%3D%20ensure_deployed()%0A%20%20%20%20report(wait(trigger(n%2C%20app_version)))%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=BZs7Joor.js.map
