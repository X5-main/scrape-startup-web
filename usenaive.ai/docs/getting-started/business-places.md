> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Places & Reviews

> Normalized local listings and reviews from Google Maps — the second provider on the Reviews & Listings primitive, billed on what the run actually cost.

Reviews & Listings had one vendor. Every listing and every review came from DataForSEO, which
meant a DataForSEO outage was a Naive outage, a coverage gap had no second opinion, and there
was nothing to compare a rating against.

Google Maps is now a **second provider** on the same primitive, behind two endpoints that are
deliberately not more DataForSEO passthroughs:

| Operation       | Endpoint                           | Returns                                         |
| --------------- | ---------------------------------- | ----------------------------------------------- |
| Search listings | `POST /v1/business/places/search`  | normalized `place` objects, immediately         |
| Read reviews    | `POST /v1/business/places/reviews` | normalized `review` objects for known place ids |

<Note>
  **Not [Company Data](/docs/getting-started/company-data).** This is a company's *local presence and
  reputation* — the listing, the rating, what customers wrote. Company Data is the company
  itself: headcount, funding, tech stack. Siblings, not alternatives.
</Note>

## CLI first

```bash theme={"theme":"css-variables"}
# Find listings — location is required, not optional
naive business places search --query "dentist" --location "Austin, Texas" --limit 25

# Read the reviews for one
naive business places reviews --place-ids ChIJ... --max-reviews 50 --sort newest
```

## Why these two are normalized and the others are not

The DataForSEO routes on this primitive return that vendor's own `tasks[]` envelope. That is
the right shape for a passthrough and an impossible shape for two vendors: the envelope is
one vendor's, the async task lifecycle is one vendor's, and the price is a list price rather
than a cost.

So these two return provider-agnostic `place` and `review` objects and **name the provider
that answered** in the response. That is what makes "second provider" mean anything to a
caller rather than being an implementation detail.

### There is no silent fallback

A fallback would have to be silent to be useful, and silent is exactly wrong on a primitive
whose entire subject is *provenance of reviews*. It would also be a lie about shape: the
DataForSEO equivalents are task-based, so "falling back" from a synchronous call would hand
you a task id where you expected data.

When the Maps provider has no credential you get a `feature_not_configured` naming the
DataForSEO routes instead — a refusal you can act on, rather than another vendor's data
wearing the same field names.

## search

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/business/places/search \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{"query": "dentist", "location": "Austin, Texas", "limit": 25}'
  ```

  ```json response theme={"theme":"css-variables"}
  {
    "data": [
      {
        "place_id": "ChIJ…",
        "name": "…",
        "categories": ["Dentist", "Cosmetic dentist"],
        "address": "…",
        "city": "Austin",
        "postal_code": "78701",
        "country_code": "US",
        "latitude": 30.26,
        "longitude": -97.74,
        "phone": "+1…",
        "website": "https://…",
        "rating": 4.7,
        "reviews_count": 312,
        "permanently_closed": false,
        "temporarily_closed": false,
        "url": "https://www.google.com/maps/place/?q=place_id:ChIJ…"
      }
    ],
    "credits_used": 0.2,
    "credits_remaining": 4998.8,
    "provider": "apify_google_maps"
  }
  ```
</CodeGroup>

`location` is **required and never defaulted.** Maps results are location-scoped, so a query
without one returns whatever Google infers from the datacentre the run happened in — a result
you cannot reproduce and we cannot explain. Pass `"Austin, Texas"` or
`"SW1A 1AA, United Kingdom"`.

`rating` is **absent** on a listing with no reviews rather than `0`, because a new business
and a badly-reviewed one are not the same fact. Same for `reviews_count`.

## reviews

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/business/places/reviews \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{"place_ids": ["ChIJ…"], "max_reviews_per_place": 50, "sort": "newest"}'
```

`sort` is `newest` (default), `most_relevant`, `highest_rating` or `lowest_rating`. Up to 25
place ids per request, and `max_reviews_per_place` **multiplies**: 25 places × 100 reviews is
2,500 billed rows from one call.

A review left as a rating with no words comes back with `text: ""`. It is still a real
review, so the row is kept rather than dropped.

## What is deliberately not returned

Two decisions here are governance, not scope:

**No contact people.** The places provider will also scrape named contact persons with work
emails and mobile numbers, at 25× the price of a place row. That is
[People](/docs/getting-started/people) data — it carries an opt-in gate, a B2B-only field filter
and an erasure path, none of which a listings lookup has. The inputs that request it are
never sent, so this endpoint cannot become a back door into personal data.

**No reviewer identity.** The reviews provider defaults to attaching reviewer names, profile
URLs, photos and review histories. We send `personalData: false` explicitly rather than
relying on that default staying put in someone else's release. You get the review — rating,
text, date, language, the owner's reply. A reviewer's cross-business review history is a
behavioural profile of a private individual, and nothing in this primitive's terms covers
building one.

## Pricing

Both endpoints bill **3× what the provider run actually cost**, derived from the run's own
usage rather than a per-record list price. A place row and a review row cost very different
amounts at the provider, and the meter reflects that instead of averaging it into a block
rate that is wrong in both directions.

* **An empty result is still billed.** A search that matched nothing was still a provider run
  on our invoice, so it is charged at the same 3×.
* **A provider failure is not billed.** The charge is settled after output exists.
* **A non-zero charge is at least 0.1 credits**, the platform-wide minimum — so a run under
  \$0.0017 of provider spend bills 0.1 rather than the strict 3×.
* Before the run, a projection from the provider's listed per-event price is reserved against
  your balance, so an unaffordable job is refused rather than half-run.
* `provider_usd`, its basis (`actual` or `projected`) and the multiplier applied are all
  recorded on the ledger entry behind every charge, and returned by
  `GET /v1/billing/transactions`.

Send an `Idempotency-Key` header and it becomes the ledger reference, so a retried call is
not charged twice.

## Related

* [Company Data](/docs/getting-started/company-data) — the company itself, not its listings
* [Social Data](/docs/getting-started/social-data) — public posts, comments and transcripts
* [Data primitive status](/docs/getting-started/data-primitives-status) — what is verified live and what is not
