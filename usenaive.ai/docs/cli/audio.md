> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# audio

> Transcribe audio, synthesize speech, and hold native audio conversations from the CLI.

```bash theme={"theme":"css-variables"}
# Transcribe a recording
naive audio transcribe meeting.wav

# With a known language, speaker labels, and word timings
naive audio transcribe call.mp3 --language en --diarize --timestamps word

# Queue a long recording, then poll it
naive audio transcribe podcast.wav --async
naive audio transcription req_abc123

# Synthesize speech to a file
naive audio speak "Your order shipped this morning." -o update.mp3
naive audio speak "Deliver this dramatically." --feature Acting -o line.mp3

# Send a spoken turn, save the spoken reply
naive audio converse question.wav -o answer.wav

# Catalog and spend (free)
naive audio models --task transcription
naive audio usage --limit 20
naive audio request req_abc123
```

<Warning>
  `audio` is **on by default** — no Account Kit change is needed to use these
  commands, including on an older kit with no `audio` entry. Setting
  `primitives_config.audio.enabled = false` turns them off, and every command then
  returns **403 `forbidden`** (`primitive_disabled_by_kit` — never
  `subprocessor_consent_required`, which only applies to the opt-in primitives). See
  [Audio](/docs/getting-started/audio#multi-tenant).
</Warning>

## `naive audio transcribe <file>`

| Option                       | Description                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `-m, --model <model>`        | Exact model slug. Omit for automatic routing.                                                                                           |
| `-l, --language <code>`      | Language hint (BCP-47, e.g. `en`, `pt-BR`). **Pass it when you know it** — it skips detection, lowering latency and improving accuracy. |
| `--format <format>`          | Audio format override. Inferred from the file extension by default.                                                                     |
| `--prompt <text>`            | Context or vocabulary hint.                                                                                                             |
| `--response-format <format>` | `json`, `verbose_json`, `text`, `srt`, `vtt`, or `diarized_json`.                                                                       |
| `--timestamps <granularity>` | `none`, `segment`, `word`, or `both`.                                                                                                   |
| `--diarize`                  | Label speakers (normalized to `spk_N`).                                                                                                 |
| `--redact`                   | Redact detected PII where supported.                                                                                                    |
| `--translate`                | Translate the transcript to English where supported.                                                                                    |
| `--async`                    | Queue the job and return a request id to poll. Use for long audio.                                                                      |

Returns the transcript, segments, detected language, the `route` trace, and `credits_used`.

<Warning>
  The CLI sends audio as base64 JSON, which the API caps at about **18 MB** of source
  audio. Larger recordings are refused up front with a `payload_too_large` error —
  upload them via the multipart API route (100 MB), or downsample first with
  `ffmpeg -i in.wav -ac 1 -ar 16000 out.wav`.
</Warning>

## `naive audio transcription <id>`

Poll a queued transcription. Status moves through `queued` → `running` →
`succeeded` (or `failed` / `canceled`); the transcript appears once it succeeds.
The charge lands on the first poll that sees `succeeded` — polling again never
double-charges.

## `naive audio speak [text]`

| Option                           | Description                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `-o, --output <path>`            | **Required.** Write the audio here.                                          |
| `-m, --model <model>`            | Defaults to `tts/auto` (automatic routing).                                  |
| `-v, --voice <voice>`            | Defaults to `auto`. Pinned models take a native voice id.                    |
| `--feature <feature>`            | Capability to prioritize. Automatic routing only.                            |
| `-f, --response-format <format>` | `mp3` (default), `ogg`, `opus`, `aac`, `flac`, `wav`, `pcm`, `ulaw`, `alaw`. |
| `--speed <n>`                    | Playback speed multiplier.                                                   |
| `--instructions <text>`          | Style guidance for instruction-following voices.                             |
| `--language <code>`              | Language hint for multilingual voices.                                       |

`--feature` values are **case-sensitive**: `Acting`, `Expressiveness`,
`Voice identity`, `Language stability`, `Reliability`, `Extended long-form`,
`Long-form`, `Acoustic quality`. The CLI refuses `--feature` alongside a pinned
`--model`, because the API rejects that combination.

The result reports the bytes written and the `request_id`, so you can follow up
with `naive audio usage <request_id>` for the cost.

## `naive audio converse <file>`

| Option                     | Description                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `-o, --output <path>`      | **Required.** Write the reply audio here.                                                                                                  |
| `-m, --model <model>`      | Defaults to `s2s/auto`.                                                                                                                    |
| `-v, --voice <voice>`      | Defaults to `auto`.                                                                                                                        |
| `--feature <feature>`      | `Emotion Understanding`, `Emotion Alignment`, `Expressive Robustness`, `Voice naturalness`, `Problem redirecting`. Automatic routing only. |
| `--instructions <text>`    | How the model should answer the turn.                                                                                                      |
| `--format <format>`        | Input audio format. Inferred from the file extension.                                                                                      |
| `--output-format <format>` | Reply audio format. Defaults to `wav`.                                                                                                     |

Prints both transcripts — what the model heard and what it said — and writes the
reply audio to `--output` rather than echoing base64 into the result.

## `naive audio models`

List routable models and routing aliases. `--task` filters by
`transcription`, `speech`, or `s2s`. Free.

## `naive audio usage [request_id]`

With no argument, lists billed audio requests newest-first
(`--limit`, `--cursor`, `--from`, `--to`). With a request id, shows that one
request's usage row. Free.

## `naive audio request <request_id>`

Shows a request's metadata and route trace — which candidates were considered,
which were filtered out, what was attempted, and how it ended. Free.

## Billing

Transcription is billed by audio duration, speech by input characters, and audio
turns by seconds in and out. Catalog, usage, and route-trace reads are free. See
[Credits](/docs/getting-started/credits).
