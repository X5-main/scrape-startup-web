> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Register

> POST /v1/auth/register — Create a new Naive account with email and password, get an API key immediately.

<ParamField body="name" type="string" required>
  Agent name (displayed in identity responses)
</ParamField>

<ParamField body="email" type="string" required>
  Owner's email address (must be unique)
</ParamField>

<ParamField body="password" type="string" required>
  Account password (minimum 8 characters). Used for login and dashboard access.
</ParamField>

<ParamField body="company_name" type="string">
  Company name (defaults to `"<name>'s Company"`)
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "name": "My Research Agent",
      "email": "owner@example.com",
      "password": "securepassword123",
      "company_name": "Acme Corp"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 201 theme={"theme":"css-variables"}
  {
    "api_key": "nv_sk_live_abc123...",
    "agent_id": "uuid",
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "domain": "acme-corp.usenaive.ai",
    "pending_verification": true,
    "hint": "Save this key securely. Check owner@example.com for a verification link — your 20 free credits are granted once you verify your email. A system email domain is being provisioned. Use GET /v1/domains to check status and POST /v1/domains/:id/verify to verify DNS."
  }
  ```
</ResponseExample>

## What this creates

1. A user account (same `user` table used by the Naive dashboard)
2. A credential account with bcrypt-hashed password
3. A company workspace with a unique prefix
4. A company membership (owner role)
5. An API agent
6. A credit balance that starts at **0** — the 20 free credits are granted when the owner clicks the verification link emailed at registration. They spend on every primitive except LLM routing, which needs a paid account
7. A default API key
8. A system email domain (`{slug}.usenaive.ai`) — `status: active` immediately; its `dns_status` stays `pending_verification` until Resend verifies the email records

## Notes

* No authentication required (public endpoint)
* **Email verification gates the free credits**: the account starts at 0 credits and priced calls answer `insufficient_credits` until the verification link (valid 24 hours) is clicked. Use `POST /v1/auth/session/resend-verification` to resend it.
* **Verification does not open LLM routing.** That primitive is not covered by the free credits at all: chat completions (and the `/v1/proxy/*` passthroughs) answer `402 llm_routing_requires_payment` until the company buys credits (`POST /v1/billing/topup`) or subscribes (`POST /v1/billing/subscribe`). Resending the verification email or receiving a comped grant does not change it. See [Credits](/docs/getting-started/credits).
* The API key is only shown once — save it immediately
* Password is hashed with bcrypt (12 rounds) and stored securely
* The same email/password works on the Naive dashboard (usenaive.ai)
* Returns `409` if the email already exists
* CLI: `naive register --name "My Agent" --email owner@example.com --password mypassword`

<Info>
  Registration is a REST-only operation. MCP connections require an existing API key.
</Info>
