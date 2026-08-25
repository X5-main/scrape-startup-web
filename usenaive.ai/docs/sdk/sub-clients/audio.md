> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# audio

> Speech routing — transcription, speech synthesis, and native audio conversations.

```ts theme={"theme":"css-variables"}
import { readFile, writeFile } from "node:fs/promises";

// ── Speech to text ──────────────────────────────────────────────────────
// transcribeFile() base64-encodes the bytes for you.
const bytes = await readFile("meeting.wav");
const t = await naive.audio.transcribeFile(bytes, "wav", {
  language: "en",     // send it when you know it — skips detection, faster + more accurate
  diarize: true,      // speaker labels, normalized to spk_N
  timestamps: "word",
});
t.text;
t.segments;
t.route.mode;         // "auto" | "alias" | "exact"
t.credits_used;

// Or pass base64 yourself:
await naive.audio.transcribe({
  input_audio: { data: base64, format: "wav" },
  model: "stt/auto",  // omit for automatic routing
});

// Long recordings: queue, then poll.
const job = await naive.audio.transcribeAsync({ input_audio: { data: base64, format: "wav" } });
const done = await naive.audio.transcription(job.id);   // status: queued|running|succeeded|failed|canceled

// ── Text to speech ──────────────────────────────────────────────────────
// Returns the bytes plus the request id (a binary body carries no usage object).
const { audio, content_type, request_id } = await naive.audio.speech({
  model: "tts/auto",
  input: "Your order shipped this morning.",
  voice: "auto",
  feature: "Expressiveness",   // managed routes only; case-sensitive
  response_format: "mp3",
});
await writeFile("update.mp3", Buffer.from(audio));

// Stream it instead of buffering the whole clip:
const res = await naive.audio.speechStream({ model: "tts/auto", input: "…", voice: "auto" });
// res.body is a ReadableStream

// ── Speech to speech ────────────────────────────────────────────────────
// The model answers the audio directly — not transcription then synthesis.
const reply = await naive.audio.converse({
  model: "s2s/auto",
  voice: "auto",
  input_audio: { data: base64Question, format: "wav", channels: 1 },
  output_audio: { format: "wav" },
  instructions: "Answer the speaker briefly.",
});
reply.transcript;         // what the model said
reply.input_transcript;   // what it heard (null if the model doesn't report one)
await writeFile("answer.wav", Buffer.from(reply.audio.data, "base64"));

// ── Catalog & observability (free) ──────────────────────────────────────
const { data: models } = await naive.audio.models({ task: "transcription" });
const { data: endpoints } = await naive.audio.endpoints({ task: "speech" });  // capabilities, price, limits
const trace = await naive.audio.request(request_id!);   // candidates, filters, attempts
const cost = await naive.audio.usageFor(request_id!);   // the billed row for one request
const { data: rows, next_cursor } = await naive.audio.usage({ limit: 50 });
```

Routing is either managed (`"auto"`, `"stt/auto"`, `"tts/auto"`, `"s2s/auto"` — every
eligible model is ranked, with automatic fallbacks) or pinned to an exact
`owner/model` slug (no fallbacks unless you set `provider.allow_fallbacks`).
Constrain a single request with `provider`:

```ts theme={"theme":"css-variables"}
await naive.audio.transcribe({
  input_audio: { data: base64, format: "wav" },
  model: "stt/auto",
  provider: {
    only: ["deepgram", "groq"],
    require_features: true,               // don't silently degrade
    max_price: { per_min: 0.01 },
    region: ["us", "global"],
  },
});
```

Billed in Naive credits from the cost each request reports — by audio duration
for transcription, input characters for synthesis, and audio seconds for
conversations. Catalog and usage reads are free. Per-user and AccountKit-gated
like other primitives (`naive.forUser(id).audio`).

See the [Audio primitive guide](/docs/getting-started/audio) for the full parameter
reference, the `feature` values that steer managed routing, and error handling.

<Info>
  `feature` is case-sensitive and valid only on `tts/auto` / `s2s/auto` with
  `voice: "auto"`. Pinned models reject it — native voice ids aren't portable, so
  a managed route can't honor them.
</Info>

<Warning>
  `audio` is **on by default** — no Account Kit change is needed to call it,
  including on an older kit with no `audio` entry. Setting
  `primitives_config.audio.enabled = false` turns it off, and every call then returns
  **403 `forbidden`** (`primitive_disabled_by_kit` — never
  `subprocessor_consent_required`, which only applies to the opt-in primitives). See
  [Audio → Multi-tenant](/docs/getting-started/audio#multi-tenant).

  Naive also applies two defaults you should know about: requests are pinned to
  `provider.region = ["us","global"]`, and transcription sets `retention` (`none`
  for sync, `transcript` for async). Both are overridden by anything you pass
  explicitly.
</Warning>
