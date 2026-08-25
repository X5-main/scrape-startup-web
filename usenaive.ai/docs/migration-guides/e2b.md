> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from E2B to Naive

> Move agent code execution from an E2B sandbox account to Naive's compute primitive — the same run-untrusted-code-in-an-isolated-cloud-container capability, but the container, its secrets, and its shell all live under one governed identity that also owns the agent's email, cards, and vault, and every exec is approval-gated and transcript-logged.

<Frame caption="E2B sandboxes → the Naive compute primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/e2b-light.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=00888b0052403bd3b29afee1a20a88f9" alt="E2B" height="28" data-path="migration-guides/logos/e2b-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/fqmboaBqXt44Y7w1/migration-guides/logos/e2b-dark.svg?fit=max&auto=format&n=fqmboaBqXt44Y7w1&q=85&s=96169b202d8ee4a06b752d13eb802af0" alt="E2B" height="28" data-path="migration-guides/logos/e2b-dark.svg" />
</Frame>

[E2B](https://e2b.dev/docs) gives an AI agent a real, isolated Linux box in the cloud: call
`Sandbox.create()`, then run shell commands, execute model-generated code, and read/write files —
all in a container that is firewalled from your own infrastructure. It does that job well, the
spin-up is fast, and the SDK is mature. But the sandbox is also a *separate vendor account*:

* Every sandbox lives behind an **`E2B_API_KEY`**, its own dashboard, and its own billing —
  disconnected from wherever the agent's email, cards, secrets, and KYC live.
* The key is **all-or-nothing**: anything holding it can spawn a box and `commands.run()` arbitrary
  shell. There is no per-action gate — no "this agent may *run* code but a human must approve a
  *shell session*."
* "Who let this agent execute that, and what *else* can it touch?" is answered in E2B for sandboxes,
  and in unrelated systems for everything else. The box has no shared accountability with the rest
  of the agent's footprint.

Naive's [`compute`](/docs/getting-started/compute) primitive gives the agent the **same** capability —
an isolated cloud container it can `exec` into and run code in — but the workload is **rooted in one
governed identity**:

* The [tenant user](/docs/getting-started/users) that owns the workload is the same user that owns its
  [email inboxes](/docs/getting-started/email), its [cards](/docs/getting-started/cards), its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* The agent **never holds a cloud key**. Naive owns the underlying cloud credentials and scopes
  every task to your tenant — the same model as [Apps](/docs/getting-started/apps).
* Whether an agent may spin up a workload at all, and whether opening a **shell** (`exec`/`ssh`)
  freezes for human approval, is decided by that user's [Account Kit](/docs/getting-started/account-kits)
  **at execution time** — and every shell session is transcript-logged.

This guide maps E2B's sandbox model to Naive's compute primitive, shows the smallest working swap,
and is explicit about what does not map yet — and E2B's code-interpreter and filesystem APIs are
the parts to read carefully.

<Note>
  E2B is a trademark of its owner, used here for identification only. No endorsement or affiliation is implied.
</Note>

<Info>
  **Tested against:** the E2B JavaScript SDK [`e2b`](https://www.npmjs.com/package/e2b) **v2.30.x**
  (`Sandbox.create`, `sandbox.commands.run`, `sandbox.files.*`, `sandbox.getHost`, `sandbox.kill`;
  base `https://api.e2b.dev`) and the code-interpreter SDK
  [`@e2b/code-interpreter`](https://www.npmjs.com/package/@e2b/code-interpreter) (`sandbox.runCode`)
  — docs snapshot June 2026 — and the Naive Node SDK [`@usenaive-sdk/server`](/docs/sdk/overview) against
  the Naive API (base `https://api.usenaive.ai/v1`, docs snapshot June 2026).

  Version notes:

  * E2B ships **two** packages: base [`e2b`](https://www.npmjs.com/package/e2b)
    (`Sandbox` + `commands` + `files`) and [`@e2b/code-interpreter`](https://www.npmjs.com/package/@e2b/code-interpreter)
    (adds `runCode()`, a stateful Jupyter-style kernel with rich outputs). Naive maps the
    `commands.run` / exec-a-process model; the `runCode` kernel **does not map yet** — see
    [what doesn't map yet](#what-does-not-map-yet).
  * E2B's unit is an **ephemeral sandbox** with a default **5-minute timeout** (max 1h Hobby / 24h
    Pro), spun up from a **template** (the `base` image, or a custom one built with the E2B CLI).
    Naive's unit is a **workload** built from **any Docker image you bring** — a long-running
    `service`, a run-to-completion `job`, or a cron `schedule` — with **no template build step**.
  * E2B identifies a box by its **`sandboxId`** and can **pause/resume** to preserve full
    memory+filesystem state. Naive identifies a workload by its **id** and offers **scale-to-zero**
    (`stop`/`start`), which is *not* a memory snapshot — see [gaps](#what-does-not-map-yet).
  * On Naive, **creating a workload and `exec`/`ssh` are sensitive** — depending on the user's
    Account Kit they may return `{ status: "pending_approval", approval_id }`. E2B has no equivalent
    execution-time gate.
</Info>

## Concept map

| E2B                                                                                  | Naive                                                                                          | Notes                                                                                                                                                    |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Sandbox()` behind `E2B_API_KEY` — one account, isolated from your other vendors | `naive.forUser(id).compute` — scopes **every** primitive                                       | The core consolidation win                                                                                                                               |
| `E2B_API_KEY` held by your code; the box runs *your* cloud trust                     | Agent **never holds a cloud key** — Naive owns the cloud creds, scopes to your tenant          | Same model as [Apps](/docs/getting-started/apps)                                                                                                              |
| **Template** (`base`, or a custom one built via `e2b template build`)                | Any **Docker image** passed to `create({ image })` — no build step                             | Bring `python:3.12-slim`, your own image, anything                                                                                                       |
| `Sandbox.create({ timeoutMs, envs })` → `sandboxId`                                  | `client.compute.create({ name, type: "service", image })` → workload id                        | `service` = long-running box you exec into                                                                                                               |
| `sandbox.commands.run("ls -la")` → `{ stdout, stderr, exitCode }`                    | `client.compute.exec(id, "ls -la")` → exec session                                             | **exec is approval-gated + transcript-logged** on Naive; connect to the returned session for output — see [Compute API](/docs/api-reference/compute/overview) |
| Interactive use over the SDK                                                         | `client.compute.shell(id)` → `{ sessionId, streamUrl, tokenValue }` / `naive compute ssh <id>` | Managed exec channel (no port 22, no keys)                                                                                                               |
| `sandbox.runCode("…")` (code-interpreter kernel, rich outputs)                       | (none)                                                                                         | No built-in code interpreter — bake a runtime into the image + `exec` — see [gaps](#what-does-not-map-yet)                                               |
| `sandbox.files.write / read / list`                                                  | (none structured)                                                                              | No filesystem API — `exec` `cat`/redirect, or bake files into the image — see [gaps](#what-does-not-map-yet)                                             |
| `sandbox.getHost(port)` → public host                                                | `create({ type: "service", port })` → public HTTPS URL                                         | Long-running service can expose a port                                                                                                                   |
| `Sandbox.create({ envs })`                                                           | `client.compute.setSecret(id, "KEY", "val")` + `listSecrets(id)`                               | Encrypted env vars injected at start (auto-redeploys)                                                                                                    |
| `sandbox.kill()` (permanent delete)                                                  | `client.compute.destroy(id)`                                                                   | Tear the workload down                                                                                                                                   |
| `sandbox.pause()` / `Sandbox.connect(id)` (memory+fs snapshot)                       | `client.compute.stop(id)` / `start(id)` (scale to zero)                                        | Stop stops billing; it is **not** a memory snapshot — see [gaps](#what-does-not-map-yet)                                                                 |
| `sandbox.setTimeout(ms)` / `timeoutMs` auto-kill                                     | (none)                                                                                         | Services run until you `stop`/`destroy`; jobs run to completion                                                                                          |
| (none — you schedule sandboxes yourself)                                             | `create({ type: "schedule", schedule_expr: "cron(...)" })`                                     | "Cron for code" — a Naive **gain**                                                                                                                       |
| Run-to-completion script (you spin up + kill)                                        | `create({ type: "job", command })` + `run(id)` + `runs(id)`                                    | First-class one-shot job with run history                                                                                                                |
| `Sandbox.list()`                                                                     | `client.compute.list()` / `get(id)`                                                            | Workloads for the identity                                                                                                                               |
| `sandbox.getInfo()` / logs you collect                                               | `client.compute.logs(id, { limit })`                                                           | Per-workload logs                                                                                                                                        |
| E2B CLI `e2b sandbox list` / `connect <id>`                                          | `naive compute list` / `naive compute ssh <id>`                                                |                                                                                                                                                          |
| `e2b template build` (Dockerfile → template)                                         | Push any image to a registry; pass `image`                                                     | No template lifecycle to manage                                                                                                                          |
| API key scopes *E2B only*                                                            | **Account Kit** gates `compute` + every primitive, with `requiresApproval`                     | Execution-time policy on the identity — see [gains](#gain-2-execution-time-permission-enforcement)                                                       |
| `sandbox.pty` interactive PTY, `sandbox.git` module                                  | `exec` / `ssh` only                                                                            | No structured pty/git modules — see [gaps](#what-does-not-map-yet)                                                                                       |
| Sub-second spin-up from a warm template                                              | Image-deploy cold start                                                                        | Different performance profile — see [gaps](#what-does-not-map-yet)                                                                                       |
| Metadata on a sandbox                                                                | (track your own against the workload id)                                                       | Not exposed                                                                                                                                              |

## Before / after: the core path

The path that matters for almost every code-running agent is *get an isolated box, run a command,
read the output back, tear it down*. Here it is on both platforms.

<CodeGroup>
  ```ts E2B theme={"theme":"css-variables"}
  import { Sandbox } from "e2b"; // needs E2B_API_KEY

  // Spin up an ephemeral box from a template (default 5-min timeout)
  const sandbox = await Sandbox.create({ timeoutMs: 300_000 });

  // Run a shell command — anything holding the key can do this
  const res = await sandbox.commands.run('python3 -c "print(2 + 2)"');
  console.log(res.stdout); // "4\n"

  await sandbox.kill();
  // → the box is an island behind your E2B account + key. No per-action gate,
  //   and no shared identity with the agent's email, cards, or vault.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("acme"); // same id space as your own users

  // A long-running container from ANY Docker image. The agent holds no cloud key.
  const box = await client.compute.create({
    name: "runner",
    type: "service",
    image: "python:3.12-slim",
    command: ["sleep", "infinity"], // keep it alive so we can exec into it
  });

  // exec is approval-gated by default and transcript-logged.
  // Returns a managed exec session — connect for command output; it is not inline stdout.
  const session = await client.compute.exec(box.id, 'python3 -c "print(2 + 2)"');
  // → { sessionId, streamUrl, tokenValue } (shape per SDK) — use streamUrl + tokenValue to read output

  await client.compute.destroy(box.id);
  // → the SAME `client` also owns this user's email, cards, vault, and KYC.
  ```
</CodeGroup>

The shape is close — *get a box, run a process, read output via the exec channel* — but the real differences to plan for:

* **You bring the image; you hold no key.** E2B spins up from a *template* under your `E2B_API_KEY`.
  Naive runs **any Docker image** you pass, on cloud credentials it owns — the agent never holds a
  cloud key.
* **The box is long-running, not auto-killed.** An E2B sandbox auto-kills at its `timeoutMs`. A
  Naive `service` runs until you `stop` (scale to zero) or `destroy` it. Use a `job` for
  run-to-completion work.
* **`exec` is a governed action.** A `commands.run` in E2B is ungated. On Naive, `exec`/`ssh` is
  sensitive: depending on the Account Kit it may return `pending_approval` and is transcript-logged.
* **The id is your identity, not a separate account.** In E2B the key scopes *E2B*. In Naive the
  same `forUser(id)` handle also owns the agent's email, cards, vault, and KYC.

## The workflow that actually changes: running model-generated code

This is where the two models diverge most. E2B's headline is the **code interpreter**:
`runCode()` executes a snippet in a stateful kernel and hands back rich outputs (stdout, results,
charts). Naive has **no code-interpreter kernel** — you run code by `exec`-ing a process inside an
image that already has the runtime. The capability (*run untrusted, model-generated code in an
isolated box*) maps; the ergonomics differ.

<CodeGroup>
  ```ts E2B (code-interpreter kernel) theme={"theme":"css-variables"}
  import { Sandbox } from "@e2b/code-interpreter";

  const sandbox = await Sandbox.create();

  // Stateful kernel: variables persist across runCode calls; rich outputs returned
  const exec = await sandbox.runCode(`
  import numpy as np
  print(np.arange(5).sum())
  `);
  console.log(exec.logs.stdout); // ["10\n"]
  // exec.results can include charts/images/dataframes

  await sandbox.kill();
  ```

  ```ts Naive (exec a process in your image) theme={"theme":"css-variables"}
  // Use an image that already has the runtime (e.g. a Jupyter/numpy image),
  // then exec the model-generated snippet as a process.
  const box = await client.compute.create({
    name: "py-runner",
    type: "service",
    image: "jupyter/scipy-notebook:latest", // numpy etc. preinstalled
    command: ["sleep", "infinity"],
  });

  const code = "import numpy as np; print(np.arange(5).sum())";
  const session = await client.compute.exec(box.id, `python3 -c ${JSON.stringify(code)}`);
  // Connect to session.streamUrl with session.tokenValue to capture process output.

  // No stateful kernel and no structured chart/result objects — capture text
  // from the exec stream (or write artifacts to a mounted store and read them back yourself).
  await client.compute.destroy(box.id);
  ```
</CodeGroup>

* **No stateful kernel.** Each `exec` is a fresh process — variables do not persist between calls
  the way they do across `runCode` invocations. Hold state in the image's filesystem or an external
  store.
* **No rich result objects.** `runCode` returns structured results (charts, dataframes); `exec`
  returns a managed session — read process output from the stream. If you rely on inline charts/images, that is a [gap](#what-does-not-map-yet).
* **The win is custody, not ergonomics.** The runtime, its secrets, and its shell now live under
  one identity with execution-time approval and a unified log — not behind a standalone key.

## Minimal viable migration

The smallest swap that keeps a working code-running agent alive is *get a box → run a command →
read output → tear down*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
    You can drop `E2B_API_KEY` for this path.
  </Step>

  <Step title="Pick an image instead of a template">
    Replace the E2B template with a Docker image that has your runtime
    (`python:3.12-slim`, `node:22-slim`, or your own). Push custom images to a registry and pass
    them as `image`. There is **no template build step** to manage.
  </Step>

  <Step title="Swap sandbox creation">
    Replace `Sandbox.create({ timeoutMs })` with
    `client.compute.create({ name, type: "service", image, command: ["sleep", "infinity"] })`.
    Keep the returned workload `id`. (Use `type: "job"` with a `command` for run-to-completion work.)
  </Step>

  <Step title="Swap command execution">
    Map `sandbox.commands.run(cmd)` → `client.compute.exec(id, cmd)`. Handle a possible
    `pending_approval` result if the Account Kit gates exec, then connect to the returned exec
    session for output. For an interactive session use
    `client.compute.shell(id)` (or `naive compute ssh <id>`).
  </Step>

  <Step title="Swap teardown">
    Replace `sandbox.kill()` with `client.compute.destroy(id)`. For a box you want to reuse cheaply,
    `client.compute.stop(id)` scales it to zero (billing stops) and `start(id)` wakes it.
  </Step>

  <Step title="Ship it">
    At this point you are off E2B for the core get-box → run → read → teardown path. Everything below
    is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In E2B, the API key isolates **sandboxes and nothing
else**, and any code the agent runs executes behind a key with no per-action gate. On Naive, the
unit of isolation is a **tenant user**, and compute is one of many primitives that identity owns.

<CodeGroup>
  ```ts E2B (sandboxes only) theme={"theme":"css-variables"}
  // One key (or org) isolates sandboxes — and only those.
  const sandbox = await Sandbox.create({
    // E2B_API_KEY in the environment
    envs: { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
  });
  await sandbox.commands.run("python3 analyze.py");

  // The card, the vault secrets, the email inbox, and the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy — and any
  // secret you injected into the box is one you manage and rotate yourself.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: dbCustomer.id,
    email: dbCustomer.email,
  });

  const client = naive.forUser(acme.id);

  // Run code, with secrets injected from the same identity's encrypted store:
  const box = await client.compute.create({ name: "runner", type: "service", image: "python:3.12-slim", command: ["sleep", "infinity"] });
  await client.compute.setSecret(box.id, "OPENAI_API_KEY", "sk-...");
  await client.compute.exec(box.id, "python3 analyze.py");

  // The SAME client owns this customer's email inbox, card, vault, and KYC —
  // one identity, isolated end to end.
  await client.email.createInbox({ local_part: "agent" });
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With E2B, the agent's sandboxes are an island behind an API key, and any secret you inject is one
  you store, rotate, and protect yourself. With Naive, `naive.forUser(acme.id)` is a single handle
  to **compute *and* email *and* cards *and* vault *and* KYC**.
* The container's secrets are not loose env vars — they are encrypted under the identity that owns
  everything else. Tear the customer down from one place; sibling tenants can never read each
  other's workloads, secrets, cards, or logs.

### Gain #2 — execution-time permission enforcement

* Whether an agent may run compute at all, and whether opening a **shell** freezes for human review,
  is **policy on the identity** — not a key scope you manage in a second console, and not a check
  you hand-write.

```ts theme={"theme":"css-variables"}
// A starter tier: agents may run jobs, but opening a shell must be approved by a human.
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    compute: { enabled: true, requiresApproval: true }, // exec/shell freezes for approval
    cards: { enabled: false },                            // no card for this tier
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);
```

* The agent's code is identical for every tier — `client.compute.exec(...)`,
  `client.compute.create(...)`. Whether the call runs is decided at execution time:
  * **Creating a workload and `exec`/`ssh` are sensitive.** With approval on, the call returns
    `{ status: "pending_approval", approval_id }` and runs only after a human
    [approves](/docs/getting-started/approvals) it.
  * **The agent holds no cloud key.** Naive owns the underlying cloud credentials; the workload is
    scoped to your tenant, so a leaked agent key can't spawn boxes on your raw cloud account.
  * **Shell access is transcript-logged** over a managed exec channel (no port 22, no SSH keys).

### Gain #3 — unified accountability

* Every workload, run, exec, and shell session for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their email, card, vault, and KYC events, not
  in a separate E2B dashboard:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent run, for whom?" — compute, email, cards, vault, one timeline
```

* That is the question that is hard to answer when code execution lives in E2B, secrets live in your
  own manager, cards live in Stripe, and email lives somewhere else. Under Naive it is a single query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (create → exec → read →
teardown), secrets, jobs, schedules, and a public-port service map cleanly. But the following E2B
capabilities have **no direct equivalent** on Naive's compute primitive today — and a couple are
central to how many teams use E2B. Check this list against your app before you commit.

| E2B feature                                                                          | Status on Naive                                                 | Workaround                                                                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Code interpreter** `runCode()` — stateful Jupyter-style kernel                     | Not provided                                                    | Bake the runtime into an image and `exec` the snippet as a process (no persistent kernel)  |
| **Rich execution results** (charts/images/dataframes from `runCode`)                 | Not provided                                                    | Write artifacts to a store and read them back; `exec` returns a session, not inline stdout |
| **Filesystem API** (`files.write` / `read` / `list` / watch / upload+download URLs)  | No structured API                                               | `exec` `cat`/redirect, bake files into the image, or use a mounted store                   |
| **Pause / resume snapshots** (`pause()` + `Sandbox.connect`, full memory+fs restore) | Scale-to-zero (`stop`/`start`) only — **not** a memory snapshot | Persist state to a store; `stop` frees billing but resets in-container state               |
| **Per-sandbox auto-kill timeout** (`timeoutMs` / `setTimeout`)                       | Not provided                                                    | Services run until `stop`/`destroy`; jobs run to completion                                |
| **Sub-second spin-up** from a warm template                                          | Image-deploy cold start                                         | Keep a `service` warm (scale-to-zero between bursts)                                       |
| **`pty`** interactive pseudo-terminal / **`git`** SDK module                         | `exec` / `ssh` only                                             | Run `git` via `exec`; no structured pty/git API                                            |
| **Sandbox metadata** / `getInfo` fields                                              | Not exposed                                                     | Track your own metadata against the workload id                                            |
| **Custom templates via `e2b template build`**                                        | Bring any Docker image directly                                 | Push to a registry and pass `image` (this is usually simpler)                              |

<Warning>
  If your agent depends on E2B's **code-interpreter kernel** (`runCode` with persistent state and
  rich chart/result objects), its **filesystem API**, or **pause/resume memory snapshots**, those are
  the gaps most likely to block a clean migration — Naive's compute is a **Docker-image workload you
  `exec` into**, not a stateful interpreter with a filesystem SDK. If the interpreter kernel is the
  core of your product, keep E2B for that path and adopt Naive compute for the workloads that fit. The
  flip side is the gain: the container, its secrets, and its shell are governed by the *same* identity
  and Account Kit as the rest of the agent — with execution-time approval and a unified audit trail —
  not a standalone account behind an all-or-nothing key.
</Warning>

## Where to go next

* [`compute` primitive](/docs/getting-started/compute) — service / job / schedule, secrets, logs, shell
* [`compute` SDK sub-client](/docs/sdk/sub-clients/compute) — typed method signatures
* [`compute` CLI](/docs/cli/compute) — create / run / logs / ssh / exec
* [Queue](/docs/getting-started/queue) — pair a `service` with a queue for a cheap autoscaling worker
* [Apps](/docs/getting-started/apps) — the same "agent never holds a cloud key" model for managed infra
* [Account Kits](/docs/getting-started/account-kits) and [Approvals](/docs/getting-started/approvals) — the policy model behind execution-time governance and exec approval
* [Tenant users](/docs/getting-started/users) — the identity that owns the compute, email, cards, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Data Pipeline Platform](https://usenaive.ai/blog/how-to-build-an-agentic-data-pipeline-platform) — compute + queue tutorial
