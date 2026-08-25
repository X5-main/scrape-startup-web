> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Runtime & configuration

> GET /v1/brain/status — which inference legs a deployment resolved, what a degraded-but-still-serving brain looks like, and the error an unconfigured one returns.

The Postgres spine that backs every brain uses up to three inference legs. Only the first
is required; the other two make answers better and their absence is a supported state, not
a fault.

| Leg          | `services` key | Required?               | Without it                                                                                                                                                                                |
| ------------ | -------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Embedder** | `embedding`    | **Yes** — for documents | Document ingest refuses at the door (`501`), `POST /query` fails. Semantic memory (`remember`, `recall`, `graph`, `timeline`) keeps answering; only its document-grounding leg goes quiet |
| **Answerer** | `answerer`     | No                      | `POST /query` returns the retrieved passages themselves — `answer_mode: "grounded"`                                                                                                       |
| **Reranker** | `reranker`     | No                      | Retrieval keeps its RRF fusion order instead of a cross-encoder re-ordering                                                                                                               |

<Note>
  These are **deployment**-level, not per-tenant: a brain's configuration is a property of the
  API that serves it, and `GET /v1/brain/status` is the read that tells you which state you
  are in. It is the one brain route that is not plan-metered.
</Note>

## How each leg resolves

Each leg walks its own ladder and stops at the first rung that answers. An explicit
`BRAIN_*_BASE` always wins over the hosted default, so pointing a leg at your own endpoint
does not require un-setting the hosted key.

| Leg      | Ladder                                                                                                                              | Hosted default                                                | Model                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Embedder | mock → `BRAIN_EMBED_BASE` → `OPENAI_API_KEY` (only if it can produce `BRAIN_EMBED_DIM`-wide vectors — see the note below) → nothing | `https://api.openai.com/v1`, keyed by `OPENAI_API_KEY`        | `BRAIN_EMBED_MODEL`, default `text-embedding-3-small`                                                                      |
| Answerer | mock → `BRAIN_ANSWER_BASE` → `OPENROUTER_API_KEY` → nothing                                                                         | `https://openrouter.ai/api/v1`, keyed by `OPENROUTER_API_KEY` | `BRAIN_ANSWER_MODEL` if set, otherwise per rung: `openai/gpt-4o-mini` on the hosted rung, `llama3.2:1b` on an explicit one |
| Reranker | mock → `BRAIN_RERANK_BASE` → nothing                                                                                                | **none — by design**                                          | `BRAIN_RERANK_MODEL`, default `BAAI/bge-reranker-base`                                                                     |

The rung that answered is reported per service as `source`:

| `source`               | Meaning                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `"explicit"`           | A `BRAIN_*_BASE` was set and is being used verbatim                                                                                                                |
| `"openai-default"`     | Embedder only — resolved from `OPENAI_API_KEY`                                                                                                                     |
| `"openrouter-default"` | Answerer only — resolved from `OPENROUTER_API_KEY`                                                                                                                 |
| `"mock"`               | `BRAIN_MOCK=true` — a deterministic stand-in for local development and tests. No network call, no model name reported. See [Local development](#local-development) |
| `null`                 | No rung answered. For the embedder that is an outage; for the answerer and reranker it is a supported degraded mode                                                |

<Warning>
  **The reranker deliberately has no hosted rung.** The only target it is built for is a
  self-hosted TEI/BGE cross-encoder, so on a deployment that runs none, `reranker` reports
  `configured: false, source: null` **permanently and correctly**. It carries
  `optional: true` for exactly that reason, and it is not part of `ready`. Do not treat it
  as an incident.
</Warning>

<Note>
  **Explicit overrides:** `BRAIN_EMBED_KEY` / `BRAIN_EMBED_AUTH_HEADER` (`authorization`,
  `api-key`, or `x-api-key` — for Azure-style endpoints), `BRAIN_ANSWER_KEY`, and
  `BRAIN_RERANK_KEY` apply to the explicit rung. The auth-header knob is ignored on the
  hosted embedder rung: `api.openai.com` accepts nothing but a bearer token. Embedding width
  is `BRAIN_EMBED_DIM` (default `1536`), it is the fixed width of the stored vector column,
  and it is enforced — a vector of the wrong length is rejected loudly rather than truncated
  or padded. On the hosted rung a `text-embedding-3-*` model is asked for that width
  explicitly, so a non-default `BRAIN_EMBED_DIM` still produces correctly-sized vectors — but
  only up to the model's native width (`1536` for `text-embedding-3-small`, `3072` for
  `-large`). Above it, or on a `BRAIN_EMBED_MODEL` that takes no `dimensions` field and whose
  native width is not `BRAIN_EMBED_DIM`, **the hosted rung declines rather than resolving**:
  `source` is `null` and `configured: false` even with `OPENAI_API_KEY` set, `ready` is
  `false`, and ingest `501`s. The rung refuses up front instead of accepting documents that
  would fail the dim check minutes later. The explicit rung is exempt — an operator who sets
  `BRAIN_EMBED_BASE` sets `BRAIN_EMBED_DIM` to match it.
</Note>

## `GET /v1/brain/status`

Model configuration, per-service health, and knowledge-base / document / projection counts.
Present at both prefixes (`/v1/brain/status` and `/v1/users/{user_id}/brain/status`), and
nested as `runtime` inside [`GET /v1/brain/ops-status`](/docs/api-reference/brain/operations).

Every service line that resolved to an HTTP endpoint is **probed live on this call** —
`GET <base>/models` for the embedder and for an explicit answerer base, `GET
https://openrouter.ai/api/v1/key` on the hosted answerer rung (it `401`s on a revoked key,
where `/models` answers `200` with no key at all), `GET <base>/health` for the reranker,
each authenticated with that leg's key and bounded by a 2.5 s timeout — so `ok` reflects
the endpoint now, not at boot. `latency_ms` is that probe. Mock and unresolved legs issue
no request and carry no `latency_ms`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/brain/status \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "provider": "postgres",
    "semantic_engine": "postgres",
    "models": {
      "embedding": "text-embedding-3-small",
      "embedding_dim": 1536,
      "reranker": null,
      "answer": "openai/gpt-4o-mini"
    },
    "services": {
      "embedding": {
        "name": "brain_embeddings",
        "configured": true,
        "source": "openai-default",
        "ok": true,
        "latency_ms": 214
      },
      "answerer": {
        "name": "brain_answerer",
        "configured": true,
        "source": "openrouter-default",
        "ok": true,
        "latency_ms": 180,
        "optional": true
      },
      "reranker": {
        "name": "tei_reranker",
        "configured": false,
        "source": null,
        "ok": false,
        "error": "not_configured",
        "optional": true
      },
      "gbrain": {
        "name": "gbrain",
        "configured": false,
        "ok": false,
        "details": { "reason": "not_configured" }
      }
    },
    "knowledge_bases": {
      "total": 1,
      "by_status": { "active": 1 },
      "items": [
        {
          "id": "00a21080-e247-4935-8efb-a6c1051c189b",
          "name": "Default Brain",
          "provider": "postgres",
          "status": "active",
          "is_default": true,
          "created_at": "2026-07-01T00:00:00.000Z",
          "updated_at": "2026-07-01T00:00:00.000Z"
        }
      ]
    },
    "documents": { "total": 47, "by_status": { "ready": 47 }, "recent": [] },
    "projection": { "pending": 0, "failed": 0, "gbrainConfigured": false },
    "ready": true,
    "timestamp": "2026-08-06T04:57:33.111Z"
  }
  ```
</ResponseExample>

### Fields

| Field                                    | Type               | Meaning                                                                                                    |
| ---------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `provider`                               | string             | The engine serving content. Always `"postgres"` — the spine.                                               |
| `semantic_engine`                        | string             | The configured **preference** (`"postgres"` \| `"gbrain"`), not what is running. Defaults to `"postgres"`. |
| `models.embedding`                       | string \| **null** | The embedding model that would actually be sent. `null` on a mock or unresolved leg.                       |
| `models.embedding_dim`                   | integer            | Vector width of the `brain_chunks` column. Always a number, on every rung.                                 |
| `models.reranker`                        | string \| **null** | Rerank model, or `null` when no reranker resolved.                                                         |
| `models.answer`                          | string \| **null** | The synthesis model that would actually be sent, or `null` when no answerer resolved.                      |
| `services.{embedding,answerer,reranker}` | object             | One resolved leg — see the shape below.                                                                    |
| `services.gbrain`                        | object             | `{ name, configured, ok, details }`. Different shape: no `source`, no `optional`.                          |
| `knowledge_bases`                        | object             | `{ total, by_status, items }` — `items` is the public KB row, the same shape `GET /v1/brain` lists.        |
| `documents`                              | object             | `{ total, by_status, recent }` — `recent` is the ten most recent public document rows.                     |
| `projection`                             | object             | `{ pending, failed, oldestPendingAt?, gbrainConfigured }` for the async semantic projection queue.         |
| `ready`                                  | boolean            | See below.                                                                                                 |
| `timestamp`                              | string             | When this snapshot was assembled.                                                                          |

The three inference services share one shape:

| Field        | Type           | Meaning                                                                                                                                                                       |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`       | string         | Stable identifier — `brain_embeddings`, `brain_answerer`, `tei_reranker`.                                                                                                     |
| `configured` | boolean        | A rung answered, so calls will be attempted. Comes from the same resolution the call path uses, so it cannot disagree with what an ingest or query will do.                   |
| `source`     | string \| null | Which rung — see the table above.                                                                                                                                             |
| `ok`         | boolean        | The live probe succeeded. Always `false` when `configured` is `false`.                                                                                                        |
| `latency_ms` | integer        | Present only when a probe was issued.                                                                                                                                         |
| `error`      | string         | Present only when `ok` is `false`: `not_configured`, `invalid_base_url` (a base is set but does not parse), `http_<status>`, or the fetch error text.                         |
| `optional`   | `true`         | Present on `answerer` and `reranker` **only**, and always. It means *absent is not broken* — the query path degrades and keeps answering, and neither leg is part of `ready`. |

### `ready`

`ready` is `true` when the embedding service is up, the projection queue has no failures,
and — only if a semantic engine is configured — that engine is healthy.

The answerer and the reranker are excluded on purpose: both are `optional`, and a query
still answers without them. A brain can be `ready: true` while `services.reranker` reports
`configured: false`.

<Warning>
  `semantic_engine` reports the configured preference, not what is running. Whether the
  semantic engine is actually in the read path is `services.gbrain.configured` /
  `services.gbrain.ok`, which require **both** the preference and a base URL. When it is not
  configured, document RAG is served from the Postgres spine — the canonical store either
  way.
</Warning>

## Degraded, but still serving

Most of these are normal operating states, not incidents.

| State                           | `/v1/brain/status` says                                                                                                                                                                                            | What callers see                                                                                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No reranker (the common case)   | `reranker: { configured: false, source: null, error: "not_configured", optional: true }`, `ready: true`                                                                                                            | Nothing. Retrieval keeps its RRF fusion order; results are ranked, just not cross-encoder re-ranked.                                                                                                                                                                                        |
| No answerer                     | `answerer: { configured: false, error: "not_configured", optional: true }`, `models.answer: null`, `ready: true`                                                                                                   | `POST /query` returns `answer_mode: "grounded"` and `answer` is the retrieved passages themselves, numbered `[1]`, `[2]`, …. Those numbers label passages inside `answer`; they are **not** positions in `citations`, which is deduplicated per source document. Same cost, same citations. |
| Answerer configured but failing | `answerer.ok: false` with an `error` — or `ok: true` with `synthesis_failures_since_boot` climbing, when the endpoint is reachable but the calls are not (an OpenRouter key with no credits). `ready` still `true` | `POST /query` falls back to `answer_mode: "grounded"` rather than erroring. **Always branch on `answer_mode`, never on the presence of `answer`.**                                                                                                                                          |
| No semantic engine              | `gbrain: { configured: false }`, `projection.gbrainConfigured: false`, `ready: true`                                                                                                                               | Nothing. Recall is served from the spine.                                                                                                                                                                                                                                                   |
| Projection backlog              | `projection.pending > 0`                                                                                                                                                                                           | A just-written episode may not be in `recall` yet. `failed > 0` is the one that clears `ready`.                                                                                                                                                                                             |

<Note>
  Synthesized answers are bounded by `BRAIN_ANSWER_MAX_TOKENS`. Unset, it resolves per
  rung: `512` output tokens on the hosted OpenRouter rung, `128` on an explicit
  `BRAIN_ANSWER_BASE`. If the model stops because it hit the cap, the response falls back
  to `answer_mode: "grounded"` rather than returning a truncated paraphrase — so `answer`
  is always complete, in one form or the other. `/status` does not report this value.
</Note>

## When nothing is configured

With no embedder on any rung, the two document paths refuse with **`501
feature_not_configured`** and a hint naming every way to satisfy it. Ingest refuses at the
door, before the document is accepted or any credit is charged:

```json 501 theme={"theme":"css-variables"}
{
  "error": {
    "code": "feature_not_configured",
    "message": "Brain spine embedder is not configured, so this deployment cannot ingest documents.",
    "hint": "Set OPENAI_API_KEY to use the hosted default, or BRAIN_EMBED_BASE (+ BRAIN_EMBED_KEY) for an explicit endpoint, or BRAIN_MOCK=true for local/dev. If OPENAI_API_KEY is already set, check that BRAIN_EMBED_MODEL can produce BRAIN_EMBED_DIM-wide vectors. Semantic memory (brain remember/recall) works without it."
  }
}
```

`POST /v1/brain/query` fails the same way when it tries to embed the question. The
credit check runs before retrieval and the deduction after it, so a query that fails this
way is **not** charged.

`GET /v1/brain/status` on such a deployment reports the following — abridged to the fields
that differ from the example above; the rest of the object is unchanged and no probe is
issued:

```json 200 theme={"theme":"css-variables"}
{
  "models": { "embedding": null, "embedding_dim": 1536, "reranker": null, "answer": null },
  "services": {
    "embedding": { "name": "brain_embeddings", "configured": false, "source": null, "ok": false, "error": "not_configured" }
  },
  "ready": false
}
```

<Note>
  As the hint says, **semantic memory does not need the embedder.** `POST /remember`,
  `/recall`, `/graph` and `/timeline` keep answering; `recall` and `think` simply return no
  document cards, and `POST /think` is still charged its 0.08 credits because the recall and
  synthesis legs still run.
</Note>

## Local development

`BRAIN_MOCK=true` (or `BLOCKBRAIN_MOCK=true`) swaps the **whole** brain provider for a
deterministic in-memory mock — not just the three legs. No Postgres spine, no network, no
keys. It is a development and test mode, not a degraded production one: `query` is answered
out of the mock store, and its response carries no `answer_mode` field at all.

`/status` under mock reports `source: "mock"` on all three legs, with `ok: true` for
`embedding` and `reranker` and `configured: false` for `answerer` — the mock rung resolves
to *no* answerer, which is why it is the one leg whose mock arm is not "configured". Every
`models.*` entry is `null` except `embedding_dim`, and `ready` is `true`.
