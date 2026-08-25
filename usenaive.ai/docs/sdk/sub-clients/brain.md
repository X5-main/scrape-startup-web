> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# brain

> Company knowledge base + semantic memory — the default brain, the collection beside it, connecting an agent to one, documents, grounded query, recall/think/graph/timeline, and the proposal lifecycle.

`naive.brain` (default user) or `naive.forUser(id).brain` (per-tenant). Both resolve to
`/v1/users/{id}/brain`. The `brain` primitive is `optIn` — it must be **enabled** on the
tenant's [Account Kit](/docs/architecture/account-kits) or every call is denied, not empty.

<Note>
  Constructing the client with `createClient()` upgrades `naive.brain` from `BrainClient` to
  **`BrainHandle`**, which `extends` it — every method below keeps working, and the
  [proposal lifecycle](#proposals-and-promotion) and the
  [`forget` decision](#forget-tells-you-whether-it-happened) are added on top. Nothing is
  stranded.
</Note>

## `brain` is the default; `brains` is the collection

A company may have several brains and exactly one is the **default**. `naive.brain` is
that one: it sends no `knowledge_base_id`, so the server resolves the row flagged
`is_default` — minting one if the company has none. A single-brain company therefore
behaves exactly as it did before `naive.brains` existed.

```ts theme={"theme":"css-variables"}
import { createClient } from "@usenaive-sdk/server";

const naive = createClient({ apiKey: process.env.NAIVE_API_KEY! });

const { knowledge_bases, count } = await naive.brains.list();
const support = await naive.brains.create({ name: "Support Brain" });

const byName = await naive.brains.get("Support Brain");   // costs a list()
const byId = naive.brains.ref(support.id);                // no round trip at all
const fallback = await naive.brains.default();            // the is_default row

const answer = await byName.query("What is our refund policy?");
```

| On `naive.brains`                                | Does                                                                                         |
| :----------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `list()`                                         | every brain, newest first — including ones whose provisioning failed, with `status: "error"` |
| `create({ name?, is_default? })`                 | create a brain and its provider objects                                                      |
| `get(nameOrId)`                                  | one brain, by exact name or id. Costs a `list()`                                             |
| `ref(id)`                                        | a `BrainRef` from an id you already hold — **no round trip, no validation**                  |
| `default()`                                      | the `is_default` brain                                                                       |
| `setDefault(id)`                                 | promote an existing brain — `PATCH /v1/brain/{id}`                                           |
| `remove(id)`                                     | delete a brain (may be approval-gated)                                                       |
| `connections({ agent_id?, knowledge_base_id? })` | who is connected to what                                                                     |
| `disconnect(agentId)`                            | drop an agent's connection                                                                   |

<Warning>
  **`setDefault()` was a registered refusal for about an hour, and its own gate retired it.**
  It shipped as a `MISSING_ROUTES` row on a measurement — `PATCH /v1/brain/{id}` answered
  `404`, as did the four other spellings a client might guess. The route then landed, and
  `wiring.test.ts`'s openapi gate failed the row by name. That is the second time in one
  session that rule caught a stale refusal, which is the argument for it.

  Two facts the same landing changed, both carried by the methods that own them:

  * **`create({ is_default: true })` can still throw `409 duplicate_record` with the brain
    already committed** — the swap runs after provisioning. The server now says
    `retryable: false` and names the brain in `details.knowledge_base_id`; recover with
    `setDefault(id)`. An earlier revision said `retryable: true`, and obeying it made a
    second brain with the same name.
  * **`remove()` on the default no longer strands the company.** The oldest survivor is
    promoted in the same transaction, and the succession is on the activity log rather than
    in the empty `204` — so `default()` afterwards if it matters which.

  `setDefault()` takes `{is_default: true}` and nothing else: there is no `false`, because the
  way to stop a brain being the default is to name the one that should be instead.
</Warning>

A `BrainRef` carries the id on every call, so `ref.query(...)`, `ref.recall(...)`,
`ref.attach(...)`, `ref.addDocument(...)`, `ref.remember(...)`, `ref.forget(...)`,
`ref.documents()`, `ref.graph()`, `ref.timeline()`, `ref.think()` and `ref.remove()` are
the same verbs scoped to one brain. `ref.row` is a snapshot of the read that produced it —
`null` when the ref came from `ref(id)`, which read nothing — and `ref.name` is `null` in
that case for the same reason.

<Note>
  **Names are not unique**, because there is no uniqueness constraint on
  `(company_id, name)`. `get(name)` throws `409 duplicate_record` naming the ids rather than
  picking one, and `404 resource_not_found` naming every brain that exists when nothing
  matched. Matching is exact and case-sensitive: the server stores what you sent.
</Note>

## Connecting an agent to a brain

```ts theme={"theme":"css-variables"}
import { createClient } from "@usenaive-sdk/server";

const naive = createClient({ apiKey: process.env.NAIVE_API_KEY! });
const agentId = "c62c69e3-69aa-4136-b571-fded6ce5a28b"; // an agents.id UUID

const brain = await naive.brains.get("Support Brain");
await brain.connect(agentId);
await brain.connections();                             // everyone on THIS brain
await naive.brains.connections({ agent_id: agentId }); // this agent's connection
await naive.brains.disconnect(agentId);                // takes an agent, not a brain
```

Connecting is **idempotent**: connecting an already-connected agent re-points it and
refreshes `connected_at`. An agent works out of one brain, and the storage is one field
rather than an array so the shape enforces it.

<Warning>
  **A connection is a default, not a permission, and it does not redirect this client.**

  1. It grants nothing. Every content route already accepts `knowledge_base_id` and resolves
     it company-scoped, so any caller the `brain` primitive admits could already address any
     of the company's brains by id.
  2. **`resolveKnowledgeBase` never consults `agents.metadata`.** After connecting, an
     unscoped `naive.brain.recall()` still reads the **default** brain, not the connected
     one. What honours a connection is the CLI's `--agent` resolution and
     `POST /v1/runs`'s `brain_knowledge_base_id`. To read the connected brain from this
     client, resolve it: `naive.brains.ref(conn.knowledge_base_id).recall(...)`.
  3. `connect(agentId)` takes an `agents.id` **UUID** — not a role, not a
     `hermesProfileName`. The CLI resolves friendly names before calling; this method does
     not, because a second name resolver would diverge from the CLI's.

  `disconnect` lives on `naive.brains`, not on a ref, because
  `DELETE /v1/brain/connections/{agentId}` takes no brain: a `ref.disconnect()` would look
  brain-scoped and would drop the agent's connection whichever brain it pointed at.
</Warning>

<Warning>
  **The brain half is company-wide; the agent half is not.** `brain_knowledge_bases` has no
  tenant column, so `naive.brains.list()` shows every brain the company holds. `agents` does
  have one, and the three connection routes filter every read and every write on
  `agents.tenant_user_id` — the same rule `/v1/employees` applies.

  So `connections()` lists **your own** agents' connections, `connect()` on another tenant
  user's agent answers `404 resource_not_found`, and a `count` smaller than the brain list
  suggests is a scope answer rather than an emptiness answer. `disconnect()` on an agent with
  no connection also answers `404`, not a silent success.
</Warning>

A connection whose brain has since been deleted still lists, with
`knowledge_base_name: null`. `DELETE /v1/brain/{id}` cascades documents and knows nothing
about agents, so the dangling binding is **reported rather than hidden** — the agent is
still pointed at an id that no longer resolves.

```ts theme={"theme":"css-variables"}
// Ingest source material, then ask a grounded question
await naive.brain.addDocument({ text: "Our refund policy is 30 days.", filename: "refunds.md" });
const answer = await naive.brain.query("What is our refund policy?");
// answer.answer, answer.citations, answer.session_id

// Durable semantic memory
await naive.brain.remember({ content: "Acme Corp prefers quarterly invoicing", source: "crm" });
const memory = await naive.brain.recall({ query: "Acme invoicing" });
const synth = await naive.brain.think({ query: "How should we bill Acme?" });

// Knowledge graph + timeline
const graph = await naive.brain.graph({ entity: "Acme Corp" });
const timeline = await naive.brain.timeline({ entity: "Acme Corp" });
```

## Methods

| Method                                                                                         | Description                                                     |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `list()`                                                                                       | List the company's knowledge bases.                             |
| `create({ name?, is_default? })`                                                               | Create (and provision) a knowledge base.                        |
| `query(question, { knowledge_base_id?, session_id?, filters? })`                               | Grounded answer + citations (0.08 credits).                     |
| `recall({ query, knowledge_base_id?, entity?, since?, limit? })`                               | Structured facts/entities/episodes.                             |
| `think({ query, knowledge_base_id?, entity?, session_id?, limit? })`                           | Synthesize memory + docs with gaps (0.08 credits).              |
| `graph({ knowledge_base_id?, entity?, limit? })`                                               | Entity/relation knowledge graph.                                |
| `timeline({ knowledge_base_id?, entity?, limit? })`                                            | Chronological memory events/facts.                              |
| `remember({ content, title?, kind?, source?, confidence?, ... })`                              | Write a durable memory episode.                                 |
| `forget({ scope, scope_ref, knowledge_base_id?, reason? })`                                    | Tombstone a memory scope (may be approval-gated).               |
| `addDocument({ text? \| url? \| file_base64?, filename?, content_type?, knowledge_base_id? })` | Ingest a document (0.1 credits + 0.0002 per KB (capped at 10)). |
| `replaceDocument(id, { ... })`                                                                 | Replace/refresh a document in place.                            |
| `documents({ knowledge_base_id? })`                                                            | List documents.                                                 |
| `getDocument(id)`                                                                              | Get a document (refreshed status).                              |
| `deleteDocument(id)`                                                                           | Delete a document (may be approval-gated).                      |
| `remove(knowledgeBaseId)`                                                                      | Delete a knowledge base (may be approval-gated).                |

## Proposals and promotion

Available on `BrainHandle` (i.e. via `createClient()`).

```ts theme={"theme":"css-variables"}
// Propose writes for adjudication instead of writing them.
// `payload` is REQUIRED; run_id / source / idempotency_key are optional.
const receipt = await naive.brain.propose({
  run_id: runId,
  idempotency_key: `wb:${runId}`,
  payload: {
    objective: "Bill Acme correctly",
    claims_observed: [{ subject: "Acme Corp", predicate: "prefers", object: "quarterly invoicing" }],
    open_questions: ["Which entity signs the MSA?"],
  },
});
receipt.mode;      // 🔴 read this — see the warning below
receipt.reused;    // true when idempotency_key replayed an existing envelope

const { proposals } = await naive.brain.proposals({ status: "proposed", limit: 50 });
const one = await naive.brain.proposal(id);

await naive.brain.promote(id);              // → accepted, payload applied before it resolves
await naive.brain.reject(id, { reason: "duplicate" });
```

<Warning>
  **`propose()` is a receipt, not an outcome, and under the default gateway mode the canonical
  write happens anyway.** What resolves is the envelope plus the proposals minted from it. Each
  proposal starts at `proposed` and reaches
  `auto_promoted | accepted | rejected | merged | quarantined | needs_evidence` later. The
  `mode` field on the result is the memory-gateway mode: under the default **`shadow`**, the
  canonical write **also** happens — so a "proposal" is not necessarily a deferral. Read `mode`
  before assuming nothing landed.

  `propose()` is idempotent when you pass `idempotency_key`: a replay resolves with
  `reused: true` and the original envelope, minting no second proposal.
</Warning>

<Info>
  `promote` is the SDK verb; `POST …/proposals/{id}/accept` is the wire name. They are the same
  operation — the route predates the verb and renaming a live route is not something the client
  may do. A proposal already in a terminal state throws `conflict`.
</Info>

## `forget` tells you whether it happened

```ts theme={"theme":"css-variables"}
const res = await naive.brain.forget({ scope: "entity", scope_ref: "Acme Corp" });
if (res.decision === "park") {
  // 🔴 NOTHING WAS ERASED — a human must approve res.approvalId first
  await naive.forTenant(alice.id).approvals.wait(res.approvalId);
} else {
  // erased: tombstone + erase
}
```

`forget` is approval-gated: a **human** (session) caller executes immediately; an **agent**
caller queues an approval and the erase does **not** happen. On `BrainHandle` this returns a
`Decision<T>` folded from the response body, because the two outcomes differ only by HTTP
status (200 vs 202) and the transport discards it. The legacy `BrainClient.forget` returns
`Promise<unknown>` — a resolved promise there reads as "it happened", and under an agent
credential it did not.

## Not available: partitions, lanes, reaffirm

<Warning>
  `brain.partition(name)`, `brain.lane(role)` and `brain.reaffirm(...)` exist on the type but
  **refuse** with `NotImplementedError`. Measured: no mounted brain route accepts a `partition`
  or a `lane` field, no `brain_*` table has an agent level, and the string `reaffirm` occurs
  nowhere in the API, the database package or the platform packages. A `partition("support")`
  view that sent `knowledge_base_id: "support"` would issue an **unscoped** read while telling
  you it was scoped — which is worse than refusing.

  **A brain is not a partition, and addressing one is not addressing the other.**
  `naive.brains` reaches the *N brains* the database has always held; `partition` and `lane`
  are the *levels inside one brain* that [the DSL declares](/docs/architecture/brain) and the store
  does not yet carry. The two refusals stay exactly where they were.

  The registry is data (`MISSING_ROUTES`), a test walks every namespace and asserts the
  refusing set is *exactly* that table, and a second test asserts every row is absent from the
  published OpenAPI spec — so a row cannot survive its route landing. That is how
  `brain.bindToAgent` left the table: `POST /v1/brain/connect` was mounted and published, and
  `BrainRef.connect()` now sends.
</Warning>

Every method is also exposed as an [agent tool](/docs/sdk/agent-tools) under the `brain` primitive, so an LLM can call it directly via `naive.agentTools()`. See the [Brain guide](/docs/getting-started/brain) for concepts and the [API reference](/docs/api-reference/brain/overview) for wire details.
