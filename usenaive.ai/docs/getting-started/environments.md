> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Environments

> Sandbox and production: same config, two modes. Promote/demote, per-stamp budgets, and trajectories as promotion evidence.

**Same config, two modes.** Every operator runs in exactly one **environment** at
a time, and it starts in **sandbox**. Environments is how you prove an agent
before you let it touch the real world — without maintaining a separate config,
a separate kit, or a separate deployment.

## The two modes

<CardGroup cols={2}>
  <Card title="sandbox (default)" icon="flask">
    Mock and staging behavior, merged. **No real-world effect is possible.** Guarded
    actions run through per-primitive sandbox adapters (synthetic cards, paper
    trades, synthetic email, …) and the governor refuses real credential
    injection. Policy still runs — approvals still freeze — so you exercise the full
    governance path with zero real consequences.
  </Card>

  <Card title="production" icon="bolt">
    Live. Actions route to real rails, subject to policy, budgets, and approvals.
    The *only* difference from sandbox is where an allowed action lands — the config
    is identical.
  </Card>
</CardGroup>

Enforcement of the mode is not the API's job — it happens at two closed
chokepoint (the governor). See
[Environments enforcement](/docs/architecture/environments-enforcement).

## Promote & demote

`POST /v1/users/:user_id/environment { environment }` flips **only the kit's
mode**. The resource semantics are strict, and they are the whole point:

* **Sandbox residue is never laundered.** Every resource row is *stamped* with
  the environment it was created in (`cards`, `email`, `phone`, `domains`,
  `trading`, `queues`, plus `approvals`, spend events, and activity). Promoting
  does **not** re-stamp anything: sandbox rows keep their `sandbox` stamp
  forever.
* **Reads filter to the current mode.** Listings return only rows stamped for
  the operator's *current* environment, so a promoted operator does not see its
  sandbox junk. Pass **`?environment=sandbox|production|all`** to override the
  filter explicitly.
* **Budgets are per-stamp.** Spend is summed and reserved within the stamp's
  window, so sandbox spend never counts against a production cap (and a sandbox
  over-cap `402` leaves the production window untouched).
* **The governor refuses replay across a stamp mismatch.** A frozen approval
  carries the stamp of the environment it was created in; if the operator's
  current mode differs, `replay/authorize` returns
  `environment_mismatch` and the row stays pending. **Re-request the action in
  the current environment** — a sandbox-approved action can never silently
  execute in production.

<Note>
  Stamps are set from the **governor's verdict** (`environmentStamp()` in the data
  layer), never trusted from the client. The DB default is `sandbox` — a fail-safe.
</Note>

## `naive env`

```sh theme={"theme":"css-variables"}
naive env status  --user <id>              # current mode + hint
naive env promote --user <id> --to production   # or --to sandbox to demote
naive env reset   --user <id> --sandbox    # purge sandbox RESOURCES (keeps audit)
```

`reset` deletes sandbox-stamped resource rows so you can start a clean run. It
**never** deletes audit or trajectory events — those are retained by design (see
below).

## Trajectories are the promotion evidence

Because sandbox activity is stamped and **retained across promote**, the sandbox
run *is* the record you promote on. `GET /v1/users/:user_id/trajectories`
(filterable by `?environment=` and `?since=`) groups stamped activity into runs
— per approval/action chain — so you can review exactly what the agent did in
sandbox, then diff its production behavior against that baseline. Audit and
trajectories stay queryable across **both** stamps, always.

## Everywhere the primitive appears

The same mode flows through every surface:

* **CLI** — `naive env status | promote | reset`.
* **Server SDK** — `provision(..., { environment })`, `op.promote()`,
  `op.environment()`.
* **IaC** — `agent({ environment })` (same config, two modes).
* **Panel** — an environment badge on the operator with promote / demote /
  reset actions.
