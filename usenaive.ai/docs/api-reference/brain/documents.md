> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Documents

> Ingest, replace, list, inspect, and delete documents in a knowledge base.

Documents are the source material for grounded `query`. Provide exactly one of `text`, `url`, or `file_base64` when ingesting. Ingest costs **0.1 credits + 0.0002 per KB of content, capped at 10 per document** — a 2.5 KB page is 0.1005 credits. The ingest response returns the exact `credits` charged. A failed ingest is not charged.

## Ingest a document

`POST /v1/brain/documents`

<ParamField body="text" type="string">
  Raw text to ingest (exactly one of text / url / file\_base64).
</ParamField>

<ParamField body="url" type="string">
  A URL to fetch and ingest (SSRF-guarded; private/local hosts blocked).
</ParamField>

<ParamField body="file_base64" type="string">
  Base64-encoded file bytes (PDF/DOCX/XLSX/text).
</ParamField>

<ParamField body="filename" type="string">
  Optional filename/label.
</ParamField>

<ParamField body="content_type" type="string">
  MIME type when uploading `file_base64`.
</ParamField>

<ParamField body="source" type="string">
  Provenance tag (e.g. `upload`, `web`, `agent:researcher`).
</ParamField>

<ParamField body="knowledge_base_id" type="string">
  Target KB (defaults to the company's default brain).
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/documents \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "text": "Our refund policy is 30 days.", "filename": "refunds.md", "source": "policy" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  { "id": "doc-uuid", "filename": "refunds.md", "status": "ready", "source": "policy", "created_at": "2026-07-09T12:00:00.000Z" }
  ```
</ResponseExample>

<Note>
  Large text, URLs, and files ingest asynchronously (status `processing` → `ready`/`failed`). Poll `GET /v1/brain/documents/:id` to refresh. Multipart upload of a `file` field is also supported.
</Note>

<Warning>
  **Ingest needs an embedding leg.** A deployment that resolved no embedder refuses `POST`
  with `501 feature_not_configured` — at the door, before the document is accepted, queued,
  or charged, rather than accepting it and failing it minutes later. `PUT` refuses too, but
  later and less cleanly: the refusal comes from the embed call rather than the door, so it
  carries the shorter message `"Brain spine embedder is not configured."`, and a `PUT` whose
  content hash is unchanged short-circuits before ever reaching it and returns `200` with the
  existing row. The hint names every way to satisfy it; see [Runtime &
  configuration](/docs/api-reference/brain/runtime#when-nothing-is-configured). Semantic memory
  (`remember` / `recall`) is unaffected. Check `services.embedding` on
  [`GET /v1/brain/status`](/docs/api-reference/brain/runtime) before you conclude a document
  pipeline is broken.
</Warning>

## Replace a document

`PUT /v1/brain/documents/:id` — replace/refresh content in place, keeping the document id. Same body as ingest, and priced the same way (0.1 credits + 0.0002 per KB (capped at 10)).

## List documents

`GET /v1/brain/documents?knowledge_base_id=kb-uuid`

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  { "documents": [ { "id": "doc-uuid", "filename": "refunds.md", "status": "ready" } ], "count": 1 }
  ```
</ResponseExample>

## Get a document

`GET /v1/brain/documents/:id` — returns the document with a refreshed processing status.

## Delete a document

`DELETE /v1/brain/documents/:id` — permanent. **Approval-gated** for agent callers (returns `202` pending); returns a deletion receipt on completion.

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  { "deleted": true, "receipt": { "provider": "postgres", "provider_confirmed": true, "verified": true, "deleted_at": "2026-07-09T12:00:00.000Z" } }
  ```
</ResponseExample>
