> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Teams & the durable runtime

> Address a team as a (team, tenant) pair, read its runs, drive its brain — and know exactly which verbs are wired today.

`createClient<typeof config>()` adds the durable-runtime surface to the same object you
already use. Nothing legacy moves: `NaiveClient` extends `Naive`, so one credential, one
host, one transport.

```ts theme={"theme":"css-variables"}
import { createClient } from "@usenaive-sdk/server";
import config from "./naive.config.js";

const naive = createClient<typeof config>({ apiKey: process.env.NAIVE_SECRET_KEY! });

const support = await naive.teams.support.forTenant(alice.id);
const { runs } = await support.runs.list({ status: "running" });
```

## A team is a pair, not a name

`naive.teams.support` is a **reference**, not a handle. The addressable unit of the durable
runtime is `(team, tenant)` — the same pair the runtime itself uses — so you bind a tenant
before you can do anything:

```ts theme={"theme":"css-variables"}
const ref     = naive.teams.support;          // TeamRef  — nothing is addressable yet
const support = await ref.forTenant(alice.id); // TeamTenantHandle
```

<Note>
  **`forTenant` verifies; it does not get-or-create, and it costs one round trip to say so.**
  It resolves `GET /v1/users/{id}` first, so an unknown tenant id fails with `not_found` here
  instead of silently succeeding and writing a run against a tenant that does not exist. There
  is deliberately **no unchecked twin** — a twin would become the default and the check would
  become decoration.
</Note>

Without a `naive.config.ts` to type the client, `naive.teams.support` does not typecheck.
Use the string twin, which behaves identically at runtime:

```ts theme={"theme":"css-variables"}
const support = await naive.team("support").forTenant(alice.id);
```

## Agents are derived, never addressed

```ts theme={"theme":"css-variables"}
const t1 = support.agents.tier1;   // or support.agent("tier1")
const tools = t1.tools();
```

<Warning>
  **An agent handle narrows intent, not authority.** Every call still travels on the **company
  key** with the **tenant's** seal. `t1.tools()` returns the *tenant's* full Account-Kit-gated
  meta-toolset — it is **not** filtered to that agent's declared `can` list. Server-side
  enforcement is unaffected; what is missing is the client-side narrowing. Do not read
  `support.agents.tier1` as an isolation boundary.

  Unknown agent names do **not** throw: no mounted route knows a team's roster, so a runtime
  check would have to be a fabricated allowlist. The type layer (keyed off your config) is
  where a typo is meant to be caught.
</Warning>

## What is wired today

Three namespaces reach mounted routes.

### `runs` — the run ledger

```ts theme={"theme":"css-variables"}
const { items, next_cursor } = await support.runs.list({ limit: 50 });
const ledger = await support.runs.get(runId);              // run + its events
const page = await support.runs.events(runId, { limit: 100 });  // { items, next_cursor }

// `artifacts` is NOT on this handle. It is company-scoped, and lives on `naive.runs`:
const { artifacts } = await naive.runs.artifacts(runId);

for await (const ev of support.runs.watch(runId)) {
  console.log(ev.event_type);
}
```

`list()` and `events()` both return `{ items, next_cursor }` — keyset pages, not
`{ runs, count }`. `list()` takes `{ limit, cursor }` and no `status` filter.

<Warning>
  **`/v1/runs` is company-scoped and scopes itself by the credential, not by the URL.** There is
  no `team` or `tenant_user_id` query parameter on the route. Under an operator key,
  `teams.support.forTenant(x).runs.list()` and `teams.billing.forTenant(y).runs.list()` return
  **the same rows**. The team and tenant in the path are *addressing*, not *filtering*. A sealed
  agent key sees only its own runs; a human session and the config root see the whole company.

  `watch()` **polls**. The company-scoped poller (`naive.runs.watch`) reads
  `GET /v1/runs/{id}/events`, which returns the whole ledger and accepts no `after` cursor —
  that cursor is client-side, so cost grows with ledger length rather than with new events.
  The team-scoped one (`support.runs.watch`) reads `GET …/runs/{id}/events`, which *does* take
  `?cursor=` and pages by `seq`, so its cost grows with new events.

  Neither uses a stream. `GET …/runs/{id}/stream` **is** served for a durable tenant — it
  proxies the runtime's transcript as SSE, and `naive teams watch` consumes it — but this
  client does not call it. Reach it with `legacy.invoke` or the CLI if you need frames as they
  arrive.
</Warning>

### `approvals`, `brain`, `memory` — real, but **not** team-narrowed

```ts theme={"theme":"css-variables"}
await support.approvals.list({ status: "pending" });
await support.brain.recall({ query: "Acme invoicing" });
```

<Warning>
  **These three are the same objects `naive.forTenant(id)` gives you.** They resolve to the
  identical `/v1/users/{tenant}/…` base, because the tenant is the only scope those routes have
  — there is no team dimension on any of them. `teams.billing.forTenant(x).approvals` and
  `teams.support.forTenant(x).approvals` are **one queue**, not two. And see
  [memory](/docs/sdk/sub-clients/memory) before using `support.memory.add()`: it sends a request, it
  does not write a row.
</Warning>

## What is wired, and what refuses

Nothing on this client returns `{}`, and nothing refuses at a route that exists.

The rule is one line: **a method refuses in the client only when the route is not mounted.**
When a route IS mounted the call goes out — even if the server answers `501 not_configured`,
because "there is no route" and "the route refuses" are different instructions. Only the
second arrives with `error.details.missing` naming each absent dependency, written by the
people who know, and only the second starts working the day that dependency lands without a
new release of this package.

<Warning>
  **And whether a sent call succeeds depends on the tenant's runtime.** A tenant runs on the
  durable runtime or on the frozen legacy one — one column, `company_containers.sidecar_url` —
  and `/v1/teams` branches on it. The same method against two tenants gets two different
  outcomes, and both are correct.

  This client does **not** pre-empt that branch, and must not: it would have to know which
  runtime a tenant is on, which is a fact only the server holds and which changes underneath
  it. Read it off the response instead — every success carries `provider` (`"durable"` |
  `"hermes"`), every refusal carries `error.details.runtime`, and `plan()` reports it directly.

  Both sides of the branch are live. `registerVettaRuntime()` — the only writer of
  `company_containers.sidecar_url` for the durable runtime — has exactly one production caller,
  `services/placement.ts`, reached from `naive up` when a `teams:` block declares
  `runtime.durable(...)` and the operator supplies `NAIVE_DURABLE_CREDENTIAL_<TEAM>` out of
  band — **on a deployment that has the durable runtime configured, which `api.usenaive.ai`
  does not** ([is it on this
  deployment?](/docs/architecture/durable-runtime#is-the-durable-runtime-on-this-deployment)).
  `migrate()` still refuses: moving an *existing* tenant is not symmetric, so it stays an
  operator act rather than a call. Keep reading `provider` rather than hard-coding it: a tenant
  moved between runtimes changes what these calls do with **no release of this package**.
</Warning>

### Wired to the (team, tenant) address

| Method                                        | Route                                          | Durable tenant                                           | Hermes tenant                                 |
| --------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| `plan()`                                      | `GET …/plan`                                   | real rows                                                | real rows                                     |
| `diagnostics({ kind })`                       | `GET …/diagnostics`                            | 🔴 **`findings: []`** — mirror-only                      | real rows                                     |
| `board.list({ status, role, cursor, limit })` | `GET …/board`                                  | the runtime's own board                                  | the legacy mirror                             |
| `board.get(card)`                             | `GET …/board/{card}`                           | one card, with its real `block_reason`                   | the legacy mirror                             |
| `runs.get(id)`                                | `GET …/runs/{id}`                              | the state of one exchange                                | the legacy run                                |
| `spend.cost({ by: "action" })`                | `GET …/cost`                                   | 🔴 **`buckets: []`** unless the usage seam is delivering | real rows                                     |
| `submit({ goal, tasks, parent })`             | `POST …/submit`                                | **`201`** — admitted                                     | **501**, naming `POST /v1/tasks`              |
| `board.unblock(card, because)`                | `POST …/board/{card}/unblock`                  | a fresh attempt budget                                   | **501**, naming `POST /v1/tasks/{id}/unblock` |
| `sessions.say(channel, text)`                 | `POST …/sessions/{channel}/messages`           | posts; returns the run to watch                          | **501** — no per-(team, tenant) session store |
| `runs.events(id, { cursor })`                 | `GET …/runs/{id}/events`                       | 🔴 **`items: []`** — mirror-only                         | real rows                                     |
| `runs.watch(id)`                              | **polls** `GET …/runs/{id}/events`             | 🔴 polls an empty list                                   | polls                                         |
| `board.stop(because)`                         | `POST …/stop`                                  | a **pause** — cards keep leases and attempt budgets      | **501**                                       |
| `effects.list()` / `effects.settle(id, …)`    | `GET …/effects` · `POST …/effects/{id}/settle` | **501**                                                  | **501**                                       |
| `sessions.read(channel)`                      | `GET …/sessions/{channel}`                     | **501**                                                  | **501**                                       |
| `audit.decisions()` / `audit.decision(id)`    | `GET /v1/policy/decisions[/{id}]`              | **501**                                                  | **501**                                       |
| `brain.reaffirm({ claimId })`                 | `POST /v1/brain/beliefs/{id}/reaffirm`         | **501**                                                  | **501**                                       |

<Warning>
  **The four 🔴 rows answer `200` with nothing in them for a durable tenant, and that
  is the most dangerous shape on this table.** They are not refusals you can catch —
  they are successful empty results.

  All four read naive's **task mirror**, which is written by the legacy close path. A
  tenant placed on the durable runtime never enters it, so the query is well-formed,
  the response is well-shaped, and the answer is empty for a structural reason the
  response does not state.

  * `diagnostics()` → `findings: []`. Its `unverified` finding in particular can
    never appear on that runtime: it is a query for a mirror value nothing writes
    there.
  * `spend.cost()` → `buckets: []`. See [Cost](/docs/api-reference/runtime/cost) for the
    two conditions that have to hold before a durable tenant's model spend reaches
    this ledger at all.
  * `runs.events()` → `items: []`, and therefore **`runs.watch()` polls an empty list
    forever.** A durable run's transcript exists — it is served, as SSE, at
    `GET …/runs/{id}/stream` — and this client does not call it. Until it does, use
    the stream directly for a durable tenant rather than `watch()`.

  `board.list()` and `board.get()` are the two reads that were given a durable lane,
  which is why they are the two that are real on both. Branch on `provider`, which
  every response that has a durable lane carries.
</Warning>

<Note>
  **A `501` for a durable tenant means something narrower than "not built".** It names the
  verb the runtime already implements and says which control-plane translation is missing, so
  `error.details.missing` distinguishes *not built* from *not reachable from here* — a
  distinction a caller can act on and a blanket `501` destroyed. Where the refusal came from
  the runtime itself, its status is preserved and its own sentence is carried through verbatim
  in `error.details.runtime_said`.

  `submit()` resolves with `manifest_digest: null` and `manifest_digest_unavailable_because`
  beside it: the durable runtime reports its applied digest on `GET …/plan`, not on an
  admission. Read the sibling; do not read the `null` as "no manifest".

  `board.stop()` stops the **team**, not the board — the mounted route is team-scoped
  (`POST …/stop`). It lives on `board` only because that is where the published surface put it.
  **For a durable tenant it is served**: it stops the dispatcher claiming further work and
  fences it against re-arming (`start-loop` resumes). For a hermes tenant it is `501` — a
  team-level stop is a state of the Durable Object, and the legacy runtime has no equivalent
  row to set; a legacy run is stopped one at a time through the sidecar.

  Read the answer, not just the status. It carries `cancelled` (scheduled ticks removed),
  `in_flight` (attempts already handed to a member), `stopped_at`, and
  `is_pause_not_decommission: true`. That last field is the point: this is a **pause**. Cards
  keep their leases and their attempt budgets, `submit()` still admits work, and an attempt
  already in flight is **not** recalled — there is no abort channel into one, so it runs to its
  end and still spends. `in_flight` is how you know whether that number is zero. The runtime
  refuses a per-run kill (`POST …/runs/{id}/stop`) by design, for the same reason.

  `spend.cost({ by })` accepts exactly one value. The route throws
  `invalid_input: by must be "action" (the only bucketing this build can compute)` on anything
  else, so the parameter is typed to what it accepts.
</Note>

### The brains, from a team handle

`support.brain` and `support.brains` are the same objects `naive.brain` / `naive.brains`
give you. They are here because a handle that offers the value but not the collection sends
you back to the root for half of one surface — **not** because the team or the tenant scopes
them. `brainRouter` reads the company id; the `:tenant` segment selects the mount, not the
rows.

A `501` arrives as an ordinary `NaiveError` with `code: "not_configured"`, and its
`details.missing` is the list of things the server is waiting on:

```ts theme={"theme":"css-variables"}
import { NaiveError } from "@usenaive-sdk/server";

try {
  await support.submit({ goal: "Clear the backlog" });
} catch (err) {
  if (err instanceof NaiveError && err.code === "not_configured") {
    console.log(err.details?.runtime);       // "durable" | "hermes"
    console.log(err.details?.missing);
    // hermes: [ "durable dispatcher: `POST /v1/tasks` creates a legacy card …" ]
    // durable: [ "the durable runtime HAS this: … `naiveControl()` has no head for it" ]
    console.log(err.details?.runtime_said);  // present only when the runtime authored it
  }
}
```

### Refuses in the client — the route does not exist

Eight methods have **no mounted route** and each throws a typed `NotImplementedError` naming
the exact `METHOD /path` it would have called, sending nothing. The registry is data
(`MISSING_ROUTES`), a test walks every namespace and asserts the refusing set is *exactly*
that table, **and a second test asserts every row is absent from the published OpenAPI spec** —
so a row cannot survive the route landing.

```ts theme={"theme":"css-variables"}
import { NotImplementedError, MISSING_ROUTES } from "@usenaive-sdk/server";

try {
  await support.workspace.readFile("/src/index.ts");
} catch (err) {
  if (err instanceof NotImplementedError) {
    console.log(err.message);      // names GET /v1/teams/:team/tenants/:tenant/workspace/file
  }
}

// The whole table is readable at runtime — no guessing which calls are live.
console.log(Object.keys(MISSING_ROUTES));
```

| Refuses                                | Why (measured)                                                                                                                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessions.open()`                      | No POST opens a session. The three mounted session addresses read a channel or post into one; none creates one. `sessions` is also taken — `/v1/users/{tenant}/sessions` mints an **MCP credential**, and lives at `naive.forTenant(id).sessions`. |
| `workspace.readFile/writeFile/list`    | The workspace verbs live on the sidecar (`/control/{company}/apps/workspace/*`), reachable only server-side.                                                                                                                                       |
| `agent.limits()` / `agent.approvals()` | Nothing is mounted under an `…/agents/{agent}` prefix at all; the approvals queue has no agent filter.                                                                                                                                             |
| `brain.partition()` / `brain.lane()`   | No mounted brain route accepts a partition or a lane, and no `brain_*` table has an agent level. Sending `knowledge_base_id` instead would issue an **unscoped** read while reporting it as scoped.                                                |

For anything this client does not model yet, `legacy.invoke(method, path, body?)` is a raw
request on the same credential and host. It names no noun and applies no shape, which is
exactly why it is safe for a route with no handle:

```ts theme={"theme":"css-variables"}
await naive.legacy.invoke("GET", `/v1/teams/support/tenants/${alice.id}/roster`);
```

## The frozen legacy surface

```ts theme={"theme":"css-variables"}
naive.legacy.tasks.list();
naive.legacy.objectives.list();
naive.legacy.ceo.run({ prompt: "…" });
```

<Warning>
  **`naive.legacy` is born deprecated.** It is the frozen legacy orchestration runtime: every
  route keeps answering, nothing is removed, no response shape changes, and it accepts no new
  capabilities. It exists as one clearly-marked namespace rather than scattered across the root.

  **Use instead:** `naive.teams.<name>.forTenant(id)` for anything it can already do today, and
  the REST surface for anything it cannot. There is **no sunset date**.
</Warning>

## Known gaps

<Info>
  * **No manifest-digest fence.** `defineConfig` returns your config by identity and computes no
    digest, so the client has nothing to send and nothing to compare. A local config's *types*
    can therefore be newer than the *applied* manifest. The option is absent rather than
    accepted-and-ignored.
  * **`naive plan` at project scope has no SDK equivalent**, for the same reason: its central
    field is that digest.
  * **`t1.tools` is not narrowed to the agent's `can` list** — see the warning above.
</Info>

See also: [In-agent SDK](/docs/sdk/in-agent) for the same runtime seen from *inside* an agent, and
[Governance](/docs/sdk/governance) for what is and is not reachable on the policy surface.
