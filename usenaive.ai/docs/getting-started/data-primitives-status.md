> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Data Primitives: What Is Not Done

> A single honest list of everything incomplete across People, Company Data and Social Data — read this before planning around them.

The three data primitives are at different stages. This page exists so that is knowable
from one place rather than discovered mid-integration.

**Last reviewed:** 2026-08-03

## One-line status

| Primitive                                     | Works today?                                          | Blocked on              |
| --------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| [Social Data](/docs/getting-started/social-data)   | ✅ **Bluesky + Hacker News** — live, no credential     | nothing                 |
| [Social Data](/docs/getting-started/social-data)   | ⚠️ **X + Reddit** — adapters written, unverified live | a working Apify account |
| [People](/docs/getting-started/people)             | ⚠️ **Adapters written, unverified live**              | a working Apify account |
| [Company Data](/docs/getting-started/company-data) | ⚠️ **Adapters written, unverified live**              | a working Apify account |

## One vendor, one token

Everything except Bluesky and Hacker News runs on **Apify actors** behind a single
`APIFY_API_TOKEN`. There is no per-provider subscription to procure and no optional code
path that behaves differently depending on which keys exist.

<Warning>
  **The Apify account must be in good standing, and currently is not.** The token
  authenticates, but the account carries unpaid invoices and every platform feature is
  disabled — an actor run returns `403 platform-feature-disabled`. Until that is cleared, X,
  Reddit, People and Company Data cannot execute at all. Bluesky and Hacker News are
  unaffected, because they need no credential.
</Warning>

A suspended or lapsed account **fails loudly** rather than degrading. Email verification and
the company tech-stack lookup both used to swallow every provider exception, which meant a
suspended account returned "unverified" and "no technologies" indefinitely and looked
healthy. Account-level faults now propagate; only genuinely transient actor failures
degrade a record, and the record says which datasets contributed.

## Social Data

Bluesky and Hacker News are verified against the live APIs: real posts, working URLs, and a
real comment thread round-tripped through collect.

Not done:

* **X and Reddit are unverified live.** The actors are wired, priced and covered by hermetic
  tests, but no run has completed while the Apify account is suspended. When the People
  adapter first met a real API it had three genuine bugs — a query shape matching nothing, a
  mishandled empty result, and a field with the wrong type. Assume the same class of issue.
* **Reddit is batch-only, by measurement.** 53–219 seconds for five posts on live runs, so
  both sync entry points refuse it. Not a limitation to be lifted; a shape.
* **`include_comments` is unsupported on Bluesky and X**, and refused rather than billed.
* **`prefer_official` is refused for X and Reddit** — there is no official-API adapter, and
  claiming one would be worse than saying so.

## People

Not done:

* **Unverified against the live provider** while the account is suspended.
* **Email-only and domain-only enrich do not resolve.** The enrich actor keys on LinkedIn
  identity, so `linkedin`, or `name` plus `company`, are what work. Both other shapes stay
  on the request contract and are refused with a hint rather than answered empty.
* **No phone numbers**, by design — the provider's person-level phone fields are personal
  numbers, which the B2B boundary withholds.
* **`match_likelihood` is never populated.** The current provider returns a profile or
  nothing and scores neither.
* **No provider waterfall.** One provider, one attempt. A miss returns `null`, so match
  rates are that provider's match rates.
* **No provider evaluation has been run.** Coverage and match rate against a real target
  list — the numbers that decide whether this primitive is any good — are unmeasured.

## Company Data

Not done:

* **Unverified against the live provider** while the account is suspended.
* **The funding overlay is best-effort.** It is keyed on a Crunchbase slug derived from the
  company name, and derivation is inexact — a company whose slug diverges will not match.
  A miss degrades the record to firmographics, and `sources` reports what contributed.
* **Search cannot filter on funding, stage or headcount.** Those filters are refused before
  any actor starts rather than silently dropped, because the search dataset has no such
  fields.
* **`recent_news`, `employee_growth_6m` and `tags` are never populated.** No actor in the
  set returns news, headcount growth needs two observations over time, and market category
  tags are deliberately not conflated with a real detected `tech_stack`.

## Across all three

* **Async batch scope is unconfirmed.** A 1,000-record batch returns raw records in one
  payload, which may exceed what a provider licence permits as "embedded in product
  functionality" versus reselling data. The cap is `PRIMITIVE_BATCH_MAX` pending written
  confirmation.
* **Pricing is now measured, not derived.** Every Apify-backed meter bills 3× the run's
  own `provider_usd`, so there is no per-record list price left to drift and no per-meter
  margin to review: a slow, expensive run bills more and a cheap one bills less. The
  projection from the actor table survives only as the pre-flight reservation and as the
  fallback when a run reports no usage at all.
* **`PRIMITIVES_MOCK` serves fixtures through the real adapters** and still charges credits.
  It fails closed outside a local dev/test process, so it cannot be set in staging or
  production.
* **No operator UI.** API and CLI only; the dashboard shows the primitives in its catalog
  but has no surface for these calls.

## Commercial and legal, not code

None of these are fixed by shipping software:

* **Provider agreement** permitting redistribution through a customer-facing API
* **Subprocessor disclosure** naming Apify in Naive's tenant DPA
* **Privacy-policy line** disclosing the use of third-party B2B data providers
* **Data-broker registration** — California, Texas, Oregon and Vermont maintain registries,
  and selling access to personal data about people with no direct relationship is close to
  the definition. A company-level obligation with statutory penalties, independent of any
  provider's own compliance.

<Warning>
  **Ordering matters.** `people` is opt-in per AccountKit, but there is no per-workspace
  provider approval: once a production token is configured, every workspace whose kit enables
  the primitive can use it. The licence permitting resale must be in hand **before** a live
  token is set. Nothing in the code enforces that sequence.
</Warning>
