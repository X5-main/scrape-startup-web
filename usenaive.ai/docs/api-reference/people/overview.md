> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# People API Reference

> All People REST endpoints — B2B search, contact enrichment, async batch, terms and erasure.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. **Opt-in**: until a kit sets
`people: { enabled: true }` every call is refused `403 subprocessor_consent_required` — a kit
that never enabled it and a kit that turned it back off are one state to an opt-in primitive,
so both give that reason. MCP equivalents (`naive_people_*`) meet the same gate.

`POST /v1/people/erasure` is the **one exception** and answers whether or not the kit grants
`people`. The gate is there to stop personal data being acquired without a grant; a deletion
acquires nothing, and the workspace that most needs to erase is the one that enabled the
primitive, ran batches and then switched it off. It still needs a valid key, and a revoked
agent profile is still refused.

`GET /v1/people/terms` is the one exception — it answers for any key, enabled or not, because
it is the document you read to decide whether to enable the primitive. Gating it would make
"read the prohibitions, then opt in" impossible to carry out.

Metered on 3× the provider run's real spend. A no-match is billed too — the run happened —
nothing. Send `Idempotency-Key` on `search` and `enrich`: it deduplicates the response and
becomes the credit-ledger reference, so a retry cannot be charged twice.

See [People](/docs/getting-started/people) for the governance boundary — B2B work details only,
never for employment, credit, insurance or housing decisions.

## Endpoints

| Method | Path                   | Description                                                                    |
| ------ | ---------------------- | ------------------------------------------------------------------------------ |
| POST   | `/v1/people/search`    | Find people by `title`, `company`, `industry`, `geo`, `seniority` (limit ≤ 50) |
| POST   | `/v1/people/enrich`    | Resolve one identity (`linkedin`, or `name` + `company`) into a work profile   |
| POST   | `/v1/people/tasks`     | Async batch enrich, up to `PRIMITIVE_BATCH_MAX` identities                     |
| GET    | `/v1/people/tasks/:id` | Batch status and, once complete, the matched records                           |
| GET    | `/v1/people/terms`     | Acceptable-use terms as JSON (unmetered)                                       |
| POST   | `/v1/people/erasure`   | Data-subject erasure by `email` or `linkedin` (unmetered)                      |

## Notes

* `email`-only and `domain`-only enrich stay on the request contract but are **refused** by
  the current provider rather than answered empty.
* `phone` and `match_likelihood` are on the response schema and never populated — the first
  by policy, the second because the provider scores no matches.
* With `include_contact`, `email_verification` reports what was actually established:
  `valid`, `invalid`, `invalid_syntax`, `no_mail_server`, `domain_only` or `unverified`.
  `mailbox_verified` is `true` only when a mailbox was probed.
