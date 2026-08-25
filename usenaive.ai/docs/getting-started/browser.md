> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Browser

> Cloud browser sessions your agents drive — navigate, act, extract — plus autonomous signup/login that generates and vaults credentials, with a human live view.

The browser primitive gives your agents a real, cloud-hosted browser they can drive step by step (navigate, act, extract, observe, screenshot), reusable saved logins, and two high-level autonomous actions — **signup** and **login** — that handle account creation and re-authentication end to end. Sessions are per-user, scoped to an allowlist of domains, metered per action, and watchable live from the dashboard.

It is a per-tenant-user primitive: every session belongs to a `tenant_user` and is gated by that user's [Account Kit](/docs/architecture/account-kits) (`browser` must be enabled). Enable or disable it per kit, and optionally require [human approval](/docs/architecture/approvals) for autonomous signup.

Over HTTP that means **every browser route is tenant-scoped — `/v1/users/:user_id/browser/…` —
and there is no company-scoped `/v1/browser`.** Use `me` (or `default`) for the caller's own
subject: `POST /v1/users/me/browser/sessions`. The CLI's `naive browser …` commands and the SDK
fill the segment in for you, which is why their examples appear to have no `:user_id`.

## CLI First

```bash theme={"theme":"css-variables"}
# Drive a session step by step
naive browser session create --allowed-domains example.com --timeout 15
naive browser navigate <session_id> https://example.com
naive browser act <session_id> "click the search button"
naive browser extract <session_id> "the list of product names and prices"
naive browser links <session_id> --contains linkedin.com   # real hrefs + current URL
naive browser session close <session_id>

# Autonomous signup / login (credentials are generated + stored for you)
naive browser signup figma.com https://figma.com/signup
naive browser login  figma.com https://figma.com/login
```

## How it works

| Capability       | What it does                                                                         | Cost                            |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------------- |
| `session create` | Open a live cloud browser scoped to `allowed_domains`                                | 0 credits (time floor at close) |
| `navigate`       | Go to a URL (allowlist + SSRF enforced)                                              | 0.05 credits                    |
| `act`            | Natural-language action (click/fill/scroll); returns the page `url` after the action | 1.7 credits                     |
| `extract`        | Pull structured data (visible text) from the page (read-only)                        | 1.7 credits                     |
| `links`          | Read anchor `href`s + the current URL via a DOM read (read-only)                     | 0.05 credits                    |
| `observe`        | List candidate elements/actions (read-only)                                          | 1.7 credits                     |
| `screenshot`     | Capture the page (short-lived signed URL)                                            | 0.05 credits                    |
| `signup`         | Autonomous account creation + credential vaulting                                    | 8.5 credits                     |
| `login`          | Autonomous re-authentication from the vault                                          | 5.1 credits                     |

Steps that make no model call (`navigate`, `links`, `screenshot`) are priced off browser time; `act`, `extract` and `observe` each run one model call and cost more.

<Note>
  **`navigate` and `act` require an `Idempotency-Key` header.** Both are billed actions, and a
  retry without a key would double-charge — so the API refuses the request with `400 invalid_input`
  rather than risk it. Send a stable value (a hash of `session_id` + action + instruction works
  well); repeating it is what makes a retry safe.

  ```bash theme={"theme":"css-variables"}
  curl -X POST "$API/v1/users/me/browser/sessions/$SESSION_ID/navigate" \
    -H "Authorization: Bearer $NAIVE_API_KEY" \
    -H "Idempotency-Key: nv25-navigate-1" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://example.com"}'
  ```

  The CLI, SDK and MCP surfaces set the header for you — this applies to raw HTTP callers. Every
  other mutation accepts `Idempotency-Key` as an optional safety net; on these two it is required.
</Note>

Sessions have a hard TTL (default 15 min, max 30) and a per-session credit ceiling of 70. Always close sessions when done — an idle session still bills a vendor **time floor** at close, based on actual elapsed time: 0.25 credits (≤5 min), 0.75 (≤15 min), 1.5 (≤30 min), then 0.1 credits/min past 30 (a session closed after its TTL still bills by real elapsed time).

## Reading URLs & links

`extract` reasons over the page's **accessibility tree** — the same semantic view a screen
reader sees. That tree carries roles and *visible text*, but **not** raw DOM attributes like a
link's `href` or `window.location`. So asking `extract` for "the LinkedIn URL" or "the current
page URL" returns visible text (or a fabricated-looking guess), never the real target. Two
purpose-built reads cover URLs:

<CardGroup cols={2}>
  <Card title="links — link targets" icon="link">
    `links(session_id, { contains?, limit? })` does a direct DOM read and returns
    `{ url, links: [{ text, href }] }`. This is the reliable way to capture real hrefs
    (LinkedIn / GitHub / profile links). Filter with `contains` (matches href **or** text) and cap
    with `limit` (default 300, max 1000).
  </Card>

  <Card title="act / navigate — the current URL" icon="location-dot">
    `act` and `navigate` both return the page **`url`** *after* the step runs — the way to learn
    where a click landed, including SPA route changes that put an opaque token in the path (e.g.
    `/applicants/<token>`), which no page-content read can reconstruct.
  </Card>
</CardGroup>

```bash theme={"theme":"css-variables"}
naive browser act <session_id> "open the first candidate" # → result.url = https://…/applicants/abc123
naive browser links <session_id> --contains linkedin.com  # → [{ text, href }], plus the current url
```

`links` is read-only and, on a logged-in (context-backed) saved-login session, is
capability-gated (`--allow-extract`) and output-redacted exactly like `extract`.

## Autonomous signup & login

This is the core workflow: an agent that needs an account on a third-party service can create one and reuse it later, without ever handling the password itself.

<Steps>
  <Step title="Signup">
    `signup` opens a scoped, write-enabled session, **switches the page to the registration form** (a combined auth page usually renders sign-in by default), fills it with the user's identity (email + name) and a **strong generated password**, submits, and stores `{ email, password }` in the user's encrypted [Vault](/docs/getting-started/vault) under the key `login:<service>`. The password is never returned to the agent or sent to the model.

    Success is decided by what the page did, not by the click landing: if the browser never leaves the form, the call fails with `502 provider_error` and `reason: "no_navigation_after_submit"`. A failed signup does **not** charge the 8.5-credit signup price (the session's time floor still applies) and leaves the vault entry `pending` rather than `active`. A single-page app that registers without navigating can be reported as a failure even though the account exists — the credential is still in the Vault, and `login` reads it regardless of status.
  </Step>

  <Step title="Approval (optional)">
    Because signup creates a real account under the user's identity, it is approval-gated by default. When gated, the call returns `status: "pending_approval"` (HTTP 202) and runs only after a human approves it. Toggle this per Account Kit.
  </Step>

  <Step title="Login later">
    When a session expires and the agent needs the service again, `login` reads the stored credential from the Vault and signs back in — again without the password crossing the agent/LLM boundary.
  </Step>
</Steps>

Secrets never reach the model: the password is filled via variable substitution (`%password%` is a placeholder; the real value is substituted locally, never logged or sent to the LLM). Signup uses the tenant user's profile `email` as the account email — point it at a provisioned [inbox](/docs/getting-started/email) so verification emails can be received (set with [`profile`](/docs/sdk/sub-clients/profile)). If you already have a working email/password, store it with `saveCredential` (`POST .../browser/credentials`) instead of typing it via `act`.

## Saved logins (Tier B)

For services where a human must log in once (SSO, 2FA, CAPTCHAs), open a `human_login` session, complete the login in the **dashboard live view**, then `save_login` to persist it as a reusable, encrypted vendor-side context. naive stores only an opaque pointer — never the cookies or credentials. Later sessions reopen already-logged-in by name (`--context-name`), gated by a human-created grant (default-deny; an agent can use a saved login but never create the grant or revoke it).

## Live view

From the dashboard, open a user's **Browser** tab to see their sessions. For an active session you can watch it stream in real time and click **Take control** to interact directly — this is how a human completes the one-time login for a saved-login context, or steps in to solve a CAPTCHA.

## Safety

* **Domain allowlist (default-deny).** Every session must pass `allowed_domains`; pass `['*']` to browse unrestricted (not recommended — no DNS-rebinding protection). An SSRF denylist (private/loopback/metadata hosts, non-http(s) schemes) always applies.
* **Writes are gated.** Destructive/submit actions are rejected unless the session was opened with `allow_writes`.
* **No secrets in instructions.** An `act` instruction carrying a **secret-shaped value** — an API key, JWT, card number, or any random-looking 20+ character token — is **refused with `403 forbidden`**, and a refused call is not billed. Rewording the sentence does not help: the check looks at the value, not the topic. A second, **advisory** check also refuses instructions that name a password, 2FA/OTP code, CVV, PIN, SSN or API key as the thing being entered; it reads topic words, so treat it as a speed bump and not a guarantee. Naming a UI surface is fine — `"type Acme into the Name field in the Create API key dialog"` is allowed. Use the autonomous signup/login flow or `saveCredential` instead — both fill the value server-side, so it never reaches the model.
* **Read-restricted saved logins.** On a logged-in (context-backed) session, `extract`/`observe`/`screenshot` are disabled unless a human opened it with `allow_extract`, and their output is redacted. Naive's own `nv_…` keys are stripped from `extract`/`observe`/`links` output on **every** session, context-backed or not.
