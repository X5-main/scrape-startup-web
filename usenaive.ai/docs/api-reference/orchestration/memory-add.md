> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Add Memory

> POST /v1/memory — Store persistent knowledge for future sessions.

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

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/memory \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Our primary domain is example.com, brand color #FF6B00",
      "target": "memory"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "status": "memory_requested",
    "run": {
      "run_id": "run-abc-123"
    }
  }
  ```
</ResponseExample>

## Request Body

| Field      | Type   | Required | Description                                                                            |
| ---------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| `content`  | string | Yes      | The knowledge to store                                                                 |
| `target`   | string | No       | The memory file to target. Free text, passed into the prompt; defaults to `MEMORY.md`. |
| `agent_id` | string | No       | Specific agent to store memory for (default: CEO)                                      |

## Behavior

<Warning>
  **`201 memory_requested` is not a write receipt.** This endpoint does not store
  your text. It starts a run on the legacy lead agent with a prompt asking it to add
  the content to its memory file, and returns as soon as that run is accepted.

  Whether the fact is recorded, recorded verbatim, or recorded at all is up to the
  model. `status: "memory_requested"` is literally what it says.

  **You must verify.** Poll [`GET /v1/memory`](/docs/api-reference/orchestration/memory-list)
  and check the content is there. Do not treat a `201` as durable storage.

  If you need a write whose success you can check, use the
  [Brain API](/docs/api-reference/brain/overview): `POST /v1/brain/remember` writes an
  episode, and `POST /v1/brain/consolidate` returns the proposals it created so you
  can follow each one.
</Warning>

The legacy runtime owns the `MEMORY.md` file in each agent profile. The sidecar
mirrors the updated file back to the datastore, which is what `GET /v1/memory`
reads — so there is a lag between the request and anything being visible.

`target` is passed through into the prompt as free text; it is not validated
against a set of values, and it defaults to `MEMORY.md`.

## Errors

If the sidecar is unreachable the request fails. There is a direct-insert fallback,
but it is enabled only in a development environment — in production the error is
returned.
