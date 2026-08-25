> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Attach & consolidate

> POST /v1/brain/attach and POST /v1/brain/consolidate — the run loop: read a capsule before the work, write the debrief after it.

Two endpoints that bracket a run. `attach` gives an agent a compact, citable
snapshot of what the company believes; `consolidate` sends back what the run
learned.

They are a **pair**. The citation tokens `attach` hands out are the tokens
`consolidate` accepts back, which is how a run can say *this contradicts what you
told me* without inventing an id.

***

## Attach

```
POST /v1/brain/attach
```

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/attach \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "goal": "Reply to the ACME renewal thread",
      "entities": ["ACME Ltd"],
      "artifacts_touched": ["thread:acme-renewal"],
      "since_watermark": "2026-07-29T08:00:00.000Z"
    }'
  ```
</RequestExample>

### Body

| Field               | Type              | Required | Limits                                 |
| ------------------- | ----------------- | -------- | -------------------------------------- |
| `goal`              | string            | Yes      | 1–4000 chars                           |
| `entities`          | string\[]         | No       | max 20, each ≤255 chars                |
| `artifacts_touched` | string\[]         | No       | max 50, each ≤255 chars                |
| `since_watermark`   | ISO 8601 datetime | No       | the `as_of` from your previous capsule |
| `knowledge_base_id` | UUID              | No       | defaults to the company's default KB   |

### Response — the capsule

```json 200 theme={"theme":"css-variables"}
{
  "space": { "knowledge_base_id": "kb-…", "scope_kb_ids": ["kb-…"] },
  "as_of": "2026-07-30T10:00:00.000Z",
  "beliefs": [
    { "id": "B1", "statement": "ACME Ltd renews annually in September", "confidence": 0.9, "status": "confirmed" }
  ],
  "working_set": [
    { "id": "W1", "kind": "decision", "title": "Standard renewal discount is 10%", "object_id": "obj-…" }
  ],
  "deltas": { "newly_active": [], "invalidated": [] },
  "open_questions": ["Who signs on the ACME side this year?"],
  "citation_map": { "B1": "claim-uuid-…" },
  "capsule_id": "sha256:…",
  "render": "[brain @ 2026-07-30T10:00:00.000Z]  kb=kb-…\n\n## Beliefs — cite as [B1]..[Bn] …"
}
```

<Note>
  **Read `render` first.** It is a prose rendering of the whole capsule written for
  a model to read. The JSON beside it is for machines. An agent that reads only the
  JSON has to re-derive the labelling scheme that `render` already explains.
</Note>

### The three fields that make a capsule useful

| Field          | Why it exists                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `as_of`        | The watermark. Echo it back as `since_watermark` on the next attach and `deltas` tells you only what changed.                                                |
| `citation_map` | `{"B7": "<claim uuid>"}`. `B7` is the label the agent sees; the UUID is what the system stores. Send `B7` back in `consolidate.contradicts` and it resolves. |
| `capsule_id`   | `sha256(company \| kb \| as_of \| ordered claim ids)`. An audit token: two runs that quote the same `capsule_id` read the same beliefs.                      |

Belief ordering is **deterministic** — by confidence, then observation time, then
id — so `[B1..Bn]` labels are reproducible for identical data. A label is stable
within a capsule, not across capsules; always resolve through `citation_map`.

`deltas.newly_active` and `deltas.invalidated` are empty when you send no
`since_watermark`, because there is nothing to diff against.

***

## Consolidate

```
POST /v1/brain/consolidate
```

The run-end debrief. Returns `202 Accepted` — **the writes are proposals, not
facts.**

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/consolidate \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "objective": "Reply to the ACME renewal thread",
      "learned": [
        { "subject": "ACME Ltd", "predicate": "renewal owner is", "object": "Dana Okafor",
          "confidence": 0.8, "quote": "Dana will handle renewals from Q3." }
      ],
      "decided": [{ "title": "Offer the standard 10% renewal discount" }],
      "open": ["Confirm the new PO number"],
      "contradicts": ["B1"],
      "citations": { "B1": "claim-uuid-…" }
    }'
  ```
</RequestExample>

### Body

| Field               | Type                                                | Limits                                                                               |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `objective`         | string                                              | ≤4000                                                                                |
| `learned[]`         | `{subject, predicate, object, confidence?, quote?}` | max 100. `subject`/`predicate` ≤500, `object` ≤2000, `quote` ≤2000, `confidence` 0–1 |
| `decided[]`         | `{title, summary?}`                                 | max 50                                                                               |
| `open[]`            | string                                              | max 50, each ≤2000                                                                   |
| `contradicts[]`     | string                                              | max 50. Capsule tokens (`"B7"`) **or** claim UUIDs                                   |
| `citations`         | `Record<string,string>`                             | max 100 entries — resolves the tokens in `contradicts`                               |
| `knowledge_base_id` | UUID                                                | optional                                                                             |

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  {
    "mode": "shadow",
    "envelope": { "id": "wb-…", "status": "…", "…": "…" },
    "proposals": [{ "id": "prop-…", "status": "…", "…": "…" }]
  }
  ```
</ResponseExample>

<Warning>
  **`202` is the whole point.** Nothing you send to `consolidate` becomes company
  truth on its own. Each `learned` item becomes a **proposal** routed through the
  memory gateway, and the gateway's mode decides what happens next:

  | `mode`             | What happens                                          |
  | ------------------ | ----------------------------------------------------- |
  | `shadow` (default) | proposals are recorded; nothing is auto-promoted      |
  | `proposal`         | new agent memory is routed through the proposal queue |
  | `enforced`         | canonical writes require promotion                    |

  Read `mode` in the response — do not assume it. Accepting a proposal is
  `brain.proposal.accept`, which
  [defaults to human approval](/docs/api-reference/governance/policy).

  Track what happened to your proposals with
  [`GET /v1/brain/proposals`](/docs/api-reference/brain/operations).
</Warning>

### `quote` is what makes a claim reviewable

`quote` is the span the claim was drawn from. A proposal with a quote can be
checked against its source by a human in seconds; one without has to be
re-investigated. Include it whenever the claim came from text.

## Per-tenant twins

Both operations also exist under `/v1/users/{user_id}/brain/…`, which scopes the
call to one tenant rather than the company. Use the company form for company
knowledge and the tenant form when the knowledge belongs to one customer.
