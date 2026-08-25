> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Remove Memory

> DELETE /v1/memory — Remove a memory entry by text match or ID.

<Warning>
  **Deprecated — `naive memory` and `/v1/memory`.** `memory` is retired as a product noun: one row cannot be both a curated item and a lesson without re-creating the two-vocabulary problem the brain exists to end. It survives as a wire name only — the primitive slug, the path, and the table names.

  **Use instead:** `naive brain remember / naive brain forget`

  These routes keep answering. Nothing is removed and no response shape changes: the
  deprecation is announced in headers only, which are purely additive. Every response
  from this router carries `Deprecation` ([RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) —
  the value is a Structured Field Date, `@` plus epoch seconds, not the boolean `true`
  some pre-RFC clients look for),
  `Link rel="deprecation"`, `Warning: 299` and `X-Naive-Deprecation-Id: dep.primitive.memory`.
  There is **no `Sunset` header**, because this is frozen with no sunset date — a
  `Sunset` on a frozen row would be a date the platform has not promised.

  Announced 2026-07-29. Level `frozen`. The freeze ends when
  `company_containers with provider='hermes' and status='running' reaches zero` — not on a date.

  Replacement surface: [the Brain API](/docs/api-reference/brain/overview) — live today, not a preview surface.
</Warning>

## Remove by Text Match

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X DELETE https://api.usenaive.ai/v1/memory \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "text": "brand color",
      "target": "memory"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "success": true,
    "id": "mem-abc-123",
    "removed_content": "Our primary domain is example.com, brand color #FF6B00"
  }
  ```
</ResponseExample>

### Request Body

| Field      | Type   | Required | Description                                |
| ---------- | ------ | -------- | ------------------------------------------ |
| `text`     | string | Yes      | Substring to match against stored memories |
| `target`   | string | No       | `memory` or `user`                         |
| `agent_id` | string | No       | Agent whose memories to search             |

Searches for the first memory containing the `text` substring and removes it.

***

## Remove by ID

```bash theme={"theme":"css-variables"}
curl -X DELETE https://api.usenaive.ai/v1/memory/mem-abc-123 \
  -H "Authorization: Bearer nv_sk_live_..."
```

```json 200 theme={"theme":"css-variables"}
{
  "success": true,
  "id": "mem-abc-123"
}
```

Directly removes a specific memory entry by its ID.
