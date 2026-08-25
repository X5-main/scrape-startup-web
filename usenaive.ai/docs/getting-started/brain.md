> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain

> Company-scoped knowledge base with document RAG, semantic memory, grounded answers with citations, and provable deletion.

Brain is your company's shared, governed knowledge base and memory. Agents ingest documents once, then ask grounded questions with citations, or write durable **semantic memory** (facts, entities, relationships) that compounds across runs. The canonical source of truth is a Postgres spine (documents, chunks, episodes, claims, provenance); an optional semantic engine can be projected on top for richer recall, but with it unconfigured every read is served by the spine alone (`GET /v1/brain/ops-status` shows what is enabled).

<Note>
  Brain is **opt-in** and disabled by default. Enable it in the AccountKit's `primitives_config` (`brain: { enabled: true }`) or calls return `403 forbidden` with `reason` `subprocessor_consent_required` — for an explicit `{ enabled: false }` exactly as for an absent entry, because `brain` is one of the three opt-in slugs and `primitiveAvailability` answers `not_yet_enabled` for both.
</Note>

## Two layers: documents and semantic memory

| Layer               | Write                                        | Read                                   | Use for                                              |
| ------------------- | -------------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| **Document RAG**    | `add`/`note` (ingest text/url/file)          | `query` (grounded answer + citations)  | Source material: docs, policies, specs, pages        |
| **Semantic memory** | `remember` (episode → facts/entities/claims) | `recall`, `think`, `graph`, `timeline` | Durable facts: decisions, preferences, relationships |

Both live in a company-scoped knowledge base — a **brain**.

## Many brains, one default

A company may hold several brains; exactly one is the **default**, used by any content call that names no `knowledge_base_id`. A company that never creates one gets `"Default Brain"` minted lazily on its first content call.

```bash theme={"theme":"css-variables"}
naive brain list                               # every brain, the default marked
naive brain create "Support Brain"
naive brain create "Legal Brain" --default     # create and make default
naive brain default "Support Brain"            # promote an existing ACTIVE brain
```

Removing the default brain promotes the oldest surviving brain in the same transaction. A `409` from `create --default` means the brain was created but the default swap failed — promote it with `naive brain default <id from details.knowledge_base_id>` rather than re-running the create.

An **agent** can be connected to a brain as its working default:

```bash theme={"theme":"css-variables"}
naive brain connect "Support Brain" --agent "Support Sam"
naive brain recall "refunds" --agent "Support Sam"
naive brain disconnect --agent "Support Sam"
```

<Warning>
  A connection is a default, not a permission: any caller the `brain` primitive admits can reach any of the company's brains by `knowledge_base_id`. Connect/list/disconnect are scoped to your own agents (filtered on `agents.tenant_user_id`).
</Warning>

In [`naive.config.ts`](/docs/architecture/brain) the same shape is `brain({...})` for one, `brains({ default, declared })` for several; bind an agent with `hive.view("support", { can: [...] })`.

## CLI first

```bash theme={"theme":"css-variables"}
# Ingest source material
naive brain add --file ./handbook.pdf
naive brain add --text "Our refund policy is 30 days" --source policy

# Ask a grounded question (0.08 credits)
naive brain query "What is our refund policy?"
naive brain query "What is our refund policy?" --brain "Support Brain"

# Write + recall durable semantic memory
naive brain remember "Acme Corp prefers quarterly invoicing" --source crm
naive brain recall "Acme invoicing"
naive brain think "How should we bill Acme?"

# Explore the knowledge graph / timeline
naive brain graph --entity "Acme Corp"
naive brain timeline --entity "Acme Corp"
```

`--kb <uuid>`, `--brain <name|id>`, and `--agent <id|name>` name a brain on any content command; without them you get the default brain.

## Credits

| Operation                                                              | Cost                                                              |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `query`, `think`                                                       | 0.08 credits                                                      |
| document ingest (`add`, `note`, `replace-doc`)                         | 0.1 credits + 0.0002 per KB of content, capped at 10 per document |
| `recall`, `graph`, `timeline`, `remember`, `forget`, KB/doc list & get | Free                                                              |

Plan-quota metering also applies per tenant for the `brain` primitive (HTTP, SDK, and MCP).

## Grounded answers with citations

`query` returns an answer plus citations mapped to your ingested documents. Citations are scoped to the calling company and knowledge base — unmappable citations are dropped, so answers never leak another tenant's sources.

```json theme={"theme":"css-variables"}
{
  "answer": "Our refund policy allows returns within 30 days of purchase...",
  "citations": [
    { "document_id": "doc-uuid", "title": "handbook.pdf", "snippet": "Refunds are accepted within 30 days..." }
  ],
  "knowledge_base_id": "kb-uuid",
  "answer_mode": "synthesized",
  "session_id": "sess-uuid"
}
```

Pass the returned `session_id` back to `query`/`think` to continue the same conversation thread.

Branch on `answer_mode`, not on the presence of `answer`: `synthesized` is prose written over the sources, `grounded` is the retrieved passages themselves numbered `[1]`, `[2]`, … alongside the same citations. `grounded` is a successful `200` — a deployment with no answerer always returns it, and it is also the fallback when a configured answerer fails. [Runtime & configuration](/docs/api-reference/brain/runtime) covers which state a deployment is in and how to read it off `GET /v1/brain/status`.

## Governance and deletion

* **Approval-gated destruction.** Deleting a knowledge base or document and `forget` return `202` with a pending approval for agent (API-key) callers; session owners execute immediately.
* **Provable deletion.** Deletes are provider-first and return a `DeletionReceipt` distinguishing `provider_confirmed` from `verified`. Tombstones prevent forgotten data from resurfacing through the async semantic projection.
* **Memory Gateway.** Agent-produced memory can be routed through a proposal → review → promotion pipeline (`shadow` / `proposal` / `enforced` modes). Review proposals in Mission Control.

## Beliefs

A **belief** is one durable claim — the unit `remember` produces and `recall` returns. `GET /v1/brain/beliefs` lists them (keyset-paged); each row states the filters that produced it (`status_ok`, `not_expired`, `scan_ok`). The default list is the recallable set; use `include_shadowed=true`, `status=`, `key=`, or `level=` (`company` | `team`) to filter — the response echoes what it applied under `applied_filters`.

Beliefs carry temporal validity (`valid_from` / `valid_to`) but no retention lifecycle, and there is no `agent` level.

## Proposals and writebacks

When the Memory Gateway is in `proposal` or `review` mode, an agent's write becomes a **proposal** for a human to accept; the envelope a run submitted is a **writeback**.

```bash theme={"theme":"css-variables"}
naive brain proposals --status pending          # the queue
naive brain proposals prp_41c9 --events         # one proposal's history
naive brain writebacks --run run_2f9a           # what a run asked to record
naive brain status                              # the operator view for this company
```

| REST                                                      | Purpose                             |
| --------------------------------------------------------- | ----------------------------------- |
| `GET /v1/brain/proposals`, `GET …/proposals/{id}`         | the queue and one proposal          |
| `POST …/proposals/{id}/accept`                            | promote it — an **operator** action |
| `POST …/proposals/{id}/reject`, `…/merge`, `…/quarantine` | the other three outcomes            |
| `GET …/proposals/{id}/events`                             | the proposal's own history          |
| `GET /v1/brain/writebacks`                                | what runs asked the brain to record |

Only `accept` is approval-gated (as `brain.proposal.accept`): agent callers get `202` pending approval; session owners execute immediately. `reject`, `merge`, and `quarantine` apply directly. In IaC, `promote` and `forget` are not grantable abilities in `view({ can: [...] })`.

## Attach and consolidate

```bash theme={"theme":"css-variables"}
naive brain attach "refund the duplicate charge on invoice 4471" --entity "Acme Corp"
naive brain consolidate --objective "refund 4471" \
  --learned "Acme Corp|prefers|quarterly invoicing" \
  --decided "refunded 4471 under the 30-day policy" \
  --open "does Acme want the credit applied to the next invoice?"
```

`attach` is the read capsule taken *before* work — what the brain already knows about the goal (`--since <iso8601>` limits it to changes after a watermark). `consolidate` is the write debrief taken *after* — learned, decided, and open items.

`naive brain metrics` reports process-global counters; use `naive brain status` (or `GET /v1/brain/ops-status`) for the company view.

## Not served yet

These endpoints answer `501 not_configured` naming what is absent:

| Operation                              | Missing                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `POST /v1/brain/beliefs/{id}/reaffirm` | no table records re-checks or recall counts                                       |
| `GET` / `POST /v1/brain/lessons`       | no table distinguishes a lesson from a claim                                      |
| `GET /v1/brain/retention`              | no retention column exists; `brain({ retention })` compiles a ceiling in IaC only |
| `GET /v1/brain/decisions`              | a read view over `policy_decisions`, which does not exist                         |

## Interfaces

* **API** — `/v1/brain/*` (and per-user `/v1/users/:id/brain/*`). See the [Brain API reference](/docs/api-reference/brain/overview).
* **SDK** — `naive.brain.*` for the default brain, `naive.brains.*` for the collection. See the [brain sub-client](/docs/sdk/sub-clients/brain).
* **CLI** — `naive brain ...`. See the [CLI reference](/docs/cli/brain).
* **MCP** — 26 `naive_brain_*` tools. See [MCP brain tools](/docs/mcp/brain).
* **IaC** — `brain({...})` / `brains({ default, declared })`. See [The brain](/docs/architecture/brain).

## Typical workflow

```
1. Enable the brain primitive in the AccountKit
2. naive brain add --file ./policies.pdf        → ingest source material
3. naive brain docs                              → confirm status: ready
4. naive brain query "..."                       → grounded answers + citations
5. naive brain remember "..."                    → durable semantic facts
6. naive brain recall / think / graph / timeline → compounding memory
```
