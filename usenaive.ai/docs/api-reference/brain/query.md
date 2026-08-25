> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Query

> POST /v1/brain/query — ask the knowledge base and get a grounded answer with citations.

Ask the company knowledge base a question and receive a grounded answer with citations mapped to your ingested documents. **Cost: 0.08 credits.** Rate-limited to 120 requests/minute per company.

<ParamField body="question" type="string" required>
  The natural-language question (1–4000 chars).
</ParamField>

<ParamField body="knowledge_base_id" type="string">
  Specific KB to query (defaults to the company's default brain).
</ParamField>

<ParamField body="session_id" type="string">
  Continue a previous conversation thread (echoed back in each response).
</ParamField>

<ParamField body="filters" type="object">
  Optional retrieval filters: `{ "source": "...", "since": "ISO-8601" }` (honored by the Postgres spine).
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/query \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "question": "What is our refund policy?" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "answer": "Our refund policy allows returns within 30 days of purchase...",
    "citations": [
      { "document_id": "doc-uuid", "title": "refunds.md", "snippet": "Refunds are accepted within 30 days..." }
    ],
    "knowledge_base_id": "kb-uuid",
    "answer_mode": "synthesized",
    "session_id": "sess-uuid"
  }
  ```
</ResponseExample>

Citations are scoped to the calling company + KB; any citation that can't be mapped to one of your documents is dropped so answers never leak another tenant's sources.

## Read `answer_mode` before you quote `answer`

`answer` carries two different things, and `answer_mode` is the only way to tell them apart.

| `answer_mode` | `answer` contains                                                                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `synthesized` | Prose written over the retrieved sources by the deployment's answerer.                                                                                                                                           |
| `grounded`    | The retrieved passages themselves, numbered `[1]`, `[2]`, …. Those numbers label passages inside `answer`; they are **not** positions in `citations`, which is a separate list deduplicated per source document. |

`grounded` is a normal, successful `200`, not a degraded error — it is what you get when the
deployment resolved no answerer, **and** it is the fallback when a configured answerer
fails or times out. Both cost the same 0.08 credits and carry the same citations. Which
state a deployment is in is reported by
[`GET /v1/brain/status`](/docs/api-reference/brain/runtime) as `services.answerer` and
`models.answer`.

<Note>
  When no reranker is configured — the common case — retrieval still runs, keeping its RRF
  fusion order rather than a cross-encoder re-ranking. There is no field on this response for
  it and no behaviour change to code for; see [Runtime &
  configuration](/docs/api-reference/brain/runtime#degraded-but-still-serving).
</Note>

## Errors

| Status | Code                     | When                                                                                                                                                                       |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`  | `invalid_input`          | Missing `question`, or a question with no searchable terms.                                                                                                                |
| `501`  | `feature_not_configured` | The deployment has no embedder on any rung, so the question cannot be embedded. See [When nothing is configured](/docs/api-reference/brain/runtime#when-nothing-is-configured). |
| `502`  | `provider_error`         | Retrieval matched nothing yet (`details.retryable: true`), or the embedder failed after its retries.                                                                       |

The credit check runs before retrieval and the deduction after it, so a query that fails is
not charged.

**Cost:** 0.08 credits
