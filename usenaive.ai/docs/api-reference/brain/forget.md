> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Forget & Deletion

> POST /v1/brain/forget — tombstone a semantic memory scope with provable, projection-safe deletion.

`forget` tombstones a scope of semantic memory so it stops appearing in recall and is purged from the semantic projection. It's the right-to-be-forgotten / correction path. **Approval-gated** for agent (API-key) callers: returns `202` with a pending approval that an owner approves; session owners execute immediately.

<ParamField body="scope" type="string" required>
  One of: `company`, `knowledge_base`, `document`, `episode`, `entity`, `claim`, `source`.
</ParamField>

<ParamField body="scope_ref" type="string" required>
  Identifier for the scope (e.g. a document id, entity name, or the company id).
</ParamField>

<ParamField body="knowledge_base_id" type="string">
  Optional KB id.
</ParamField>

<ParamField body="reason" type="string">
  Optional reason recorded on the tombstone.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/forget \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "scope": "entity", "scope_ref": "Acme Corp", "reason": "customer erasure request" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  { "forgotten": true, "scope": "entity", "scope_ref": "Acme Corp" }
  ```
</ResponseExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  { "status": "pending_approval", "approval": { "id": "appr-uuid", "action_type": "brain.forget" } }
  ```
</ResponseExample>

## How deletion stays provable

* A tombstone is written **first**, so reads immediately filter the scope even before the async projection purge completes (the semantic read path falls back to the tombstone-filtered Postgres spine while a delete is in flight).
* The projection worker then purges the scope from the semantic sidecar **when one is
  configured** and records a deletion proof. On the hosted product the sidecar is not
  configured (`GET /v1/brain/status` → `services.gbrain.configured: false`), so the
  tombstone plus the Postgres purge is the whole deletion path.
* Company/KB/document deletes additionally return a `DeletionReceipt` (`provider_confirmed` vs `verified`) — see [overview](/docs/api-reference/brain/overview).
