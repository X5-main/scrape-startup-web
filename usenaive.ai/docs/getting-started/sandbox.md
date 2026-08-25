> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox

> Disposable, isolated micro-VM code sandboxes — run shell commands, read/write files, expose ports, checkpoint, fork, park & resume. Usage billed from your credits.

The **Sandbox** primitive gives any agent a disposable, isolated Linux micro-VM. Create it in one call, `exec` shell commands, read and write files, expose ports at public URLs, checkpoint the entire machine state (disk + memory + open connections), fork copies of it, and destroy it when done. Naïve owns the compute vendor account and scopes every sandbox to your tenant — your agents never hold a vendor key (the same operator-key model as [Compute](/docs/getting-started/compute) and [Mobile](/docs/getting-started/mobile)).

<Info>
  Sandboxes are **usage billed from your credits**: you pay for the CPU, memory, and disk the sandbox *actually uses* while running, plus a small one-time creation fee per size. **Sleeping and parked sandboxes are free.** Running out of credits auto-destroys the sandbox, as does the max-runtime failsafe. Creating/forking a sandbox, running commands, and publishing a guest port to the public internet (`create`/`fork`/`exec`/`expose`) are **sensitive** — depending on the user's Account Kit they may require human approval (`status: "pending_approval"`).
</Info>

## Create a sandbox & run code

```ts theme={"theme":"css-variables"}
// Create — boots in seconds; billed for observed usage from your credits.
const { sandbox, rates } = await naive.sandbox.create({ name: "scratch", size: "s" });

// Run shell commands
const out = await naive.sandbox.exec(sandbox.sandbox_id, "python3 -c 'print(40 + 2)'");
// { exit_code: 0, stdout: "42\n", stderr: "" }

// Done? Destroy — this stops all billing.
await naive.sandbox.destroy(sandbox.sandbox_id);
```

Scope follows the client you hold: `naive.sandbox.*` (your default user) vs `naive.forUser(id).sandbox.*` (an end-user). Each tenant only ever sees the sandboxes it created through Naïve, and each tenant's credits fund only its own sandboxes.

## Sizes (ceilings, not reservations)

`size` sets the resource ceiling — billing always follows what the sandbox actually uses:

| Size          | vCPU | Memory (up to) | Disk (up to) |
| ------------- | ---- | -------------- | ------------ |
| `s`           | 1    | 16 GiB         | 32 GiB       |
| `m` (default) | 4    | 32 GiB         | 128 GiB      |

You can also override the memory/disk ceilings with `memoryGib` / `diskGib` within the size's range.

## Files in, files out

```ts theme={"theme":"css-variables"}
await naive.sandbox.writeFile(sandbox.sandbox_id, "/app/server.py", code);
const file = await naive.sandbox.readFile(sandbox.sandbox_id, "/app/out.json");
// Binary content? Pass { encoding: "base64" } on either call.

await naive.sandbox.ls(sandbox.sandbox_id, "/app");         // list a directory
await naive.sandbox.mkdir(sandbox.sandbox_id, "/app/data"); // mkdir -p
await naive.sandbox.rm(sandbox.sandbox_id, "/app/tmp");     // rm -rf
```

## Expose ports

Serve HTTP (or raw TCP) straight from the sandbox at a public URL:

```ts theme={"theme":"css-variables"}
await naive.sandbox.exec(sandbox.sandbox_id, "python3 -m http.server 8000 &");
const { url } = await naive.sandbox.expose(sandbox.sandbox_id, 8000); // may require approval
// -> https://…  reachable from the internet
await naive.sandbox.ports(sandbox.sandbox_id);   // list exposed ports
await naive.sandbox.unexpose(sandbox.sandbox_id, 8000);
```

## Checkpoint & fork

A checkpoint captures the entire machine — disk, memory, and open connections — without stopping it. Fork starts a NEW sandbox from a checkpoint (bills like create):

```ts theme={"theme":"css-variables"}
const cp = await naive.sandbox.checkpoint(sandbox.sandbox_id);
const { sandbox: variant } = await naive.sandbox.fork(sandbox.sandbox_id, { name: "variant-b" });
```

Use it to try N approaches in parallel from the same prepared state, or to keep a golden image of an expensive setup.

## Park, sleep & resume (free idle)

* **Park** checkpoints and stops the sandbox (and its meter) until an explicit `resume`.
* **Sleep** idles it — it wakes transparently on ingress traffic, the next `exec`, or an optional scheduled `wakeAt`.

```ts theme={"theme":"css-variables"}
await naive.sandbox.park(sandbox.sandbox_id);    // status: "parked" — free
await naive.sandbox.resume(sandbox.sandbox_id);  // status: "running" — metered again
await naive.sandbox.sleep(sandbox.sandbox_id);   // status: "sleeping" — free, wakes on demand
await naive.sandbox.sleep(sandbox.sandbox_id, { wakeAt: "2026-08-04T09:00:00Z" }); // scheduled wake
```

Use them to keep state between agent sessions without paying for idle time.

## Lifecycle & status

```ts theme={"theme":"css-variables"}
await naive.sandbox.status();                    // configured? your count + sizes + usage rates
await naive.sandbox.list();                      // your sandboxes
await naive.sandbox.get(sandbox.sandbox_id);     // one sandbox + metered credits
await naive.sandbox.destroy(sandbox.sandbox_id); // tear down (un-checkpointed state is lost)
```

## Billing & failsafes

* **Observed usage** while `running` — CPU, memory, and disk actually used, metered every minute from the same credit balance as every other primitive, plus a one-time creation fee per size. `naive.sandbox.status()` returns the current per-hour rates.
* **Sleeping/parked is free** — the checkpoint persists, the VM does not bill.
* **Auto-destroy** — a sandbox is destroyed automatically when your credits run out or when it exceeds the max-runtime cap; the sandbox record keeps the reason in `error`.

## Sandbox vs Compute

[`/compute`](/docs/getting-started/compute) runs your own Docker images as long-lived services, jobs, and schedules. `/sandbox` is for scratch work: an instant disposable machine for running generated or untrusted code — no image to build, no deploy step.

## Other surfaces

* CLI: [`naive sandbox`](/docs/cli/sandbox)
* SDK: [`naive.sandbox`](/docs/sdk/sub-clients/sandbox)
* MCP: `naive_sandbox_create`, `naive_sandbox_exec`, `naive_sandbox_write_file`, `naive_sandbox_read_file`, `naive_sandbox_expose`, `naive_sandbox_checkpoint`, `naive_sandbox_fork`, `naive_sandbox_park`, `naive_sandbox_sleep`, `naive_sandbox_resume`, `naive_sandbox_destroy`, …
* API: [Sandbox API reference](/docs/api-reference/sandbox/overview)
* IaC: grant it in an AccountKit with the `sandbox` skill (approve `sandbox.create` / `sandbox.fork` / `sandbox.exec` as needed)
