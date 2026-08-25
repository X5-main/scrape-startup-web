> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Runtime & Hosting

> Run the agent on your own infra (the lead path) or on Naïve-hosted containers.

Naïve is **runtime-agnostic**. An agent profile's tools work wherever the agent runs —
governance is at the tool-call boundary, not in the runtime, so self-hosting does
not give up spend caps, approvals, audit, or revoke.

## Bring your own runtime (the lead path)

The lowest-friction adoption: keep your existing agent (any framework or your own
loop) and just inject the agent profile's governed tools.

```ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";
const naive = new Naive({ apiKey: process.env.NAIVE_SECRET_KEY! });

const op = await naive.forUser(agentId).provision("support", { idempotencyKey: `op:${agentId}` });

// `tools()` returns a TOOLSET, not an array: `{ tools, handle }`. `tools` is the
// Anthropic-shaped declarations to hand your model; `handle(name, input)` is the
// dispatcher that routes the call through the Naïve governance gateway. You need
// both — declarations without `handle` describe tools nothing can execute.
const naiveToolset = await op.tools();

await theirAgent.run({
  tools: [...theirInternalTools, ...naiveToolset.tools],
  onToolCall: (name, input) => naiveToolset.handle(name, input),
  task: "Resolve ticket #492. Refund if policy allows.",
});
```

A refund still hits the Naïve gateway — capped, approval-routed above threshold,
audited, instantly revocable.

## Naïve-hosted (optional)

<Snippet file="legacy-runtime.mdx" />

`runtime.pool()` is the legacy orchestration runtime — the same runtime `runtime.hermes()`
names on the newer team surface. Everything in this section keeps working. A team declared
on `runtime.durable()` is the current path, and a team that names no runtime **is** durable;
see [Choosing a runtime](/docs/getting-started/teams#choosing-a-runtime) for declaring a team of
hermes agents, or one hermes team with durable specialists in it, from the team surface
rather than through `startSystem`.

<Note>
  **This surface is deprecated, not removed.** A config that declares `runtime.pool()`,
  agent-level `runtime: "<pool>"` strings, or `systems:` keeps compiling and keeps applying
  indefinitely — `naive up` prints one deprecation line naming what it found, and new
  configs author `defineProject` with `teams:` on `runtime.hermes()` for this hosted lane,
  which is what `naive init` scaffolds and the only one an apply places today.
  `runtime.durable()` is the path forward and is **refused on `api.usenaive.ai`**
  (`runtime_not_configured` — [is it on this
  deployment?](/docs/architecture/durable-runtime#is-the-durable-runtime-on-this-deployment)).
  The full path over is
  [the legacy orchestration migration guide](/docs/migration-guides/legacy-orchestration-to-durable-teams).
</Note>

Declare a `runtime.pool` in `naive.config.ts`, then start agents on managed containers:

```ts theme={"theme":"css-variables"}
await naive.runtime("pool").start(op.id, { goal: "Triage support email." });

// Multi-agent system by NAME — Naïve provisions the root + members from the
// `systems` block in naive.config.ts (shared budget) and starts them:
await naive.runtime("pool").startSystem({ system: "content", goal: "Ship this week's posts." });

// …or pass already-provisioned agent profile ids explicitly:
await naive.runtime("pool").startSystem({
  root: parent.id,
  members: [researcher.id, writer.id, publisher.id],
  topology: "manager → researcher → writer → publisher",
});
```

Pools declared under `runtime` in `naive.config.ts` (and registered by `naive up`)
are validated on `start()` — an unknown pool name returns a clear error listing
the declared pools.

### Per-pool sizing

Give a pool a `size` (or `autoscale: { min, max }`) to keep containers **pre-warmed**
so claims are instant:

```ts theme={"theme":"css-variables"}
runtime: {
  support: runtime.pool({ source: "hermes", isolation: "container", size: 2 }),
  content: runtime.pool({ source: "hermes", isolation: "container", autoscale: { min: 1, max: 5 } }),
}
```

`naive up` warms each pool to `size` / `autoscale.min` on the shared cluster and a
reconciler keeps it at target (refilling containers as they're claimed, up to
`autoscale.max`); re-running `naive up` confirms an already-warm pool, and `naive
down` drains it. Omit sizing for a lazy pool (a container is created on the first
claim). Each pool draws only from its own warm set — pools never steal each other's
containers.

Inside a hosted agent, use `@usenaive-sdk/runtime` — credentials are injected at boot
(never on the agent's filesystem):

```ts theme={"theme":"css-variables"}
import { agentProfile } from "@usenaive-sdk/runtime";
const tools = agentProfile.tools();
await runAgentLoop({ tools, goal: "Resolve tickets. Refunds over $50 route to a human." });
```

<Note>
  Hosted runtime is enabled per deployment. When it is configured (the orchestration
  cluster is set), `start()` claims an isolated agent container for the agent profile —
  sealed to a **per-agent profile scoped key**, never your company key — and dispatches the
  run; `startSystem({ system })` is a **standing team** — it provisions the system's
  root + member profiles once (reused on later calls, not re-spawned) under the
  root's shared budget, then dispatches the run. When it is not enabled, `start()`
  returns a clear error directing you to the BYO-runtime path. Either way,
  governance is identical: every action the agent takes flows back through the
  gateway under the agent profile's policy.
</Note>

The runtime module wraps the existing managed compute orchestration behind a
stable interface, so it stays swappable.

## Billing

A claimed hosted-runtime container is **duration-metered in credits** (`runtime_usage`):
`1.7 credits/vCPU-hour + 0.18 credits/GB-hour`, so a default `1 vCPU / 2 GB` agent costs
≈ **2.06 credits/hour** (\~$0.10/hr at $0.05/credit) while its container is up — busy or idle. `revoke()` releases the
slot immediately and stops the meter. Bring-your-own-runtime incurs **no** `runtime_usage`
(you pay only for the API primitives the agent calls). The shared warm pool that keeps
start-up fast is platform overhead and is never billed to you. See
[Credits](/docs/getting-started/credits#infrastructure-duration-metered).
