> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain Tools

> The twenty-one naive_brain_* content tools agents use to list a company's brains, connect one to an agent, and read and write its knowledge base and semantic memory.

When the **brain** primitive is enabled on the Account Kit, agents connected to the Naive MCP
server get **twenty-one** `naive_brain_*` content tools. Every tool enforces the primitive's kit
gate and the per-tenant plan quota; destructive tools additionally route through the approval
gate, so an agent call returns a `park` envelope carrying an approval id rather than a result.
Credit costs match the API.

<Note>
  `brain` is **opt-in**: an Account Kit with no `brain` entry is a refusal, not a default. It is
  one of exactly two opt-in primitives, and the platform default seeds it `enabled: false`.

  **These tools are still listed.** Off-by-default is not a decision somebody took about this
  tenant, so the listing predicate does not withhold them — hiding them would take the
  advertised list from every unconfigured tenant. What a call gets instead is an actionable
  `403` naming the primitive to enable. The listing rule only withholds a tool whose primitive
  the kit **explicitly disables**, which an opt-in primitive's config cannot express.
</Note>

<Info>
  There are **twenty-six** `naive_brain_*` tools in total. The twenty-one below cover *what the
  brains know*. The other five — `naive_brain_proposals`, `naive_brain_proposal`,
  `naive_brain_decide_proposal`, `naive_brain_writebacks`, `naive_brain_writeback` — cover *how
  something comes to be known*, and are documented on
  [Runtime & brain governance tools](/docs/mcp/runtime-and-governance).
</Info>

## The brains

A company may hold several brains, exactly one flagged as the default. Every tool below that
takes an optional `knowledge_base_id` resolves to that default when you omit it.

| Tool                      | Description                                                                 | Notes                            |
| ------------------------- | --------------------------------------------------------------------------- | -------------------------------- |
| `naive_brain_list`        | List the company's brains.                                                  | no arguments                     |
| `naive_brain_get`         | One brain, by `knowledge_base_id`.                                          |                                  |
| `naive_brain_create`      | Create a brain (`name?`, `is_default?`).                                    |                                  |
| `naive_brain_delete`      | Delete a brain + its documents.                                             | sensitive · approval-gated       |
| `naive_brain_connect`     | Record which brain an agent works out of (`agent_id`, `knowledge_base_id`). | **not** a permission — see below |
| `naive_brain_connections` | List agent→brain connections (`agent_id?`, `knowledge_base_id?`).           |                                  |
| `naive_brain_disconnect`  | Drop an agent's connection (`agent_id`).                                    | takes an agent, not a brain      |

<Warning>
  **`naive_brain_connect` grants nothing.** Every content tool already accepts
  `knowledge_base_id` and resolves it company-scoped, so any agent the `brain` primitive admits
  can already address any of the company's brains. Connecting records *which* brain an agent
  works out of, on `agents.metadata.brain_knowledge_base_id`. It is a default for clients that
  honour it, not an isolation boundary — and it does **not** change what an unscoped
  `naive_brain_recall` reads, which is still the company default.
</Warning>

<Warning>
  **These three tools see only the calling agent's own tenant user.** A brain is company-wide
  (`brain_knowledge_bases` has no tenant column), but an agent is not: the three tools filter
  on `agents.tenant_user_id`, resolved from the calling key exactly as `/v1/employees` resolves
  it. `naive_brain_connections` therefore lists your tenant's connections rather than the
  company's, and `naive_brain_connect` / `naive_brain_disconnect` on another tenant user's
  agent answer `resource_not_found`. `naive_brain_disconnect` on an agent that has no
  connection answers `resource_not_found` too.
</Warning>

## Documents

| Tool                           | Description                                           | Notes                                      |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------ |
| `naive_brain_query`            | Ask the knowledge base; grounded answer + citations.  | 0.08 credits                               |
| `naive_brain_add_document`     | Ingest a document (`text` \| `url` \| `file_base64`). | 0.1 credits + 0.0002 per KB (capped at 10) |
| `naive_brain_replace_document` | Replace/refresh a document in place.                  | 0.1 credits + 0.0002 per KB (capped at 10) |
| `naive_brain_list_documents`   | List documents + status.                              |                                            |
| `naive_brain_get_document`     | Get one document (refreshed status).                  |                                            |
| `naive_brain_delete_document`  | Delete a document.                                    | sensitive · approval-gated                 |

<Note>
  **`naive_brain_query` — check `answer_mode` before quoting `answer`.** `synthesized` means
  prose written over the sources; `grounded` means the retrieved passages themselves, numbered
  `[1]`, `[2]`, …. Those numbers label passages inside `answer` — they are **not** positions in
  `citations`, which lists each source document once. `grounded` is a normal `200` — it is what a
  deployment with no answerer returns, and the fallback when a configured one fails. The
  document tools also need an embedding leg: without one, `naive_brain_query` and
  `naive_brain_add_document` refuse with `feature_not_configured` and a hint, while every
  semantic-memory tool below keeps working. See [Runtime &
  configuration](/docs/api-reference/brain/runtime).
</Note>

## Semantic memory

| Tool                   | Description                                | Notes                      |
| ---------------------- | ------------------------------------------ | -------------------------- |
| `naive_brain_remember` | Write a durable semantic memory episode.   |                            |
| `naive_brain_recall`   | Recall structured facts/entities/episodes. |                            |
| `naive_brain_think`    | Synthesize memory + docs with gaps.        | 0.08 credits               |
| `naive_brain_graph`    | Entity/relation knowledge graph.           |                            |
| `naive_brain_timeline` | Chronological memory events/facts.         |                            |
| `naive_brain_forget`   | Tombstone/forget a memory scope.           | sensitive · approval-gated |

## The run loop

These two are the halves of a run: what the brain already knows before work starts, and what the
run learned once it finished. They have no equivalent in the retired `memory` primitive.

| Tool                      | Description                                                                                                     | Notes                                      |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `naive_brain_attach`      | Attach a **read capsule** for a goal — what the brain already knows, assembled *before* the work starts.        | read-only                                  |
| `naive_brain_consolidate` | The run-end **debrief**: what was learned, what was decided, what was left open. Produces a writeback envelope. | writes arrive as proposals, not as beliefs |

<Note>
  `consolidate` does not canonise anything by itself. What a run asks the brain to record arrives as
  a **writeback**, becomes a **proposal**, and waits for a decision — see
  [Runtime & brain governance tools](/docs/mcp/runtime-and-governance). That is why the write half of
  the loop is safe to call at the end of every run.
</Note>

## Example

```json theme={"theme":"css-variables"}
{
  "tool": "naive_brain_query",
  "arguments": { "question": "What is our refund policy?" }
}
```

Naming a brain is one field, on the tools that read or write content:

```json theme={"theme":"css-variables"}
{
  "tool": "naive_brain_query",
  "arguments": {
    "question": "What is our refund policy?",
    "knowledge_base_id": "00a21080-e247-4935-8efb-a6c1051c189b"
  }
}
```

A sensitive tool called by an agent returns a **`park` envelope**, not an error. `isError` is
`false`, `verdict` is `"park"`, and the recovery step carries the approval id to poll:

```json theme={"theme":"css-variables"}
{
  "ok": false,
  "verdict": "park",
  "reason": "approval_required",
  "action": "brain.forget",
  "retryable": false,
  "recovery": [
    {
      "kind": "wait_for_approval",
      "approval_id": "appr-uuid",
      "expires_at": "2026-08-01T12:00:00.000Z",
      "on_expiry": "deny",
      "poll_tool": "naive_approvals_get"
    }
  ]
}
```

An approval window that elapses becomes a **denial**, which is why `on_expiry` is stated on every
park rather than left as a default nobody chose.

## What has no MCP tool

Measured against this build. These brain capabilities exist as designs or as REST paths that
refuse, and deliberately have no tool rather than a tool that 404s:

* **Beliefs, lessons, retention, levels and decisions** as browsable surfaces — the REST routes
  answer `501 not_configured` and name their missing dependency.
* **Reaffirming a belief** — `POST /v1/brain/beliefs/{id}/reaffirm` refuses.
* **A brain status tool.** One was designed and dropped: its only implementation reports the brain
  services' base URLs, which is operator information, not tenant information. Use
  `naive brain status` from the CLI instead.

See [Brain tools for migration](/docs/migration-guides/memory-to-brain) if you are moving off the
`memory` primitive, and the [API reference](/docs/api-reference/brain/overview) for wire details. For
non-company knowledge (the open web), use the `search` tools instead.
