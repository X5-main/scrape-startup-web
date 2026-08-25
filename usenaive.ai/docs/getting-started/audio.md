> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Audio

> Speech routing for agents — transcription, synthesis, and audio conversations across a managed model catalog, one endpoint and one balance.

The `audio` primitive gives your agent ears and a voice. One endpoint covers all three speech modalities, routed automatically across a managed catalog of speech models:

| Modality             | What it does                                                                        |
| -------------------- | ----------------------------------------------------------------------------------- |
| **Speech to text**   | Transcribe recordings and uploads, with timestamps, diarization, and PII redaction. |
| **Text to speech**   | Synthesize natural speech, steered by the capability you care about.                |
| **Speech to speech** | Send a spoken turn and get a spoken reply — the model answers the audio directly.   |

You never manage a speech-provider account or key. Naive holds the credentials, picks the model, and bills each call in **Naive credits**. Speech-to-speech is not transcription followed by synthesis — the model listens to the audio itself, so it hears tone, hesitation, and emphasis.

## CLI First

```bash theme={"theme":"css-variables"}
# Transcribe a recording
naive audio transcribe meeting.wav

# Transcribe with a known language, speaker labels, and word timings
naive audio transcribe call.mp3 --language en --diarize --timestamps word

# Queue a long recording and poll for it
naive audio transcribe podcast.wav --async
naive audio transcription req_abc123

# Synthesize speech
naive audio speak "Your order shipped this morning." -o update.mp3

# Send a spoken turn, save the spoken reply
naive audio converse question.wav -o answer.wav
```

## Endpoints

| Endpoint                            | Type             | Description                                         | Cost                              |
| ----------------------------------- | ---------------- | --------------------------------------------------- | --------------------------------- |
| `POST /v1/audio/transcriptions`     | Sync or queued   | Transcribe audio (multipart upload or base64 JSON)  | Per audio minute                  |
| `GET /v1/audio/transcriptions/{id}` | Sync             | Poll a queued transcription                         | Free (charged once on completion) |
| `POST /v1/audio/speech`             | Streaming binary | Synthesize speech from text                         | Per 1,000 input characters        |
| `POST /v1/audio/speech-to-speech`   | Sync             | One audio-in / audio-out model turn                 | Per audio second, in and out      |
| `GET /v1/audio/models`              | Sync             | List routable models and routing aliases            | Free                              |
| `GET /v1/audio/providers`           | Sync             | List the model owners available                     | Free                              |
| `GET /v1/audio/endpoints`           | Sync             | List endpoints with capabilities, price, and limits | Free                              |
| `GET /v1/audio/requests/{id}`       | Sync             | A request's metadata and route trace                | Free                              |
| `GET /v1/audio/usage`               | Sync             | Billed audio requests, newest first                 | Free                              |
| `GET /v1/audio/usage/{request_id}`  | Sync             | The usage row for one request                       | Free                              |

## Routing

Every modality takes either a **managed alias** or an **exact model slug**.

| Value               | Behavior                                                             |
| ------------------- | -------------------------------------------------------------------- |
| `auto` / `stt/auto` | Rank every eligible transcription model and pick the best one.       |
| `tts/auto`          | Rank every eligible speech model, optionally steered by a `feature`. |
| `s2s/auto`          | Rank every eligible audio-in/audio-out model.                        |
| `owner/model`       | Pin an exact model. Fallbacks are off by default when you pin.       |

Managed routes enable automatic fallbacks; a pinned model does not retry elsewhere unless you opt in with `provider.allow_fallbacks`. Responses carry a `route` object explaining what was considered, filtered, and attempted:

```json theme={"theme":"css-variables"}
{
  "route": {
    "mode": "auto",
    "reason": "Automatic routing",
    "candidates": 66,
    "filtered": [],
    "attempts": [
      { "provider": "auto", "model": "auto", "status": "success", "latency_ms": 1108, "error_code": null }
    ]
  }
}
```

### Route by language

Set `language` and leave `model` unset. The request goes to the best model for that language, and you never name a model yourself.

Always send `language` when you know it — it skips detection (lower latency, better accuracy). Use a BCP-47-style code (`de`, `es`, `pt-BR`); a region tag with no dedicated model falls back to its base language.

### Steering speech synthesis

With `model: "tts/auto"` and `voice: "auto"` you can name the capability that matters and let Naive rank models for it. Omit `feature` and it is inferred from your text, instructions, language, and length.

| Feature              | Prioritizes                                         |
| -------------------- | --------------------------------------------------- |
| `Acting`             | Character performance and dramatic delivery.        |
| `Expressiveness`     | Emotion, emphasis, pacing, and intonation.          |
| `Voice identity`     | Consistency of the speaker's vocal characteristics. |
| `Language stability` | Stable pronunciation across languages.              |
| `Reliability`        | Dependable generation with fewer malformed outputs. |
| `Extended long-form` | Sustained coherence over especially long passages.  |
| `Long-form`          | Natural pacing across longer passages.              |
| `Acoustic quality`   | Clear, high-fidelity audio with minimal artifacts.  |

Speech-to-speech has its own set: `Emotion Understanding`, `Emotion Alignment`, `Expressive Robustness`, `Voice naturalness`, and `Problem redirecting`.

`feature` values are case-sensitive, and valid only on `tts/auto` / `s2s/auto` with `voice: "auto"`; sending one with a pinned model is rejected.

### Constraining the route

The optional `provider` object narrows and orders candidates for a single request:

```json theme={"theme":"css-variables"}
{
  "model": "stt/auto",
  "provider": {
    "only": ["deepgram", "groq"],
    "order": ["deepgram/nova-3"],
    "allow_fallbacks": true,
    "require_features": true,
    "max_price": { "per_min": 0.01 },
    "region": ["us", "global"]
  }
}
```

| Field                    | Description                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------- |
| `only` / `ignore`        | Allow-list or block-list of owners, models, or endpoints.                                      |
| `order`                  | Preferred candidates, tried ahead of the ranked remainder.                                     |
| `allow_fallbacks`        | Retry the next candidate on a retryable error. Defaults on for aliases, off for pinned models. |
| `require_features`       | Drop candidates that can't do everything you asked for, instead of degrading.                  |
| `max_price.per_min`      | Price ceiling per audio minute (transcription).                                                |
| `max_price.per_1k_chars` | Price ceiling per 1,000 input characters (speech).                                             |
| `region`                 | Keep candidates serving one of these regions (`global` always matches).                        |

<Warning>
  **Residency:** requests default to `provider.region: ["us", "global"]`; setting `provider.region` yourself replaces that default entirely. Speech-to-speech rejects the whole `provider` object, so the residency floor does **not** apply to `POST /v1/audio/speech-to-speech` — `s2s/auto` may pick models served from `ap-southeast-1` or `cn-beijing`. Pin an exact model slug when you need a residency guarantee on an audio turn.
</Warning>

## Transcription

<CodeGroup>
  ```bash curl (upload) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/audio/transcriptions \
    -H "Authorization: Bearer nv_sk_your_key" \
    -F "model=auto" \
    -F "language=en" \
    -F "response_format=json" \
    -F "file=@meeting.wav"
  ```

  ```bash curl (base64) theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/audio/transcriptions \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "stt/auto",
      "input_audio": { "data": "BASE64_AUDIO", "format": "wav" },
      "response_format": "json"
    }'
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";
  import { readFile } from "node:fs/promises";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  const bytes = await readFile("meeting.wav");
  const result = await naive.audio.transcribeFile(bytes, "wav", { language: "en" });

  console.log(result.text);
  console.log("credits:", result.credits_used);
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "trn_UX-sLgNDOMICNdC7_s92sA",
  "object": "transcription",
  "created": 1785196534,
  "model": "auto",
  "resolved_model": "auto",
  "provider": "auto",
  "text": "Hello from Naive. This is a test of the audio primitive.",
  "language": "en",
  "duration": 3.4,
  "segments": [
    { "id": 0, "start": 0, "end": 3.4, "text": "Hello from Naive...", "speaker": null, "confidence": 0.97 }
  ],
  "words": [],
  "speakers": [],
  "entities": [],
  "usage": { "seconds": 3.4, "billable_seconds": 4, "cost": 0.00116667, "currency": "USD" },
  "route": { "mode": "auto", "reason": "Automatic routing", "candidates": 66, "attempts": [ ... ] },
  "warnings": [],
  "credits_used": 0.0292,
  "credits_remaining": 998.9
}
```

### Key parameters

| Param             | Type      | Description                                                                                                                       |
| ----------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `file`            | file      | The audio file (multipart requests only).                                                                                         |
| `input_audio`     | object    | `{ data, format }` — base64 audio for JSON requests.                                                                              |
| `model`           | string    | Omit or use `auto` / `stt/auto` for managed routing, or pin `owner/model`.                                                        |
| `language`        | string    | BCP-47 hint. Skips detection on managed routes.                                                                                   |
| `prompt`          | string    | Context or vocabulary hint for models that support prompting.                                                                     |
| `response_format` | string    | `json`, `verbose_json`, `text`, `srt`, `vtt`, or `diarized_json`.                                                                 |
| `timestamps`      | string    | `none`, `segment`, `word`, or `both`.                                                                                             |
| `diarize`         | boolean   | Label speakers. Speaker ids are normalized to `spk_N`.                                                                            |
| `redact`          | boolean   | Redact detected PII where supported.                                                                                              |
| `translate`       | boolean   | Translate the transcript to English where supported.                                                                              |
| `keyterms`        | string\[] | Terms to boost during recognition.                                                                                                |
| `retention`       | string    | `none`, `transcript`, `debug`, or `archive`. Defaults to `none` for sync requests and `transcript` for `?async=true` — see below. |
| `temperature`     | number    | Sampling temperature, where supported.                                                                                            |
| `metadata`        | object    | Arbitrary key/values stored on the request log.                                                                                   |
| `provider`        | object    | Per-request routing constraints (see above).                                                                                      |

Multipart requests take the same fields as form values (`provider`, `metadata`, `options`, and `keyterms` as JSON-encoded strings). Upload limits differ by transport: multipart accepts up to **100 MB**; the base64 JSON body caps at \~**18 MB** of source audio (25 MB request limit). The SDK and CLI use the JSON transport, so upload larger recordings via multipart or downsample first.

### Long recordings

Add `?async=true` to queue the job. You get a `202` with a request id instead of holding the connection open:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST "https://api.usenaive.ai/v1/audio/transcriptions?async=true" \
    -H "Authorization: Bearer nv_sk_your_key" \
    -F "model=auto" -F "file=@podcast.wav"
  # → 202 { "id": "req_mbjTpWkySRT...", "status": "queued" }

  curl https://api.usenaive.ai/v1/audio/transcriptions/req_mbjTpWkySRT... \
    -H "Authorization: Bearer nv_sk_your_key"
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  const job = await naive.audio.transcribeAsync({
    input_audio: { data: base64, format: "wav" },
  });

  let result = await naive.audio.transcription(job.id);
  while (result.status === "queued" || result.status === "running") {
    await new Promise((r) => setTimeout(r, 5000));
    result = await naive.audio.transcription(job.id);
  }
  console.log(result.text);
  ```
</CodeGroup>

Status moves through `queued` → `running` → `succeeded` (or `failed` / `canceled`). Result fields stay `null` until it succeeds, and the credit charge lands on the first poll that sees `succeeded` — polling again never double-charges.

<Warning>
  Do not set `retention: "none"` on an async transcription — the job completes as `succeeded` with `text: null`: you are billed and the transcript is gone. Async requests default to `retention: "transcript"`, sync to `"none"`; an explicit value always wins.
</Warning>

## Speech synthesis

The response is **binary audio** in the requested `response_format`, streamed straight through.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/audio/speech \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "tts/auto",
      "feature": "Acting",
      "input": "Deliver this line like the opening of a dramatic story.",
      "voice": "auto",
      "response_format": "mp3"
    }' --output speech.mp3
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  import { writeFile } from "node:fs/promises";

  const { audio, request_id } = await naive.audio.speech({
    model: "tts/auto",
    input: "Your order shipped this morning.",
    voice: "auto",
    response_format: "mp3",
  });

  await writeFile("update.mp3", Buffer.from(audio));

  // Costs settle out-of-band on a binary response — look them up by request id.
  const usage = await naive.audio.usageFor(request_id!);
  console.log(usage.cost, usage.input_chars);
  ```
</CodeGroup>

| Param             | Type             | Description                                                                  |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| `model`           | string           | **Required.** `tts/auto` or an exact slug.                                   |
| `input`           | string           | **Required.** The text to synthesize.                                        |
| `voice`           | string \| object | `auto` on managed routes; a native voice id when pinned.                     |
| `feature`         | string           | Managed routes only — the capability to prioritize.                          |
| `response_format` | string           | `mp3` (default), `ogg`, `opus`, `aac`, `flac`, `wav`, `pcm`, `ulaw`, `alaw`. |
| `speed`           | number           | Playback speed multiplier, where supported.                                  |
| `instructions`    | string           | Style guidance for instruction-following voices.                             |
| `language`        | string           | Language hint for multilingual voices.                                       |

The upstream request id is returned on the `X-Audio-Request-Id` header — use it with `GET /v1/audio/requests/{id}` (route trace) or `GET /v1/audio/usage/{id}` (cost), since a binary body carries no usage object. Supported formats vary by model; check `GET /v1/audio/endpoints` for a model's `limits.formats` before pinning one.

## Audio conversations

Send one spoken turn and get a spoken reply, plus both transcripts.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/audio/speech-to-speech \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "s2s/auto",
      "feature": "Emotion Alignment",
      "input_audio": { "data": "BASE64_AUDIO", "format": "wav", "channels": 1 },
      "output_audio": { "format": "wav" },
      "voice": "auto",
      "instructions": "Answer the speaker briefly."
    }'
  ```

  ```javascript SDK theme={"theme":"css-variables"}
  const reply = await naive.audio.converse({
    model: "s2s/auto",
    voice: "auto",
    input_audio: { data: base64Question, format: "wav", channels: 1 },
    output_audio: { format: "wav" },
    instructions: "Answer the speaker briefly.",
  });

  console.log("heard:", reply.input_transcript);
  console.log("said:", reply.transcript);
  await writeFile("answer.wav", Buffer.from(reply.audio.data, "base64"));
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "id": "req_CBnhEGBbuAJpKzk8clR1tg",
  "object": "audio.speech_to_speech",
  "created": 1785196592,
  "model": "s2s/auto",
  "resolved_model": "s2s/auto",
  "provider": "auto",
  "audio": { "data": "BASE64_AUDIO", "format": "wav", "content_type": "audio/wav", "sample_rate": 24000, "channels": 1 },
  "transcript": "Thanks for the test message — everything looks fine.",
  "input_transcript": "Hello from Naive. This is a test of the audio primitive.",
  "usage": { "input_seconds": 3.4, "output_seconds": 5.31, "cost": 0.0028014 },
  "credits_used": 0.07,
  "credits_remaining": 998.8
}
```

| Param               | Type    | Description                                                                                         |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `model`             | string  | **Required.** `s2s/auto` or an exact realtime slug.                                                 |
| `input_audio`       | object  | **Required.** `{ data, format, sample_rate?, channels? }`. `sample_rate` is required for raw PCM16. |
| `output_audio`      | object  | `{ format?, sample_rate? }`. Defaults to `wav`.                                                     |
| `voice`             | string  | `auto` on managed routes.                                                                           |
| `feature`           | string  | Managed routes only.                                                                                |
| `instructions`      | string  | How the model should answer the turn.                                                               |
| `temperature`       | number  | Where supported.                                                                                    |
| `max_output_tokens` | integer | Cap on the reply length.                                                                            |

## Catalog & observability

```bash theme={"theme":"css-variables"}
# What can I route to?
naive audio models --task transcription

# What did that request actually do?
naive audio request req_abc123

# What have I spent?
naive audio usage --limit 20
```

`GET /v1/audio/endpoints` is the detailed view: per-endpoint capability flags (`diarization`, `word_timestamps`, `stream`, `redaction`, `translation`, …), price unit and rate, accepted formats, and byte/duration limits. Use it when you need to pin a model and want to check it can actually do the job first.

## Multi-tenant

Like every primitive, the routes are AccountKit-gated and available per-user:

```javascript theme={"theme":"css-variables"}
const alice = await naive.users.create({ external_id: "alice" });

const result = await naive.forUser(alice.id).audio.transcribeFile(bytes, "wav", {
  language: "en",
  diarize: true,
});
```

<Warning>
  `audio` is **enabled by default** and sends tenant voice to a per-request selection of 30+ speech providers. There is no consent gate in front of it: `audio` is not one of the opt-in primitives (those are `payments`, `brain` and `people`), so a kit that has never mentioned `audio` — including every older kit with no `audio` entry — can call these routes.

  To stop that, set `primitives_config.audio.enabled = false` on the Account Kit; the routes then return `403 forbidden` with `reason` `primitive_disabled_by_kit`. An explicit `false` is the **only** thing that closes them, and `subprocessor_consent_required` is never the reason for `audio`. See [Account Kits](/docs/architecture/account-kits).
</Warning>

## Billing

Naive bills the **exact cost each request reports**, times a small markup, converted to credits (\$0.05 = 1 credit) — the same model as [LLM](/docs/getting-started/llm), with no per-model rate table to keep in sync.

| Modality         | Billed by                                                    |
| ---------------- | ------------------------------------------------------------ |
| Transcription    | Audio duration (rounded per the endpoint's billing rounding) |
| Speech           | Input characters                                             |
| Speech to speech | Audio seconds in and out, plus tokens where reported         |

Catalog, usage, and route-trace reads are free. Async transcriptions are charged once, when the job completes. Very short calls can round below credit precision and cost nothing at all. See [Credits](/docs/getting-started/credits).

## Agent tools

The `audio` primitive is part of [`agentTools()`](/docs/sdk/agent-tools). The model can call `naive_run_primitive(primitive: "audio", method: "transcribe" | "transcription" | "converse" | "models", arguments: { ... })`.

Synthesis is intentionally not exposed as an agent tool: it returns raw audio bytes, which have no useful representation in a model's context. Call `POST /v1/audio/speech` (or `naive.audio.speech()`) directly and write the bytes to a file or a signed URL.

## Error Handling

| Error                  | Cause                                                                                      | Recovery                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `invalid_input`        | Missing `input_audio`/`file`, missing `model` or `input`, or a `feature` on a pinned model | Fix the field named in `details.param`                        |
| `insufficient_credits` | Not enough Naive credits                                                                   | Top up — see [Credits](/docs/getting-started/credits)              |
| `not_configured`       | The audio primitive isn't configured on this deployment                                    | AgentProfile must set `AUDIO_ROUTER_API_KEY`                  |
| `provider_error`       | Upstream model error, timeout, or unavailability                                           | Retry with backoff, or allow fallbacks / choose another model |
| `not_found`            | Unknown request or transcription id                                                        | Check the id from the original response                       |
| `rate_limited`         | Too many requests                                                                          | Back off and retry                                            |
| `forbidden`            | `audio` disabled by the Account Kit                                                        | Enable it in the kit                                          |
