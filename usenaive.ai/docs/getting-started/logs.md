> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Logs

> Per-user activity audit trail — the primitives that emit activity events, what each event carries, and how to query or stream them.

Vault, connections, brain, approvals, payments, wallet, phone and trading emit an
**activity event** scoped to the [tenant user](/docs/getting-started/users). Use logs to build a
per-user timeline, an agent profile audit view across all users, or a live dashboard feed.

<Warning>
  **Coverage is partial, and the trail is best-effort.** The primitives above write events;
  the rest do not yet, so an empty result means "nothing this trail records happened", not
  "nothing happened". `logTenantEvent` also swallows its own insert failure so an audit write
  can never fail the action it describes — an absent row does not prove an absent act.
  Reconcile against `approvals`, which is committed on the transaction path. See
  [the decision ledger](/docs/architecture/decision-ledger).
</Warning>

## CLI First

```bash theme={"theme":"css-variables"}
naive logs tail --user alice                  # one user
naive logs all --action connection.execute    # cross-user (agentProfile view)
```

## Tools

| Tool              | Type | Description                                           |
| ----------------- | ---- | ----------------------------------------------------- |
| `logs_query`      | Core | Query a user's events (filter by action, time, limit) |
| `logs_cross_user` | Core | Query events across all users (agentProfile view)     |
| `logs_stream`     | Core | Live SSE tail of `activity.logged` events             |

## Querying

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/users/{user_id}/logs?action=vault.put&limit=50" \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const { events } = await naive.forUser(alice.id).logs.query({ action: "vault.put", limit: 50 });
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "events": [
    {
      "id": "036d9c3e-3c0b-4ba0-92a5-36da71087446",
      "tenant_user_id": "90a734a7-5f5a-4c4f-ba8f-80f770971d16",
      "actor_type": "agent",
      "action": "vault.put",
      "entity_type": "vault_entry",
      "entity_id": "instantly.api_key",
      "created_at": "2026-06-04T06:43:36Z"
    }
  ]
}
```

### Parameters

| Param    | Type   | Required | Default | Description                                                                                 |
| -------- | ------ | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `action` | string | No       | —       | Filter by action, e.g. `vault.put`, `vault.delete`, `connection.execute`, `approval.denied` |
| `after`  | string | No       | —       | ISO timestamp — only events after this                                                      |
| `limit`  | number | No       | 50      | Max events (cap 200)                                                                        |

## Cross-user (agentProfile view)

```bash theme={"theme":"css-variables"}
curl "https://api.usenaive.ai/v1/logs?user_id={user_id}&action=connection.execute" \
  -H "Authorization: Bearer nv_sk_your_key"
```

## Live stream (SSE)

```bash theme={"theme":"css-variables"}
# Bearer travels in the header; emits `activity.logged` events as they happen
curl -N https://api.usenaive.ai/v1/users/{user_id}/logs/stream \
  -H "Authorization: Bearer nv_sk_your_key"
```

<Info>
  The SSE stream is ideal for a live dashboard timeline — it pushes each `activity.logged`
  event the moment it's recorded, no polling required.
</Info>

## Error Handling

| Error           | Cause                                  | Recovery                                  |
| --------------- | -------------------------------------- | ----------------------------------------- |
| `not_found`     | Invalid `user_id`                      | Use `GET /v1/users` for valid ids         |
| `invalid_input` | Malformed `after` timestamp or `limit` | Use an ISO timestamp and a positive limit |

## Typical Workflow

```
Build a per-user activity feed in your app
    │
    ├─ GET /v1/users/alice/logs?limit=50     → Initial timeline (most recent first)
    │
    ├─ GET /v1/users/alice/logs/stream       → Subscribe to live updates (SSE)
    │   → activity.logged: vault.put
    │   → activity.logged: connection.execute
    │
    └─ GET /v1/logs?action=vault.put         → AgentProfile view across all users
```
