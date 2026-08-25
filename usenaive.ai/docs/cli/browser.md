> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# browser

> Drive a live cloud browser session step by step, and run autonomous signup/login backed by the credential vault.

## Overview

| Command                                    | Description                                                    | Cost                                                    |
| ------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------- |
| `naive browser session create`             | Open a live browser session                                    | 0 credits                                               |
| `naive browser session status <id>`        | Check a session's status                                       | —                                                       |
| `naive browser session close <id>`         | Close a session                                                | time floor (0.25–1.5, then 0.1 credits/min past 30 min) |
| `naive browser navigate <id> <url>`        | Navigate to a URL                                              | 0.05 credits                                            |
| `naive browser act <id> <instruction>`     | Natural-language action (returns the page URL after it)        | 1.7 credits                                             |
| `naive browser extract <id> <instruction>` | Extract structured data (visible text)                         | 1.7 credits                                             |
| `naive browser links <id>`                 | Read anchor `href`s + the current URL (what extract can't see) | 0.05 credits                                            |
| `naive browser observe <id> <instruction>` | List candidate elements                                        | 1.7 credits                                             |
| `naive browser screenshot <id>`            | Capture the page (signed URL)                                  | 0.05 credits                                            |
| `naive browser signup <service> <url>`     | Autonomous account creation                                    | 8.5 credits                                             |
| `naive browser login <service> <url>`      | Autonomous re-login from the vault                             | 5.1 credits                                             |
| `naive browser context save <id>`          | Persist a human login as a saved context                       | —                                                       |
| `naive browser context grant <name>`       | Grant an agent/role access to a saved login (human-only)       | —                                                       |

All commands run against the active user (`naive use <id>`, or `NAIVE_ACTIVE_USER_ID`) or the
API key's default user. `naive browser` declares no `--user` flag — passing one is an
`invalid_input` error. See [use](/docs/cli/use).

***

## Sessions

```bash theme={"theme":"css-variables"}
naive browser session create --allowed-domains example.com,docs.example.com --timeout 15
naive browser session create --allowed-domains '*' --allow-writes
naive browser session status <session_id>
naive browser session close <session_id>
```

### `session create` options

| Flag                       | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--allowed-domains <list>` | Required. Comma-separated allowlist (default-deny). Use `'*'` to browse unrestricted (not recommended). |
| `--allow-writes`           | Permit write/destructive `act()` instructions (default off).                                            |
| `--timeout <minutes>`      | Hard session TTL (default 15, max 30).                                                                  |
| `--context-name <name>`    | Reopen a saved login by name (requires a grant).                                                        |
| `--human-login`            | Open a human first-login session (agents locked out until `context save`).                              |
| `--allow-extract`          | On a saved-login session, permit extract/observe/screenshot.                                            |
| `--proxy`                  | Route egress through a residential proxy (requires `--allowed-domains`).                                |

## Drive a session

```bash theme={"theme":"css-variables"}
naive browser navigate <session_id> https://example.com
naive browser act <session_id> "click the login button"          # result.url = where the click landed
naive browser extract <session_id> "the list of product names and prices"
naive browser links <session_id> --contains linkedin.com          # real hrefs + current URL
naive browser observe <session_id> "the buttons that add an item to the cart"
naive browser screenshot <session_id>
```

`act` and `navigate` send a stable `Idempotency-Key` automatically so a retried logical step never double-submits. An `act` instruction carrying a **secret-shaped value** (API key, JWT, card number, any random-looking 20+ character token) is **refused with `403 forbidden`** — on every session, `--allow-writes` or not — and a refused call is not billed; rewording does not get past it, because the check reads the value rather than the topic. A second, **advisory** check refuses instructions that name a password, 2FA/OTP code, CVV, PIN, SSN or API key as the thing being entered — a speed bump, not a guarantee. Naming a surface is allowed (`"…into the Name field in the Create API key dialog"`). Use `naive browser signup` / `login`, which fill the value server-side.

### Getting URLs: `links` vs `extract`

`extract` reads the page's **accessibility tree** (visible text), which does **not** include link
`href` attributes or the page URL — so it can't return a real URL. Use instead:

* **`naive browser links <id>`** — a direct DOM read returning `{ url, links: [{ text, href }] }`.
  Filter with `--contains <text>` (matches href or text) and cap with `--limit <n>` (default 300, max 1000).
* **the `url` field** in the output of **`act`** / **`navigate`** — the page URL *after* the step, i.e.
  where a click navigated (including SPA routes with opaque path tokens).

```bash theme={"theme":"css-variables"}
naive browser links <session_id> --contains github.com --limit 50
```

`links` is read-only; on a saved-login (context-backed) session it is capability-gated (`--allow-extract`) and redacted, just like `extract`.

## Autonomous signup & login

```bash theme={"theme":"css-variables"}
# Create an account: generates a strong password, fills the form, vaults the credential
naive browser signup figma.com https://www.figma.com/signup

# Re-authenticate later using the vaulted credential
naive browser login figma.com https://www.figma.com/login
```

### Options (both)

| Flag                       | Description                                                  |
| -------------------------- | ------------------------------------------------------------ |
| `--allowed-domains <list>` | Override the session allowlist (defaults to the URL's host). |
| `--timeout <minutes>`      | Hard session TTL (default 15, max 30).                       |

`signup` may require human approval depending on the user's Account Kit. When gated it returns `status: "pending_approval"` and runs only after `naive approvals approve <id>`. The generated password is stored in the user's vault under `login:<service>` and never printed.

The 8.5 credits in the table above are charged only for a sign-up that completed. Success is decided by the page having left the registration form, not by the submit click landing — a combined auth page renders sign-in by default, and the click used to succeed on the wrong button. A sign-up that does not complete fails with `502 provider_error` and `reason: "no_navigation_after_submit"`, is **not** charged the 8.5 (the session's browser-time floor still applies), and leaves the vault entry `pending`. `naive browser login` reads it regardless of status, so an account that does exist is still reachable.

### Output

```json theme={"theme":"css-variables"}
{
  "success": true,
  "action": "browser.signup",
  "result": {
    "success": true,
    "service": "figma.com",
    "credential_saved": true,
    "credits_used": 40,
    "credits_remaining": 960
  },
  "next_steps": [
    { "command": "naive browser login figma.com https://www.figma.com/login", "description": "Log back in later using the saved credential" }
  ]
}
```

## Saved logins

```bash theme={"theme":"css-variables"}
# After a human completes a login in a --human-login session's live view:
naive browser context save <session_id>

# Grant an agent or role access to a saved login (human session only):
naive browser context grant figma --type role --id ops
```

<Info>
  `context grant` and revoke are human-only (use ≠ destroy). The CLI authenticates with an agent key, so grants are normally created from the dashboard. An agent can use a granted saved login but can never create the grant or revoke a shared login.
</Info>
