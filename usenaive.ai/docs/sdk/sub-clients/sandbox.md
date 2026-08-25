> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# sandbox

> Disposable micro-VM code sandboxes — exec, files, ports, checkpoint, fork, park/sleep & resume. Usage billed from credits.

```ts theme={"theme":"css-variables"}
// Create — boots in seconds; billed for observed usage from your credits.
// May return { status: "pending_approval" } depending on the Account Kit.
const { sandbox, rates } = await naive.sandbox.create({ name: "scratch", size: "s" });

// Run shell commands; may require approval
const out = await naive.sandbox.exec(sandbox.sandbox_id, "python3 -c 'print(40 + 2)'");
// { exit_code: 0, stdout: "42\n", stderr: "" }

// Files in, files out (utf-8 default; pass { encoding: "base64" } for binary)
await naive.sandbox.writeFile(sandbox.sandbox_id, "/app/main.py", "print(40 + 2)");
await naive.sandbox.readFile(sandbox.sandbox_id, "/app/main.py");
await naive.sandbox.ls(sandbox.sandbox_id, "/app");      // { entries: [{ name, type }] }
await naive.sandbox.mkdir(sandbox.sandbox_id, "/app/data"); // mkdir -p
await naive.sandbox.rm(sandbox.sandbox_id, "/app/tmp");     // rm -rf (no-op when absent)

// Expose a guest port at a public URL (http default, tcp supported); may require approval
const { url } = await naive.sandbox.expose(sandbox.sandbox_id, 8000);
await naive.sandbox.ports(sandbox.sandbox_id);   // list exposed ports (doesn't wake it)
await naive.sandbox.unexpose(sandbox.sandbox_id, 8000);

// Checkpoint the whole machine (disk + memory + connections) & fork it
const cp = await naive.sandbox.checkpoint(sandbox.sandbox_id, { name: "golden" });
const fork = await naive.sandbox.fork(sandbox.sandbox_id, { name: "variant-b" }); // may require approval

// Park (free; explicit resume), sleep (free; wakes on traffic/exec), resume
await naive.sandbox.park(sandbox.sandbox_id);
await naive.sandbox.resume(sandbox.sandbox_id);
await naive.sandbox.sleep(sandbox.sandbox_id);
await naive.sandbox.sleep(sandbox.sandbox_id, { wakeAt: "2026-08-04T09:00:00Z" }); // scheduled wake

await naive.sandbox.status();  // configured? count + sizes + usage rates
await naive.sandbox.list();
await naive.sandbox.get(sandbox.sandbox_id);
await naive.sandbox.destroy(sandbox.sandbox_id); // stops billing
```

Per-user and AccountKit-gated: `naive.sandbox` (account default agent profile) or `naive.forUser(id).sandbox`. Billed for observed CPU/memory/disk while running plus a one-time creation fee per size (`s` | `m` ceilings; `memoryGib`/`diskGib` overrides) — sleeping and parked sandboxes are free, and running out of credits auto-destroys the sandbox. The scratch-work counterpart to [compute](/docs/sdk/sub-clients/compute). See the [Sandbox guide](/docs/getting-started/sandbox).
