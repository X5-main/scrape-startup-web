> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Spend

> GET /v1/spend — what you were billed and what your caps governed, reported as two labelled views.

```
GET /v1/spend?period=day|week|month|year
```

**This endpoint answers two questions, not one**, and reports both:

| View       | Table                 | The question it answers                                                                                                             |
| ---------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `billed`   | `credit_transactions` | What is the customer **charged**? These are the rows [`GET /v1/billing/transactions`](/docs/api-reference/billing/transactions) renders. |
| `governed` | `tenant_spend_events` | What do budget **caps enforce against**?                                                                                            |

They are genuinely different quantities and **they do not reconcile** — see
[Why the two differ](#why-the-two-differ). Collapsing them into a single
"spend" number is what allowed this endpoint to report `buckets: []` — rendered
on screen as "Nothing spent this month" — beside a Billing page showing 38
charges in the same session.

`period` defaults to `month`. Anything outside the four values is
`400 invalid_input`.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "period": { "name": "month", "start": "2026-07-01T00:00:00.000Z" },
    "billed": {
      "source": "credit_transactions",
      "cents": 2920,
      "note": "credit_transactions over this window, CHARGES ONLY (negative rows; grants, refunds and top-ups are not spend). This is what the customer pays and what Billing renders."
    },
    "governed": {
      "source": "tenant_spend_events",
      "cents": 2760,
      "note": "tenant_spend_events over this window. This is what budget caps accumulate against, and a charge reaches it only once the subject's kit already carried a budget — so it is smaller than `billed` by every charge no cap could have seen, and larger by card and trading spend, which is not a credit charge at all."
    },
    "reconciliation": {
      "billed_not_governed_cents": 160,
      "governed_not_billed_cents": 0,
      "note": "the two views are different quantities and do not reconcile to each other. billed_not_governed_cents is spend no cap could have stopped; governed_not_billed_cents is capped spend that is not a platform-credit charge. null means the caller's read scope does not extend to company-wide totals."
    },
    "environment_scoped": false,
    "environment_scoped_note": "this sum spans sandbox and production; the closed reserve path scopes to one environment, so this number can exceed what any single cap counted",
    "credit_ledger_note": "buckets keyed credit:<action>:<day> roll up platform-credit charges (credit_transactions) that carry no per-tenant spend row; charges already mirrored into tenant_spend_events are excluded, so nothing is counted twice",
    "credit_ledger_cents": 2920,
    "unattributed_cents": 160,
    "unattributed_note": "tenant-keyed buckets count only spend attributed to a budgeted agent; the credit:<action>:<day> buckets carry the platform-credit charges that reached none. credit_ledger_cents is the same window from credit_transactions (what Billing renders); unattributed_cents is the part no budget cap observed, because a subject with no budget has no spend recorded at all. null means the caller's read scope does not extend to company-wide totals.",
    "buckets": [
      {
        "key": "8f1c…",
        "view": "governed",
        "label": "acme-support",
        "cents": 1840,
        "cap_cents": 5000,
        "class": "reserve",
        "enforced": true,
        "cap_period": "month"
      },
      {
        "key": "b207…",
        "view": "governed",
        "label": "pilot-2",
        "cents": 920,
        "cap_cents": 2000,
        "class": "meter",
        "enforced": false,
        "cap_period": "month"
      },
      {
        "key": "credit:email_send:2026-07-14",
        "view": "billed",
        "label": "email_send",
        "cents": 160,
        "cap_cents": null,
        "class": "meter",
        "enforced": false,
        "cap_period": null
      }
    ]
  }
  ```
</ResponseExample>

## `billed` and `governed`

Each view names the table it was read from in its own `source` field, so a
client never has to infer which question a number answered.

<Warning>
  `cents: null` on a view means **withheld, not zero**. A company-wide total is a
  company-wide fact, so a credential sealed to a single tenant gets `null` for
  `billed` and for both `reconciliation` figures. `governed.cents` stays a number
  for that caller — it is narrowed to that tenant's own rows, which is a per-tenant
  fact. Zero is a claim ("nothing was spent"); `null` is the absence of one.
</Warning>

## Why the two differ

`reconciliation` names both directions of the gap, because each one is a
different diagnosis.

| Field                       | Meaning                                             | What a non-zero value tells you                                           |
| --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `billed_not_governed_cents` | Charged, but no budget cap observed it.             | **Spend nothing could have stopped.** This is the number to alert on.     |
| `governed_not_billed_cents` | Counted against a cap, but on no credit-ledger row. | Card and trading spend — real money that is not a platform-credit charge. |

The first direction is structural, not a bug in your configuration: a credit
charge is mirrored into the spend ledger only while the budget scope is bound,
and that scope binds only when the subject's Account Kit **already** carries a
budget. So a subject with no cap spends with nothing recorded — not merely
uncapped, but unaccumulated, which also means a cap set later cannot see the
spend that motivated setting it.

<Warning>
  This is why a `governed` figure of `0` does not mean "nothing spent". Read
  `billed` beside it; the two together are the honest answer to "what is this
  costing me".
</Warning>

`credit_ledger_cents` and `unattributed_cents` are the same two numbers as
`billed.cents` and `reconciliation.billed_not_governed_cents`, under the names
they had before the views were labelled. They are retained for callers written
against them and will not drift.

## `class` and `enforced`

| `class`   | `enforced` | Behaviour at the cap                                                                                                     |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `reserve` | `true`     | The amount is reserved atomically, under an advisory lock, **before** the action executes. Over-cap actions are refused. |
| `meter`   | `false`    | Spend is recorded. A soft cap escalates to approval; no cap meters only. Nothing is refused on the basis of this number. |

`class` is `reserve` only when the tenant's budget declares `hard: true`.

## `cents` on a `governed` row is rounded; on a `billed` row it is not

The ledger stores each charge to four decimal places of a cent, because the
cheapest primitives cost less than one: a URL read is 0.25¢, an email 0.08¢, a
brain query 0.4¢.

On a `governed` bucket, `cents` is the **window total rounded to a whole cent**,
so a tenant that has only made cheap calls can read `0` while its cap has
genuinely counted them — compare against `cap_cents` before concluding a tenant
has spent nothing. The cap itself is evaluated on the unrounded total.

On a `billed` bucket, `cents` is **fractional**, to four decimal places: rounding
there would zero exactly the sub-cent charges those buckets exist to surface.

## `environment_scoped: false`

<Warning>
  This sum spans sandbox and production; the cap it is compared against scopes to one
  environment. `cents` can therefore exceed `cap_cents` while nothing was ever refused. If
  you alert on "spend approaching cap", restrict tenants to one environment or expect false
  positives from sandbox traffic.
</Warning>

## `buckets` holds rows from both tables — read `view`

`buckets` is one list carrying detail for **both** views. Every row declares
which one it belongs to in `view`, so the list can be partitioned without
inspecting `key`:

| `view`     | `key`                   | `label`                                                                     | One row per         |
| ---------- | ----------------------- | --------------------------------------------------------------------------- | ------------------- |
| `governed` | the `tenant_user_id`    | the tenant's label, falling back to its external id, falling back to `null` | tenant              |
| `billed`   | `credit:<action>:<day>` | the action type, e.g. `email_send`                                          | action type per day |

`billed` rows are the platform-credit charges that produced **no** tenant spend
row — a CLI or API tenant with no Account Kit context has only these, which is
how this report came to answer `buckets: []` against a billed month. Charges
already mirrored into `tenant_spend_events` are excluded from them (matched on
`'credit:' || action_type` plus `reference_id`), so no charge appears in a
`billed` bucket and a `governed` bucket both.

<Warning>
  Do not add the two kinds of row together. They come from different tables and
  measure different things; the totals to use are `billed.cents` and
  `governed.cents`.
</Warning>

For a per-action breakdown of **one tenant's governed spend**, use
[`GET /v1/teams/{team}/tenants/{tenantUserId}/cost`](/docs/api-reference/runtime/cost)
— and note that `enforced` on that endpoint answers a different question and is
always `false`.

## Windows

`period.start` is computed from the requested period, not from any tenant's own
budget window. `cap_period` on each bucket is that tenant's actual cap window. If
they differ, the spend figure and the cap are measured over different spans —
compare `cap_period` to `period.name` before dividing one by the other.
