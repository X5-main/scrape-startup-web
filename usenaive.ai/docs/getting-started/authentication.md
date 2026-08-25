> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Authentication

> API keys, Bearer token auth, onboarding flows, and error handling.

## CLI First

```bash theme={"theme":"css-variables"}
# Register (new account)
naive register --name "My Agent" --email owner@example.com --password securepassword123 --company "Acme Corp"

# Login (existing account)
naive login --email owner@example.com --password securepassword123

# Passwordless email magic-link flow
naive auth email existing@example.com
```

## Browser sign-in (no password)

`naive auth` runs a browser-based login and drops the resulting API key into your local CLI config — the fastest passwordless setup for new and existing accounts.

```bash theme={"theme":"css-variables"}
# Sign in / sign up with Google in your browser
naive auth google

# Sign in / sign up with an email magic link
naive auth email owner@example.com
```

Both commands start a temporary loopback listener on `127.0.0.1`, open your browser to authenticate, and receive the credential back on the loopback — nothing is pasted or echoed to the terminal.

<Info>
  `naive auth google` / `naive auth email` establish your **developer** identity and API key — different from the [Auth primitive](/docs/getting-started/auth), which manages the end-users of an app you deploy.
</Info>

### Human session (for consent-gated actions)

A few actions are **human-only** and cannot be performed with an agent API key alone — voice cloning and voice revocation record a legal consent affirmation, so they require a signed-in human session (a cookie), not just a key.

```bash theme={"theme":"css-variables"}
# Establish a human session cookie (browser loopback)
naive auth session-login

# ...now human-gated commands work:
naive voice clone sample.wav --name "Founder" --i-affirm
naive voice revoke <voice-id> --yes

# End the session (clears server-side + local cookie)
naive auth logout
```

Under the hood the browser flow calls `GET /v1/auth/oauth/google` (Google) or `POST /v1/auth/magic/start` (email magic link), and the human session is a `naive_session` cookie validated by the API on consent-gated routes.

## API Keys

Every request requires a Bearer token: `Authorization: Bearer nv_sk_live_...`

Keys are scoped to one **agent** inside one **company**. Identity is resolved automatically — you never need to pass agent or company IDs.

## Getting a Key

### Option A: Self-Register (new account)

```bash theme={"theme":"css-variables"}
POST /v1/auth/register
{
  "name": "My Agent",
  "email": "owner@example.com",
  "password": "securepassword123",
  "company_name": "Acme Corp"
}
```

Returns an API key immediately. Creates a new company on a 7-day starter trial. The balance starts at **0 credits** — a verification link is emailed at registration, and the 20 free credits are granted once you click it. The password is required (min 8 characters) and can be used to log in again later or access the Naive dashboard.

Verifying opens every primitive except one: **LLM routing needs a paid account**, so `POST /v1/llm/chat/completions` and the `/v1/proxy/*` passthroughs answer `402 llm_routing_requires_payment` until you buy credits or subscribe. If model routing is what you came for, plan for that step rather than discovering it after verification. See [Credits](/docs/getting-started/credits).

### Option B: Login (existing account)

If you already registered or have a dashboard account:

```bash theme={"theme":"css-variables"}
POST /v1/auth/login
{
  "email": "owner@example.com",
  "password": "securepassword123"
}
```

Returns a fresh API key. If you have multiple companies, the first is selected by default — use `POST /v1/auth/select-company` to switch.

### Option C: Email Magic Link (passwordless)

For a new or existing account without a password:

```bash theme={"theme":"css-variables"}
naive auth email existing@example.com
```

The CLI requests an emailed one-time link, waits on `127.0.0.1`, exchanges the
single-use callback code, and saves the resulting API key. Direct API clients
should use registration/login or the browser OAuth flow; the retired
`/v1/auth/link` and `/v1/auth/verify` endpoints no longer mint credentials.

## Key Management

```bash theme={"theme":"css-variables"}
# List keys
GET /v1/auth/keys

# Create new key
POST /v1/auth/keys
{ "name": "Production Key" }

# Revoke key (immediate, irreversible)
DELETE /v1/auth/keys/:id
```

<Warning>
  Revoking a key takes effect immediately. Any clients using that key will start receiving 401 errors.
</Warning>

## Rate Limiting

| Tier | Rate                |
| ---- | ------------------- |
| Free | 60 requests/minute  |
| Pro  | 300 requests/minute |

Rate limit headers on every response:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1714250400
```

## Error Format

Every error follows this structure:

```json theme={"theme":"css-variables"}
{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid Authorization header",
    "hint": "Set header: Authorization: Bearer nv_sk_...",
    "docs": "https://usenaive.ai/docs/getting-started/authentication"
  }
}
```

### Error Codes

| Code                   | Status | Meaning                                        |
| ---------------------- | ------ | ---------------------------------------------- |
| `unauthorized`         | 401    | Missing or invalid Bearer token                |
| `forbidden`            | 403    | Key valid but not authorized for this resource |
| `insufficient_credits` | 402    | Not enough credits                             |
| `rate_limited`         | 429    | Too many requests                              |
| `invalid_inbox`        | 400    | Inbox UUID not found or not owned              |
| `resource_not_found`   | 404    | Entity doesn't exist                           |
| `invalid_input`        | 400    | Validation failure                             |
| `provider_error`       | 502    | External service failed                        |
| `duplicate_request`    | 409    | Idempotency-Key already used                   |
| `duplicate_record`     | 409    | Record already exists (e.g., email taken)      |

## Idempotency

For mutation requests, pass an `Idempotency-Key` header to prevent duplicate operations:

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/email/send \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Idempotency-Key: unique-request-id-123" \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

If the same key is seen within 24 hours, the original response is returned without re-executing.
