> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Knowledge Bases

> List, create, inspect and delete a company's brains, and record which brain an agent works out of.

A company may hold several knowledge bases — brains — and exactly one is flagged
`is_default`. Content calls that name no `knowledge_base_id` resolve to the default; a
company that has never created a brain gets `"Default Brain"` minted lazily on its first
content call.

<Note>
  Names are not unique — two creates with the same name give two brains with different ids.
  Address a brain by `id` whenever you have one.
</Note>

## List knowledge bases

`GET /v1/brain`

Rows whose provisioning failed are listed too, with `status: "error"`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/brain \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "knowledge_bases": [
      { "id": "kb-uuid", "name": "Default Brain", "status": "active", "is_default": true, "created_at": "2026-07-01T00:00:00.000Z" }
    ],
    "count": 1
  }
  ```
</ResponseExample>

## Create a knowledge base

`POST /v1/brain`

<ParamField body="name" type="string">
  Name for the knowledge base (1–120 chars). Defaults to "Default Brain".
</ParamField>

<ParamField body="is_default" type="boolean">
  Make this the company's default knowledge base.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "name": "Engineering Docs", "is_default": false }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  { "id": "kb-uuid", "name": "Engineering Docs", "status": "provisioning", "is_default": false }
  ```
</ResponseExample>

`is_default: true` swaps the company default only after provisioning succeeds, so a
provisioning failure leaves the old default in place.

<Warning>
  A `409 duplicate_record` from this route means the brain **was created** but could not be
  made the default. Recover with [`PATCH /v1/brain/{id}`](#make-a-knowledge-base-the-default);
  do not retry the create — that would add a second brain.
</Warning>

## Make a knowledge base the default

`PATCH /v1/brain/{knowledge_base_id}` — re-points the company default at an existing
knowledge base.

<ParamField body="is_default" type="boolean" required>
  Must be `true`. To stop a brain being the default, name the one that should be instead.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X PATCH https://api.usenaive.ai/v1/brain/00a21080-e247-4935-8efb-a6c1051c189b \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "is_default": true }'
  ```
</RequestExample>

Idempotent — patching the current default returns it unchanged. `400 invalid_input` if the
knowledge base is `provisioning` or `error`; `404 resource_not_found` for a non-UUID or
another company's id.

## Get one knowledge base

`GET /v1/brain/{id}` — the same public row `GET /v1/brain` lists, by id. `404
resource_not_found` for an id that is not a UUID, or belongs to another company.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/brain/00a21080-e247-4935-8efb-a6c1051c189b \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "id": "00a21080-e247-4935-8efb-a6c1051c189b",
    "name": "Support Brain",
    "provider": "postgres",
    "status": "active",
    "is_default": false,
    "created_at": "2026-07-01T00:00:00.000Z",
    "updated_at": "2026-07-01T00:00:00.000Z"
  }
  ```
</ResponseExample>

## Connect an agent to a brain

`POST /v1/brain/connect` — record which brain an agent works out of.

<ParamField body="agent_id" type="string" required>
  An `agents.id` UUID belonging to your own tenant user.
</ParamField>

<ParamField body="knowledge_base_id" type="string" required>
  The brain's id.
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/connect \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "agent_id": "c62c69e3-69aa-4136-b571-fded6ce5a28b",
          "knowledge_base_id": "00a21080-e247-4935-8efb-a6c1051c189b" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "agent_id": "c62c69e3-69aa-4136-b571-fded6ce5a28b",
    "agent_name": "Support Sam",
    "agent_role": "support",
    "tenant_user_id": null,
    "knowledge_base_id": "00a21080-e247-4935-8efb-a6c1051c189b",
    "knowledge_base_name": "Support Brain",
    "connected_at": "2026-07-31T11:00:00.000Z"
  }
  ```
</ResponseExample>

Returns `200`, not `201`: an agent works out of one brain, and connecting an
already-connected agent re-points it rather than creating a second binding.

Scoping: `knowledge_base_id` is company-wide, but `agent_id` is tenant-scoped — another
tenant user's agent answers `404 resource_not_found`.

<Warning>
  A connection is not a permission and not a redirect: content routes still resolve
  `knowledge_base_id` from the request or the company default, never from the agent's
  binding. The connection is honoured by clients that read it (`naive brain … --agent`) and
  by `POST /v1/runs`'s `brain_knowledge_base_id` field.
</Warning>

## List connections

`GET /v1/brain/connections?agent_id=&knowledge_base_id=` — both filters optional.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "connections": [
      {
        "agent_id": "c62c69e3-69aa-4136-b571-fded6ce5a28b",
        "agent_name": "Support Sam",
        "agent_role": "support",
        "tenant_user_id": null,
        "knowledge_base_id": "00a21080-e247-4935-8efb-a6c1051c189b",
        "knowledge_base_name": "Support Brain",
        "connected_at": "2026-07-31T11:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```
</ResponseExample>

Agents with no connection do not appear. A connection whose brain has since been deleted
does appear, with `knowledge_base_name: null`. The list covers your own agents'
connections only.

## Disconnect

`DELETE /v1/brain/connections/{agentId}` → `204 No Content`.

Disconnecting an agent with no connection answers `404 resource_not_found` (`No brain is
connected to that agent`). An agent outside your tenant answers the same `404`.

## Runtime status

`GET /v1/brain/status` — model configuration, per-service health, and KB / document /
projection counts. The one brain route that is not plan-metered.

The full response shape, what each field means, which inference legs a deployment resolved
and how, and what a degraded-but-still-serving brain looks like are on
[Runtime & configuration](/docs/api-reference/brain/runtime).

## Delete a knowledge base

`DELETE /v1/brain/{id}` — deletes the brain and all its documents (permanent).
Approval-gated as `brain.kb.delete` for agent callers.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/brain/00a21080-e247-4935-8efb-a6c1051c189b \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

| Status           | Meaning                                                                           |
| :--------------- | :-------------------------------------------------------------------------------- |
| `204 No Content` | deleted                                                                           |
| `202 Accepted`   | not deleted — pending-approval envelope with the approval id a human must resolve |

```json 202 theme={"theme":"css-variables"}
{
  "status": "pending_approval",
  "approval": { "id": "appr-uuid", "action_type": "brain.kb.delete", "status": "pending" }
}
```

Deleting a brain does not clear connections pointing at it — those agents appear in
`GET /v1/brain/connections` with `knowledge_base_name: null`. Deleting the default promotes
the oldest surviving knowledge base in the same transaction; the successor is recorded on
the activity log (`brain.kb.default_changed`), not in the `204` response.
