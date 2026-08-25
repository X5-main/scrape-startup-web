> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from the memory primitive to the brain

> Move agent context off the memory primitive — /v1/memory, naive memory add, MEMORY.md — onto the company brain, where a write is a durable row with a retention and a lifecycle instead of a prompt asking an agent to remember something.

<Info>
  **This is a Naive → Naive guide.** The "vendor" is a previous version of Naive. It is a *separate*
  migration from [legacy orchestration → durable teams](/docs/migration-guides/legacy-orchestration-to-durable-teams),
  and it is deliberately not folded into that page — the two have different blast radii, and the
  difference breaks a real migration on day one. See the warning immediately below.
</Info>

The **memory** primitive is how Naive first gave an agent context that outlived one run:
`POST /v1/memory` with some prose, `naive memory add --target memory "…"`, and a `MEMORY.md` the
agent was expected to consult. It is company-scoped, it is on by default, and it keeps working.

The **brain** is a knowledge substrate with content nouns that have a *lifecycle* (a company
may hold several brains, one flagged as the default):
a belief is written, cited, reaffirmed, contested, and eventually expires under a stated
retention. That is the difference this migration is about — not storage, but whether a stored
thing has a stated life.

## Read this before you plan the work

<Warning>
  **`memory` is on by default. `brain` is opt-in — and a gated call with no kit entry is a
  refusal, not a default.**

  `brain` is declared `optIn: true` in the primitive registry; `memory` is not. So the very first
  thing a migration hits is not a code change: it is that every tenant whose Account Kit has no
  `brain` entry gets `403 forbidden` with `reason: "subprocessor_consent_required"` on the new
  path while the old path keeps answering `201` — and an explicit `{ enabled: false }` gives the
  same answer as an absent entry, because that reason is what an opt-in slug returns for both.
  Enable `brain` on the kits **before** you change a single call site, or the migration will look
  like a bug in the brain.
</Warning>

<Warning>
  **`POST /v1/memory` does not write a fact.** Measured on this build: the handler composes the
  string `Please add the following to your memory (target: MEMORY.md):\n\n<your content>`, posts it
  to the legacy runtime's `/ceo/run` as a *prompt*, and answers `201` with
  `{ "status": "memory_requested" }`. There is a direct table insert, but it is a development-only
  fallback behind a `NODE_ENV !== "development"` re-throw.

  So a `201` from `/v1/memory` means **an agent was asked to remember something**, not that
  anything was stored. If you have ever written a fact through this route and later failed to read
  it back, that is the reason — and it is the single strongest argument for this migration.
</Warning>

## Concept map

| Memory primitive                    | Brain                                                  | Note                                                         |
| ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| `POST /v1/memory`                   | `POST /v1/brain/remember`                              | The brain writes a row; memory posts a prompt                |
| `GET /v1/memory`                    | `POST /v1/brain/recall`                                | Recall is a `POST` — the query is a body, not a query string |
| `DELETE /v1/memory/{id}`            | `POST /v1/brain/forget`                                | `forget` is approval-gated. See below                        |
| `naive memory add`                  | `naive brain remember`                                 |                                                              |
| `naive memory list`                 | `naive brain recall <query>` / `naive brain timeline`  | There is no "list everything" verb; recall is a query        |
| `naive memory remove`               | `naive brain forget <scope> <ref>`                     | Tombstones a scope, not a text match                         |
| `--target memory` / `--target user` | *(no equivalent)*                                      | The brain has levels and partitions, not targets             |
| `MEMORY.md`                         | *(gap)*                                                | No file. A belief is a row with a retention                  |
| *(nothing)*                         | `POST /v1/brain/attach` · `POST /v1/brain/consolidate` | The run loop memory never had                                |
| *(nothing)*                         | proposals + writebacks                                 | A model-authored claim waits for a human                     |

<Note>
  **`memory` survives as a wire name.** The primitive slug, the `/v1/memory` path and the table
  names keep the word. It is retired as a *product noun* only: one row cannot be both a curated
  item and a lesson without re-creating the two-vocabulary problem the brain exists to end.
</Note>

## Before / after: the core path

### Writing something the agent should know

```bash theme={"theme":"css-variables"}
# BEFORE — this asks an agent to remember. It does not store a fact.
naive memory add --target memory "Our refund window is 30 days"
# → 201 { "status": "memory_requested" }
```

```bash theme={"theme":"css-variables"}
# AFTER — a durable episode in the company brain.
naive brain remember "Our refund window is 30 days"
```

```ts theme={"theme":"css-variables"}
// The same write through the Node SDK.
import { Naive } from "@usenaive-sdk/server";

const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
await naive.brain.remember({ content: "Our refund window is 30 days" });
```

### Reading it back

```bash theme={"theme":"css-variables"}
# BEFORE
naive memory list

# AFTER — recall is a query, not a listing.
naive brain recall "refund window"
naive brain timeline            # chronological events and facts
naive brain think "what should I tell a customer past the window?"
```

### Forgetting

```bash theme={"theme":"css-variables"}
# BEFORE — removes the FIRST memory containing this substring.
naive memory remove --text "refund window"

# AFTER — tombstones a scope, and asks a human first.
naive brain forget episode ep_01J8
```

<Warning>
  **`brain.forget` is approval-gated, and the difference is visible only in the response body.**
  A human caller executes immediately (`200`). An agent caller queues an approval (`202`) and the
  erase **does not happen** — you get an approval id, not a result.

  The Node SDK's namespaced `brain` handle folds on the body discriminator
  (`status: "pending_approval"`) so the two are distinguishable in TypeScript. The older
  `BrainClient.forget` returns `Promise<unknown>` and discards the status code, so a resolved
  promise from it reads as "it happened" whether or not it did. If you are migrating deletion
  logic, use the namespaced handle.
</Warning>

## Minimal viable migration

<Steps>
  <Step title="Enable the brain primitive on the kits">
    Nothing else works until this is done, and the failure mode is a `403` that looks like a bug
    in the new code. Confirm with `POST /v1/policy/explain` before you change a call site.
  </Step>

  <Step title="Dual-write, do not backfill">
    There is no export from the memory primitive worth migrating: what `/v1/memory` returns is a
    mirror of prompts that were *requested*, not a set of facts that were stored. Start writing
    the facts you care about into the brain and let the old rows age out.
  </Step>

  <Step title="Move reads first">
    `naive brain recall` and `naive brain think` answer against real rows today. Point your read
    path at them while writes still go both ways.
  </Step>

  <Step title="Adopt the run loop when you adopt teams">
    `attach` before the work, `consolidate` after it. This is the half memory never had, and it
    is worth doing after the read/write swap rather than during it.
  </Step>

  <Step title="Leave `naive memory` in place">
    It is frozen, not removed. Every command and route keeps answering.
  </Step>
</Steps>

<Note>
  **The steps above do not depend on the document legs.** `remember`, `recall`, `think`, `graph`
  and `timeline` are served from the Postgres spine and keep answering whatever inference a
  deployment resolved — which is why "dual-write, do not backfill" is safe to start on day one.
  Document RAG is the part with a dependency: ingest and `POST /v1/brain/query` need an embedding
  leg and refuse with `501 feature_not_configured` without one. If you are also moving handbooks
  and policies in, read `services.embedding` on
  [`GET /v1/brain/status`](/docs/api-reference/brain/runtime) before you conclude the brain is down.
  Answer synthesis is optional either way: with no answerer, `query` still returns `200` with
  `answer_mode: "grounded"`.
</Note>

## Consolidate further once you're on the brain

### Gain #1 — a write has a stated life

A memory row has no retention, no expiry and no reaffirmation. A brain belief has all three, and
retention is declared per content noun in `naive.config.ts` — narrowable per level, and bounded
by a 365-day ceiling that is not configurable. A declaration that tries to widen retention at a
lower level throws at define time and names both levels.

### Gain #2 — a model-authored claim waits for a human

Anything a run wants the brain to record arrives as a **writeback** envelope and becomes a
**proposal**. `POST …/proposals/{id}/accept` canonises it; `reject`, `merge` and `quarantine` are
the other three outcomes. From an agent, accept **parks for a human** and reject applies
immediately with the caller recorded — that asymmetry is deliberate, not an oversight: promotion
into the company's source of truth needs a human who is not the author.

Inspect the queue without leaving the terminal:

```bash theme={"theme":"css-variables"}
naive brain proposals              # the queue
naive brain proposals prp_01J8     # one proposal and its decision trail
naive brain writebacks             # the envelopes the proposals arrived on
```

### Gain #3 — the run loop

```bash theme={"theme":"css-variables"}
naive brain attach "refund the duplicate charge for acct 8812"   # what is already known
# … the work happens …
naive brain consolidate                                          # learned / decided / left open
```

`attach` is a read capsule assembled *before* work starts; `consolidate` is the run-end debrief
that produces the writeback. Neither has an equivalent in the memory primitive, and together they
are the reason the brain is a substrate rather than a store.

## What does not map yet

Measured against this build. Each of these answers `501 not_configured` and names its missing
dependency — it does not return an empty list, which would be a claim about your tenant:

* **`POST /v1/brain/beliefs/{id}/reaffirm`** — reaffirming a belief.
* **Lessons.** There is no lessons surface: both routes refuse, and there is no
  `naive brain lessons` command. Use `naive brain recall` or `naive brain think` for the read.
* **Retention** as a readable surface (`/v1/brain/retention`).
* **Decisions** (`/v1/brain/decisions`).

Also absent, for different reasons:

* **`propose` and `learn` as client verbs.** They are designed but have no route on this build,
  so the SDK omits them rather than shipping guaranteed 404s.
* **Eight of the designed `naive brain` subcommands** — `beliefs`, `belief`, `reaffirm`,
  `lessons`, `learn`, `retention`, `levels`, `decisions` — are not shipped, for the same reason.
* **An agent level.** The brain has a company level and partitions; there is no per-agent level
  on any `brain_*` table. Agent-level context is the agent's own memory namespace in the in-agent
  SDK (`self.memory`), not a brain lane.
* **`GET /v1/brain/metrics` is process-global.** It sits behind a company auth gate but returns a
  body with no company filter, so treat its counters as deployment-wide, not yours. `naive brain
  metrics` says so on the command.

<Note>
  **If you are reading a cached copy of the deprecation notice.** Until recently the REST
  deprecation register named `naive brain remember / naive brain lessons / naive brain forget` as
  the replacement for `naive memory`, and that text rode the `X-Naive-Replacement` header and the
  orchestration API reference. `naive brain lessons` never existed. The register now names only the
  two commands that work; a response you captured earlier may still carry the old string.
</Note>

## Where to go next

* [Brain runtime & configuration](/docs/api-reference/brain/runtime) — which inference legs a
  deployment resolved, and exactly what degrades without each
* [Brain MCP tools](/docs/mcp/brain) — the twenty-one content tools, for an agent
* [Runtime & brain governance MCP tools](/docs/mcp/runtime-and-governance) — proposals, writebacks and
  the decision envelope
* [Legacy orchestration → durable teams](/docs/migration-guides/legacy-orchestration-to-durable-teams) — the other half of the move
