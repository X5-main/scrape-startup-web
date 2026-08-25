> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Semantic Memory

> Write and read durable semantic memory — remember, recall, think, graph, timeline.

Semantic memory is the durable, compounding layer of Brain: immutable episodes plus derived entities, claims, and relations.

<Note>
  **Reads are served from the Postgres spine on the hosted product.** The optional
  semantic sidecar is preferred *when it is configured*, and it is not configured in
  production — `GET /v1/brain/status` reports
  `services.gbrain.configured: false`. Nothing about the request or response shape
  changes either way; this note exists so you do not attribute a recall result to an
  engine that is not in the path.
</Note>

## Remember

`POST /v1/brain/remember` — write a durable memory episode; facts/entities/relations are extracted with provenance.

<ParamField body="content" type="string" required>The memory content to record.</ParamField>
<ParamField body="title" type="string">Optional title.</ParamField>
<ParamField body="kind" type="string">`document` | `note` | `conversation` | `observation` | `maintenance`.</ParamField>
<ParamField body="source" type="string">Provenance tag.</ParamField>
<ParamField body="confidence" type="number">0–1 confidence.</ParamField>
<ParamField body="knowledge_base_id" type="string">Target KB.</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/remember \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "content": "Acme Corp prefers quarterly invoicing", "source": "crm" }'
  ```
</RequestExample>

## Recall

`POST /v1/brain/recall` — recall structured facts/entities/episodes.

<ParamField body="query" type="string" required>The memory query.</ParamField>
<ParamField body="entity" type="string">Filter to one entity/subject.</ParamField>
<ParamField body="since" type="string">ISO-8601 lower bound.</ParamField>
<ParamField body="limit" type="number">Max memories (1–50).</ParamField>
<ParamField body="knowledge_base_id" type="string">Target KB.</ParamField>

## Think

`POST /v1/brain/think` — synthesize from semantic memory plus grounded document context, with gap notes. Extends `recall` with an optional `session_id`. **Cost: 0.08 credits** (the same unit as `query`, which it runs internally — charged even when that grounded-document leg is unavailable, since recall and synthesis still run).

## Graph

`POST /v1/brain/graph` — the entity/relation knowledge graph.

<ParamField body="entity" type="string">Center the graph on one entity.</ParamField>
<ParamField body="limit" type="number">Max nodes/edges (1–50).</ParamField>
<ParamField body="knowledge_base_id" type="string">Target KB.</ParamField>

## Timeline

`POST /v1/brain/timeline` — memory events/facts in chronological order. Same parameters as `graph`.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/brain/timeline \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "entity": "Acme Corp", "limit": 20 }'
  ```
</RequestExample>

<Note>
  `recall`, `graph`, `timeline`, and `remember` are free (plan quota still applies). `think` costs 0.08 credits.
</Note>
