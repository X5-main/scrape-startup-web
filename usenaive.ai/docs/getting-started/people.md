> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# People

> B2B people search and work-contact enrichment — find people by title, company, industry, geography or seniority, or enrich an identity you already hold.

<Warning>
  **Opt-in, and off by default.** `people` returns personal data and sends lookups to a
  subprocessor, so a fresh workspace has it disabled and an *absent* AccountKit entry
  denies rather than defaulting open. An admin must enable it deliberately. See
  [Enabling the primitive](#enabling-the-primitive).
</Warning>

People turns a filter or an identifier into a work profile. Two operations, and the
difference is whether you already know who you want:

* **`search`** — a query over a population. Filters in, candidates out. *"Who exists that matches this?"*
* **`enrich`** — a lookup of one known entity. An identifier in, that person's record out. *"I already have this lead, fill in the rest."*

They are not two steps of one pipeline. Enrich is what you run over a list you already
own — rows from your CRM, a form fill, a LinkedIn URL your agent found.

## CLI first

```bash theme={"theme":"css-variables"}
# Find people by filter
naive people search --title "VP Engineering" --company stripe --limit 5

# Enrich someone you already know
naive people enrich --linkedin linkedin.com/in/patrickcollison --include-contact
naive people enrich --name "Patrick Collison" --company stripe

# Async batch, for lists above the 50-record sync ceiling
naive people batch --identities '[{"linkedin":"linkedin.com/in/a"},{"name":"B","company":"stripe"}]'
naive people task <task-id>

# Governance surfaces, both free
naive people terms
naive people erase --email someone@example.com
```

## Operations

| Operation | Endpoint                  | Cost                                      |
| --------- | ------------------------- | ----------------------------------------- |
| `search`  | `POST /v1/people/search`  | 3× provider spend                         |
| `enrich`  | `POST /v1/people/enrich`  | 3× provider spend                         |
| `batch`   | `POST /v1/people/tasks`   | 3× provider spend, every run in the batch |
| `terms`   | `GET /v1/people/terms`    | free                                      |
| `erasure` | `POST /v1/people/erasure` | free                                      |

Both endpoints bill **3× the provider spend the request actually incurred**, read off the run
rather than set as a per-record list price — which also removes an arbitrage the old prices
had, where the same work email cost 8 credits via search or 20 via enrich.

* **An empty result is still billed**, including a no-match enrich, because the run happened
  and we are invoiced for it. The 404 reports the charge in `credits_used`.
* **A failed run is never billed.**
* Non-zero charges have a **0.1-credit minimum**, so a run under \$0.0017 bills 0.1.
* Every charge records `provider_usd`, its basis (`actual` or `projected`) and the multiplier,
  all returned by `GET /v1/usage` — so a bill can be recomputed rather than trusted.

## search

Billed on what the run cost, so a larger `limit` costs more because it is more provider work
— not because a list price was multiplied by rows.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/people/search \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "filters": {
        "title": "VP Engineering",
        "company": "stripe",
        "geo": "San Francisco"
      },
      "limit": 5,
      "include_contact": false
    }'
  ```

  ```typescript sdk theme={"theme":"css-variables"}
  const { data } = await naive.people.search(
    { title: "VP Engineering", company: "stripe" },
    5,
    false, // include_contact
  );
  ```
</CodeGroup>

Filters are `title`, `company`, `industry`, `geo`, `seniority` — at least one is required,
and a request with none is refused before any provider run. Keys outside that set are not
read, so check your spelling: a mistyped filter is a broader, billable search.

There is no name filter — searching by person name is not an expressible query. Use
`enrich` with a name plus a company instead.

`seniority` has no native provider input; it is folded into the title terms and re-checked on
the returned rows, and empty records and duplicates are dropped. That narrows what you
receive, not the bill — the provider charged for the rows it returned.

<Note>
  `limit` caps at 50. Above that, use `POST /v1/people/tasks`.
</Note>

## enrich

One identity in, one record out. A no-match returns **404 carrying the charge in
`credits_used`** — establishing that someone is absent from the dataset costs a provider run,
so it is billed like any other; you
are not charged for a miss.

| Identity            | Resolves today                                          |
| ------------------- | ------------------------------------------------------- |
| `linkedin`          | Yes — a profile URL or bare path                        |
| `name` + `company`  | Yes                                                     |
| `name` + `location` | Accepted as an alternative disambiguator                |
| `email`             | On the contract, not resolvable by the current provider |
| `domain`            | On the contract, not resolvable by the current provider |
| `name` alone        | **Rejected** — a bare name cannot be disambiguated      |

The request contract is deliberately wider than what the current provider resolves, so a
caller's stored identity does not become invalid when the provider changes. An identity
that cannot be resolved is refused with a hint naming the ones that can — never answered
with an empty result.

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/people/enrich \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"identity": {"name": "Patrick Collison", "company": "stripe"}, "include_contact": true}'
```

```json theme={"theme":"css-variables"}
{
  "data": {
    "id": "apify_patrickcollison",
    "name": "Patrick Collison",
    "title": "Chief Executive Officer",
    "company": "Stripe",
    "linkedin_url": "https://linkedin.com/in/patrickcollison",
    "firmographics": {
      "company_name": "Stripe",
      "industry": "internet",
      "employee_count": 1001,
      "location": "South San Francisco, California, United States"
    }
  },
  "credits_used": 10,
  "credits_remaining": 4990
}
```

### Email deliverability is reported, not assumed

With `include_contact`, the response carries `email_verification` alongside the record:

| `status`         | Means                                                    |
| ---------------- | -------------------------------------------------------- |
| `valid`          | the mailbox itself was confirmed to exist                |
| `invalid`        | the mailbox was confirmed not to exist                   |
| `invalid_syntax` | not a well-formed address                                |
| `no_mail_server` | the domain publishes no MX record, so it accepts no mail |
| `domain_only`    | the domain accepts mail; **the mailbox was not checked** |
| `unverified`     | the verifier did not run, or returned nothing usable     |

`mailbox_verified` is `true` only when a mailbox was actually probed and `null` when it was
not — `domain_only` is the common case, because a catch-all domain accepts any local part,
so the address existing proves little. A work email that could not be verified is returned
**labelled**, never dropped and never passed off as verified.

An address is also frequently just absent: the provider finds one or it does not, and an
absent email is absent rather than a placeholder.

If the verification provider fails at the **account** level — a bad token, a suspended plan
— the call errors. It does not answer `unverified`, because a lapsed credential would
otherwise degrade every response to plausible-looking unverified data forever.

## What this returns — and what it never will

Work details only: employer, title, LinkedIn URL, firmographics, and — with
`include_contact` — a work email. It does **not** return a home address, a personal phone
number, date of birth, or consumer attributes.

Two fields sit on the response schema and are never populated today:

* **`phone`** — a policy choice, not a provider gap. Person-level phone numbers are
  personal numbers, which the B2B boundary withholds. Kept on the schema so adding a
  confirmed work-phone source later is not a breaking change.
* **`match_likelihood`** — the current provider returns a profile or nothing and scores
  neither. Kept for a provider that does score matches.

The boundary is enforced in the adapter rather than at the route, so no downstream caller
can reach an excluded field by accident.

## Batch

`POST /v1/people/tasks` accepts up to `PRIMITIVE_BATCH_MAX` identities (1,000 by default),
queues a job, and returns 202. Poll `GET /v1/people/tasks/{id}`.

Worst-case credits are held at submit and settled against the records actually matched, so
unmatched rows are refunded. The tally reports **unmatched, invalid and failed as three
separate numbers** — collapsing them would tell a caller whose provider is rate-limiting
that none of their 1,000 leads exist, which is a confident, actionable, wrong answer.

If more than **half** the records fail outright at the provider the whole job fails with
the first error attached, rather than returning a mostly-empty result that reads like a
successful run. A worker that dies mid-job loses its lease after 15 minutes and the job is
requeued, up to three attempts.

## Retries and double-charging

Send an `Idempotency-Key` header on `search` and `enrich`. It deduplicates the response
*and* becomes the credit-ledger reference, so a retried call cannot be charged twice.
Without one, a retry after a dropped connection is a second billable lookup.

## Acceptable use

Governed by **Terms of Service Section 18**, which every customer accepts.
`GET /v1/people/terms` returns the same prohibitions as JSON, so an agent can read them
without opening a web page — **before** the primitive is enabled, which is the only moment
reading them can change a decision. It is the one People route that answers for a kit that
has not opted in.

This data is **not a consumer report** under the FCRA or any state analogue. You may not
use it to make or inform decisions about:

* Employment — recruitment, promotion, retention
* Credit eligibility or terms
* Insurance underwriting or pricing
* Housing or tenant screening

Nor to profile individuals on sensitive characteristics. These restrictions apply
regardless of how the data is combined with other sources.

You are the **controller** of personal data you obtain. You need your own lawful basis,
your privacy notice must disclose that you use third-party B2B data providers, and you
must honour data-subject requests.

## Retention and erasure

* **Sync `search` and `enrich` store nothing.** Records are normalized, returned, dropped.
* **Async batches are the only store**, pruned automatically at 90 days.
* **The audit log records who ran a lookup, not who was looked up.**

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/people/erasure \
  -H "Authorization: Bearer nv_sk_your_key" \
  -d '{"email": "someone@example.com"}'
```

Erasure is **unmetered** on purpose: charging credits to honour a deletion request would
make a legal obligation into a cost centre and give a tenant a reason to delay one.

It is also the one People route that **works while the primitive is switched off**. Turning
`people` off is exactly when you still hold batch records and owe a subject a deletion, so
the opt-in gate does not apply here — only to the routes that acquire data. A valid key is
still required, and a revoked agent profile is still refused.

<Warning>
  Erasure removes a subject from **Naive's** stored results. It does not reach the upstream
  provider's dataset — a subject who wants removing at source must apply to the provider
  directly, and the next lookup would otherwise re-create the record. The response says so
  explicitly.
</Warning>

## Enabling the primitive

`people` is registered `optIn: true`, so it is disabled on a fresh workspace and an absent
AccountKit entry denies. Enable it in the AccountKit's `primitives_config` (dashboard →
Account Kits, or the kit's `people: { enabled: true }`).

Every refusal names the same gate, `subprocessor_consent_required`, whether the kit never
enabled `people` or explicitly turned it back off — for an opt-in primitive those are one
state, and the Default kit a workspace starts on is already the second one. MCP callers
meet the same gate — `naive_people_*` is refused under exactly the conditions
`/v1/people/*` is.

## Related

* [Company Data](/docs/getting-started/company-data) — the employer, rather than the person
* [Social Data](/docs/getting-started/social-data) — public posts and comments
* [Reviews](/docs/getting-started/reviews) — reviews and local listings (the `business` primitive, "Reviews & Listings")
* [Data primitive status](/docs/getting-started/data-primitives-status) — what is verified live and what is not
