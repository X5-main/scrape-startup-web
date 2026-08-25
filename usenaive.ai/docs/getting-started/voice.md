> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Voice & Digital Twin

> Clone a consented voice, synthesize speech in it, and generate lip-synced talking videos of a real person from a single reference image.

The **Voice** primitive lets an agent speak in a cloned voice it is authorized to use, and lets a human create and manage those voices under an explicit consent record. On top of it, the **digital-twin clone** turns a reference image + a cloned voice + a script into a lip-synced talking video.

There are two surfaces with deliberately different trust levels:

* **Agent surface** (API key): synthesize speech in a voice the agent already owns, list voices, generate talking videos.
* **Human surface** (signed-in session): create (clone) and revoke voices. These record a legal consent affirmation, so they require a human session — not just an API key.

<Info>
  Cloning and revoking a voice are **human-only**. Run `naive auth session-login` first (see [Authentication](/docs/getting-started/authentication#human-session-for-consent-gated-actions)). Synthesis and talking-video generation work with a normal agent API key.
</Info>

## Cloning a voice (human-only)

```bash theme={"theme":"css-variables"}
# Establish a human session, then clone
naive auth session-login

naive voice clone ./sample.wav \
  --name "Founder VO" \
  --consent-type self \
  --authorized-uses email,video \
  --i-affirm \
  --wait
```

Arguments:

| Argument | Required | Description                                                       |
| -------- | -------- | ----------------------------------------------------------------- |
| `<file>` | Yes      | Audio sample to clone from — the **first positional**, not a flag |

Key options:

| Option                      | Required                   | Description                                               |
| --------------------------- | -------------------------- | --------------------------------------------------------- |
| `--name <name>`             | Yes                        | Display name for the voice                                |
| `--i-affirm`                | Yes                        | You affirm you have the right to clone this voice         |
| `--consent-type <type>`     | Yes                        | `self`, `third_party_attested`, or `third_party_verified` |
| `--authorized-uses <list>`  | No                         | Comma-separated allowed uses, e.g. `email,video`          |
| `--consenter-name <name>`   | For third-party            | Name of the person who consented                          |
| `--consenter-email <email>` | For third-party            | Consenter email (required for third-party consent)        |
| `--accept-tos`              | For `third_party_attested` | Accept the voice-cloning Terms of Service                 |
| `--scope <company\|agent>`  | No                         | Ownership scope (default `company`)                       |
| `--wait`                    | No                         | Poll until the clone is ready                             |

For **third-party** voices the consenter receives a verification link; the voice stays in a draft/pending state until consent is confirmed. `authorized_uses` is enforced at synthesis time — a voice cloned for `email` only will refuse a `video` use.

### Revoking a voice (human-only, irreversible)

```bash theme={"theme":"css-variables"}
naive voice revoke <voice-id> --yes --reason "no longer authorized"
```

This **irreversibly** erases the voice and its underlying audio, and marks the consent record revoked. Any later synthesis attempt returns `voice_revoked`.

## Synthesizing speech (agent surface)

```bash theme={"theme":"css-variables"}
# List voices available to you
naive voice list

# Speak in a voice you own
naive voice say --voice <voice-id> --text "Thanks for booking with us." --out hello.mp3

# Check a past synthesis
naive voice status <synthesis-id>
```

REST:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/voice/synthesize \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "voice_id": "voice-uuid", "text": "Thanks for booking with us.", "use": "email" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const res = await fetch("https://api.usenaive.ai/v1/voice/synthesize", {
    method: "POST",
    headers: { "Authorization": "Bearer nv_sk_your_key", "Content-Type": "application/json" },
    body: JSON.stringify({ voice_id: "voice-uuid", text: "Thanks for booking with us.", use: "email" }),
  });
  const { synthesis_id, url, credits, char_count } = await res.json();
  ```
</CodeGroup>

| REST endpoint                 | Purpose                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `POST /v1/voice/synthesize`   | Synthesize speech (returns a presigned audio URL, valid 24h) |
| `POST /v1/voice/stream`       | Stream synthesized audio                                     |
| `GET /v1/voice/voices`        | List voices available to the caller                          |
| `GET /v1/voice/synthesis/:id` | Status of a past synthesis                                   |

The `use` field must fall within the voice's `authorized_uses`. Text is capped at 5000 characters per call. The audio URL is presigned and expires after 24 hours — re-run `say` if it lapses.

## Digital twin — talking video

`naive clone generate` produces a lip-synced talking video of a real person from a **reference image**, an **existing cloned voice**, and a **script**. The voice supplies both the audio and the consent record; the image supplies the likeness (which you must separately affirm).

```bash theme={"theme":"css-variables"}
naive clone generate \
  --voice <voice-id> \
  --image ./founder.jpg \
  --text "Welcome to the launch — here's what's new this week." \
  --scene "cliffside pool deck at golden hour" \
  --i-affirm \
  --wait

# Check a generation job
naive clone status <job-id>
```

| Option                  | Required | Description                                                         |
| ----------------------- | -------- | ------------------------------------------------------------------- |
| `--voice <id>`          | Yes      | An existing cloned voice profile (its consent + audio)              |
| `--image <path\|url>`   | Yes      | Reference image — a local file or a public `https` URL              |
| `--text <script>`       | Yes      | The script the cloned voice should speak                            |
| `--i-affirm`            | Yes      | You affirm the depicted person consented to this likeness animation |
| `--scene <description>` | No       | Optional scene/relight description                                  |
| `--wait`                | No       | Poll until the job completes                                        |

REST:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/clone/generate \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "voice_id": "voice-uuid",
    "image_url": "https://example.com/founder.jpg",
    "text": "Welcome to the launch.",
    "scene": "golden hour",
    "quality": "max",
    "i_affirm": true
  }'
# Poll: GET /v1/clone/:job_id  (quality: "max" = best lip-sync, "fast" = cheaper)
```

Generation is async and runs through the unified jobs system; the finished video is auto-ingested into your [Media Asset Manager](/docs/getting-started/media).

## Consent model

Every voice is backed by a **consent record** that captures who consented, the affirmation text, and the authorized uses. This is enforced end to end:

* Cloning requires `--i-affirm` and a `consent_type`; third-party voices require the consenter's verification.
* Synthesis and talking-video generation are refused if the voice was revoked (`voice_revoked`) or the declared `use` is outside the authorized set.
* The digital-twin clone additionally requires an explicit likeness affirmation for the depicted person.

## Billing

* **Synthesis** is billed per character of input text at **0.0025 credits/character** — \$0.125 per 1,000 characters, or about 0.3 credits for a 120-word paragraph. The exact charge is returned as `credits` on each `say`, and streaming (`/v1/voice/stream`) is billed at the same rate as `/v1/voice/synthesize`.
* **Talking-video generation** is billed on completion like other video jobs — failed jobs cost nothing.
* **Cloning and revoking** voices are free; you pay only when you synthesize or generate.

Account Kits can enable/disable the `voice` primitive per user, and the human-only clone/revoke surface is always gated behind a signed-in session.
