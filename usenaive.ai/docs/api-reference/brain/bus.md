> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Brain Bus

> Turn-level context mediation — recall before an agent turn, remember after.

The Brain Bus is the runtime context layer around agent turns: it injects recalled context before an LLM call and records the turn after. It's mounted at **`/v1/brain/bus`** (requires the brain primitive; not plan-metered).

## List recent events

`GET /v1/brain/bus/events?limit=50` — recent bus events (max 200).

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "events": [
      {
        "id": "evt-uuid",
        "channel": "llm_proxy",
        "actor_type": "agent",
        "direction": "turn",
        "input_preview": "...",
        "output_preview": "...",
        "created_at": "2026-07-09T12:00:00.000Z"
      }
    ]
  }
  ```
</ResponseExample>

## Stream events (SSE)

`GET /v1/brain/bus/events/stream` — server-sent events: `brain_bus.event` and `company_channel.message`. Used by Mission Control's live feed.

## Ingest a turn

`POST /v1/brain/bus/events` — record a turn (best-effort remember). Returns `202`.

<ParamField body="input" type="string">Turn input text.</ParamField>
<ParamField body="output" type="string">Turn output text.</ParamField>
<ParamField body="channel" type="string">Channel label (default `llm_proxy`).</ParamField>
<ParamField body="direction" type="string">`input` | `output` | `turn` | `message` | `maintenance`.</ParamField>

<Note>
  Bus recall/remember internally call `query` (0.08 credits) and document ingest (0.1 credits + 0.0002 per KB (capped at 10)) when they materialize durable evidence. The LLM proxy performs recall/remember automatically around agent turns; send the header `x-naive-brain-bus: off` to opt a request out.
</Note>
