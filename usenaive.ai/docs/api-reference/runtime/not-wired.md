> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# The refusal contract

> What a 501 on /v1/teams means, how it differs by runtime, and the one class of answer on this surface that is empty without refusing.

Some operations on `/v1/teams` are **declared, addressable and refused**. Which
ones depends on the tenant's runtime, so this page describes the *contract* and
sends you to [Durable Runtime API](/docs/api-reference/runtime/overview) for the
current membership and counts.

## The contract

Every refusal on this surface has the same shape:

```jsonc 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "not_configured",
    "message": "<what, in a sentence>",
    "hint": "This operation is declared and addressable; its backing store does not exist in this build.",
    "details": {
      "surface": "durable-runtime",
      "runtime": "durable" | "hermes",
      "missing": ["<dependency>: <why it is absent>", "…"]
    }
  }
}
```

Three properties you can rely on:

1. **`missing` is a list** — every unmet prerequisite is named at once.
2. **The request is authorised before it is refused** — a bad credential still gets `401`.
3. **`details.runtime` names which runtime the refusal is about** — the same operation
   refuses for different reasons on the two runtimes.

## The three refusals, and they are different facts

| `details.runtime`                             | what it means                                                                            | what to do                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `"hermes"`                                    | this is a durable-runtime concept and the legacy runtime has no equivalent to forward to | use the legacy address named in the refusal, or move the tenant                                      |
| `"durable"`, with `missing` naming a **verb** | the runtime implements this and there is no control-plane translation for it yet         | nothing you can do from here — but the capability exists, which is a different fact from "not built" |
| either, with `missing` naming a **store**     | nothing implements it on either runtime                                                  | wait, or use the alternative named                                                                   |

Where the refusal came from the runtime itself, its own sentence is carried through
verbatim in `error.details.runtime_said`.

## The exception: reads that are empty without refusing

<Warning>
  These reads answer from the task mirror on both runtimes. A durable tenant has no rows in
  that mirror, so they return a well-formed `200` with nothing in it:

  | Operation                | a durable tenant gets                                                   |
  | ------------------------ | ----------------------------------------------------------------------- |
  | `GET …/tenants/{id}`     | `provider: "durable"` beside all-zero board counts and `spent_cents: 0` |
  | `GET …/events`           | `{ "items": [], "next_cursor": null }`                                  |
  | `GET …/runs`             | `{ "items": [], "next_cursor": null }`                                  |
  | `GET …/runs/{id}/events` | `{ "items": [], "next_cursor": null }`                                  |
  | `GET …/cost`             | `buckets: []`                                                           |
  | `GET …/diagnostics`      | `findings: []`                                                          |

  Consequences: `GET …/tenants/{id}` and `GET …/board` disagree (read the board for the
  board), and `GET …/runs/{id}/events` is empty — the transcript is served as SSE at
  `GET …/runs/{id}/stream` instead. Branch on `provider`.
</Warning>

## Why writes are not quietly forwarded

Writes are never forwarded to the other runtime: the legacy runtime is frozen, and the
response shape would lie (`POST …/submit` returns `manifest_digest`, which the legacy
runtime does not have). If you want the legacy behaviour, call the
[legacy address](/docs/api-reference/orchestration/overview) directly.

## Checking programmatically

```bash theme={"theme":"css-variables"}
curl -s -o /dev/null -w '%{http_code}\n' \
  -X POST "https://api.usenaive.ai/v1/teams/support/tenants/$TENANT/submit" \
  -H "Authorization: Bearer $NAIVE_API_KEY" \
  -H 'Content-Type: application/json' -d '{"goal":"probe"}'
# 501  → refused for THIS tenant; read error.details.runtime before concluding
#         anything about the build
# 201  → admitted; read the response, do not assume the old shape
```

`error.details.missing` and `error.details.runtime` are machine-readable and stable
enough to log. Do not parse `error.message`. A `501` is a statement about one tenant, not
about the API — the same request against a tenant on the other runtime may be served.
