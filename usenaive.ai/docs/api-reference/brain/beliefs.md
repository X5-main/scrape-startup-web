> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Beliefs

> GET /v1/brain/beliefs — every belief with the three filters that produced it, so 'why did recall not return it' has an answer.

A **belief** is a claim the company holds: a subject, a predicate and an object, with a
status and a confidence. Every row carries `recallable` and the three filters behind it,
so "why did recall not return that?" always has an answer.

## List beliefs

```
GET /v1/brain/beliefs?status=&level=&key=&include_shadowed=&cursor=&limit=
```

| Parameter          | Values              | Notes                                                                |
| ------------------ | ------------------- | -------------------------------------------------------------------- |
| `status`           | one status          | Overrides the default filter entirely.                               |
| `level`            | `company` \| `team` | Anything else is `400 invalid_input`. **There is no `agent` level.** |
| `key`              | normalised key      | Exact match.                                                         |
| `include_shadowed` | `true`              | Removes the default status filter.                                   |
| `cursor` · `limit` | keyset, max 200     | See [`GET /v1/limits`](/docs/api-reference/governance/limits).            |

<Note>
  With no `status` and no `include_shadowed=true`, the list is restricted to `candidate`,
  `active` and `confirmed` — the recallable set. `applied_filters` in every response states
  exactly what was applied.
</Note>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "items": [
      {
        "belief_id": "claim-…",
        "key": "acme-ltd:renewal-owner",
        "statement": "ACME Ltd renewal owner is Dana Okafor",
        "subject": "ACME Ltd",
        "predicate": "renewal owner is",
        "object": "Dana Okafor",
        "level": "company",
        "partition": null,
        "lane": null,
        "lane_unavailable_because": "no lane column exists on any brain_* table",
        "status": "confirmed",
        "confidence": 0.8,
        "valid_from": "2026-07-29T09:00:00.000Z",
        "valid_to": null,
        "observed_at": "2026-07-29T09:00:00.000Z",
        "created_at": "2026-07-29T09:00:02.000Z",
        "expires_at_unavailable_because": "brain_claims has valid_from/valid_to (temporal validity of the assertion) and no retention column; a belief in this build never lapses",
        "supersedes": null,
        "shadows": null,
        "shadows_unavailable_because": "shadowing is a level relation; with no agent level and no lane, a company/team pair cannot be resolved here",
        "uses": null,
        "uses_unavailable_because": "no recall-count column exists on brain_claims",
        "recallable": true,
        "filters": {
          "status_ok": true,
          "not_expired": true,
          "not_expired_measures": "valid_to (temporal validity), not retention",
          "scan_ok": true,
          "scan_ok_measures": "the knowledge base's own status is 'active'"
        }
      }
    ],
    "next_cursor": null,
    "applied_filters": {
      "status": ["candidate", "active", "confirmed"],
      "level": "none",
      "key": "none"
    },
    "levels_absent": {
      "agent": "no brain_* table carries an agent level; `level: \"agent\"` cannot be returned"
    }
  }
  ```
</ResponseExample>

## `recallable` and the three filters

`recallable` is the AND of three checks, each reported separately so a `false` can
be diagnosed without guessing:

| Filter        | Asks                                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| `status_ok`   | is the status one of `candidate`, `active`, `confirmed`?                                                    |
| `not_expired` | is `valid_to` in the future, or absent?                                                                     |
| `scan_ok`     | is the knowledge base this belief lives in `active`? A KB still provisioning, or in error, is not readable. |

Each filter carries a `*_measures` string saying what it actually tested.

## `not_expired` does not measure retention

`valid_to` is the temporal validity of the assertion, not a retention deadline. No
retention column exists on any brain table: `expires_at` is absent from the response,
beliefs never lapse, and [`GET /v1/brain/retention`](#retention) answers `501`. If your
product promises that stored knowledge expires, this API does not enforce it today.

## Fields that are `null` everywhere

| Field       | Why                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `lane`      | no lane column exists on any brain table                                                       |
| `shadows`   | shadowing is a level relation, and with no agent level and no lane there is nothing to resolve |
| `uses`      | no recall-count column exists                                                                  |
| `partition` | `null` for company-level beliefs; the KB name for team-level ones                              |

## One belief

```
GET /v1/brain/beliefs/{id}
```

The same object, unpaged. `404 not_found` if the belief does not belong to your
company.

***

## The four that refuse

These share the `/v1/brain` prefix and answer `501 not_configured`.

### Reaffirm

`POST /v1/brain/beliefs/{id}/reaffirm`

A reaffirmation is an event — *this was checked again, on this date, by this actor* — and
no table records one.

### Lessons

`GET /v1/brain/lessons` · `POST /v1/brain/lessons`

Lessons are a separate vocabulary from beliefs and have no table yet.

### Retention

`GET /v1/brain/retention`

`501` means there is no retention mechanism at all — not "no policies configured".
`brain({ retention })` in `naive.config.ts` compiles a per-content ceiling that nothing
server-side reads or stores.

### Decisions

`GET /v1/brain/decisions`

A read view over the policy decision ledger filtered to brain resources; no ledger exists
yet. See [`GET /v1/policy/decisions`](/docs/api-reference/governance/policy).

***

## Availability

These operations exist at the **company** prefix only. There is no
`/v1/users/{user_id}/brain/beliefs`. Company-scoped and tenant-scoped brain
operations are listed in the [Brain overview](/docs/api-reference/brain/overview).

Like every `/v1/brain` route, they require the `brain` primitive to be enabled on
the AccountKit and are metered against the plan quota.
