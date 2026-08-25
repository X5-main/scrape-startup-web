# Utility Models

Beyond the conversational and coding tiers, AVELIN-API exposes specialized models
for embeddings, transcription, text-to-speech, and image generation. All are available through
the same base URL and API key.

## Embeddings — `bge-m3`

High-quality multilingual text embeddings for search, retrieval, and RAG.

| Capability | Detail |
| --- | --- |
| Mode | embedding |
| Context window | up to 8,192 tokens |
| Endpoint | `POST /v1/embeddings` |

```bash
curl https://api.avelin.ai/v1/embeddings \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "model": "bge-m3", "input": "text to embed" }'
```

**Best for:** semantic search, document retrieval, clustering, and powering Y-RAY
knowledge workflows.

## Transcription — `whisper-large-v3`, `whisper-large-v3-turbo`, `avelin-stt`

Speech-to-text transcription.

| Model | Profile |
| --- | --- |
| `whisper-large-v3` | highest transcription accuracy |
| `whisper-large-v3-turbo` | faster transcription for high volume |
| `avelin-stt` | fast, streaming-friendly speech-to-text |

Endpoint: `POST /v1/audio/transcriptions`

```bash
curl https://api.avelin.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -F model="whisper-large-v3-turbo" \
  -F file="@meeting.mp3"
```

**Best for:** meeting notes, call transcription, voice interfaces.

## Text-to-Speech — `tts-1`, `tts-1-hd`

Voice synthesis with OpenAI-compatible model and voice names — existing OpenAI SDK
clients work unchanged.

| Model | Profile |
| --- | --- |
| `tts-1` | low latency, cost-efficient voice |
| `tts-1-hd` | highest audio quality |

Endpoint: `POST /v1/audio/speech`. Voices follow OpenAI naming (`alloy`, `onyx`, ...);
output formats: mp3, opus, pcm.

```bash
curl https://api.avelin.ai/v1/audio/speech \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "model": "tts-1", "voice": "alloy", "input": "Welcome to AVELIN." }' \
  --output speech.mp3
```

**Best for:** voice interfaces, narration, and audio briefings.

## Image Generation — `avelin-imagegen`, `avelin-imagegen-pro`

Text-to-image generation.

| Model | Profile |
| --- | --- |
| `avelin-imagegen` | standard image generation |
| `avelin-imagegen-pro` | higher-quality image generation |

Endpoint: `POST /v1/images/generations`

```bash
curl https://api.avelin.ai/v1/images/generations \
  -H "Authorization: Bearer sk-avelin-xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "model": "avelin-imagegen", "prompt": "a minimalist product logo" }'
```

**Best for:** marketing assets, mockups, and creative concepting.

## Related

- [Model Catalog](README.md)
- [API Reference](../api/index.md)
