> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# MCP Tools

> The capability MCP tools on the Naive hosted server — connections, vault, approvals, browser, email, phone, search, media, cards, payments and trading.

<Info>
  This page covers the **capability** tools. Two families are documented separately because they
  answer different questions: the [brain tools](/docs/mcp/brain) cover what the company knows, and the
  [runtime & governance tools](/docs/mcp/runtime-and-governance) cover the team's runtime, the belief
  queue, and how a refusal is made legible to a model. Between the three pages every declared tool
  has exactly one home, and a gate checks it.
</Info>

## Subject resolution

Every multi-tenant tool accepts an optional `user_id` argument — the **child project** the
call acts on. When omitted, the call resolves to the API key's **default tenant user**. The
`user_id` is validated against the key's company — a cross-tenant id returns `not_found`
(never leaked). Tool availability and execution are gated by the resolved user's
[AccountKit](/docs/architecture/account-kits).

Every tool that takes `user_id` also takes an optional **`project_id`**. Omit it and the
call resolves to the organization's default [project](/docs/architecture/projects), which is
where every pre-projects row lives — so an existing `user_id`-only call is unchanged. Pass
both and the resolver asserts the child project is in that project, returning `not_found`
if it is not. A key pinned to a project refuses a different `project_id` with a
`forbidden` / `key_project_mismatch`.

```json theme={"theme":"css-variables"}
{ "name": "naive_vault_list", "arguments": { "user_id": "<child_project_id>", "project_id": "<project_id>" } }
```

## Connections (3rd-party apps)

| Tool                           | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `naive_connections_list`       | List toolkits + status for a user (kit-filtered). Optional `user_id`.                 |
| `naive_connections_connect`    | Start an OAuth/API-key flow → redirect URL. Blocked if the kit disallows the toolkit. |
| `naive_connections_disconnect` | Disconnect a toolkit (`purge` to delete).                                             |
| `naive_connections_tools`      | List a toolkit's tools + input schemas.                                               |
| `naive_connections_execute`    | Execute a tool. Gated by the kit's toolkit + per-tool filter.                         |

## Vault

| Tool               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `naive_vault_put`  | Store/replace an encrypted value for a user.         |
| `naive_vault_get`  | Decrypt + return a value (errors if locked/expired). |
| `naive_vault_list` | List entry keys (values masked).                     |

<Info>
  `rotate` and `delete` are **REST/SDK-only** (`PATCH`/`DELETE /v1/users/{user_id}/vault/{key}`, or `vault.rotate()` / `vault.delete()` in the SDK). They are intentionally not exposed as MCP tools, so an agent cannot destroy or re-key a stored credential.
</Info>

## Logs

| Tool               | Description                            |
| ------------------ | -------------------------------------- |
| `naive_logs_query` | Query a user's recent activity events. |

<Info>
  AccountKit filtering may reject a connection tool with `forbidden` and a reason of
  `toolkit_not_allowed`, `tool_not_allowed`, or `primitive_disabled_by_kit`. Surface the
  error rather than retrying.
</Info>

## Approvals

| Tool                   | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| `naive_approvals_list` | List this user's approval requests and their status.                             |
| `naive_approvals_get`  | Get one approval by the `approval_id` returned in a `pending_approval` response. |

<Info>
  A sensitive call may answer HTTP 202 with `status: "pending_approval"` and an `approval_id`.
  That is a **successful deferral, not an error** — poll `naive_approvals_get` until `status`
  becomes `executed`, `denied` or `failed`.

  There is deliberately **no approve or deny tool**. Only a human can resolve the queue: the
  server refuses an agent-authored resolution, and it refuses a resolver who is also the
  requester. An agent that could approve its own action would make the gate decorative.
</Info>

## Browser

Cloud browser sessions a user's agents drive, plus autonomous signup/login backed by the Vault. Every tool takes an optional `user_id` and is gated by the user's AccountKit (`browser` primitive).

| Tool                           | Description                                                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naive_browser_create_session` | Open a live session scoped to `allowed_domains` (returns a `session_id`). 0 credits (time floor billed at close).                                                |
| `naive_browser_navigate`       | Navigate the session to a URL (allowlist + SSRF enforced). 0.05 credits.                                                                                         |
| `naive_browser_act`            | Natural-language action (click/fill/scroll). Returns the page `url` after the action. Writes require `allow_writes`. 1.7 credits.                                |
| `naive_browser_extract`        | Extract structured data (visible text) from the page (read-only). Can't read hrefs/URL — use `naive_browser_links`. 1.7 credits.                                 |
| `naive_browser_links`          | Read anchor `href`s + the current URL via a DOM read (read-only). The way to get real link targets/URLs. 0.05 credits.                                           |
| `naive_browser_observe`        | List candidate elements/actions (read-only). 1.7 credits.                                                                                                        |
| `naive_browser_screenshot`     | Capture the page → short-lived signed URL. 0.05 credits.                                                                                                         |
| `naive_browser_signup`         | Autonomous account creation: generates + vaults a password, fills + submits. **Sensitive** (may return `pending_approval`). 8.5 credits.                         |
| `naive_browser_login`          | Autonomous re-login from the vaulted credential. 5.1 credits.                                                                                                    |
| `naive_browser_save_login`     | Persist a completed human login as a reusable saved context.                                                                                                     |
| `naive_browser_close_session`  | Close a session and release the browser (idempotent). Bills a time floor of 0.25–1.5 credits by elapsed time (≤5 / ≤15 / ≤30 min), then 0.1 credits/min past 30. |

<Info>
  Credentials never reach the model: signup/login fill the password server-side via variable substitution. There is no agent-facing revoke (destroying a shared saved login is human-only). The live-view URL is never returned to an agent.
</Info>

<Info>
  Storing a known credential and the user's profile email are **REST/SDK-only** (no MCP tool): use `POST /v1/users/{user_id}/browser/credentials` (`saveCredential`) to vault an email/password before a later `naive_browser_login`, and `PATCH /v1/users/{user_id}` (`profile.setEmail`) to point the user's account email at a provisioned inbox so signup verification mail can be received.
</Info>

## Auth & Identity

| Tool                   | Description               |
| ---------------------- | ------------------------- |
| `naive_whoami`         | Get current auth context  |
| `naive_list_companies` | List available companies  |
| `naive_identity`       | Full identity summary     |
| `naive_list_emails`    | List email inboxes        |
| `naive_list_resources` | All provisioned resources |

<Info>
  Registration, linking, and company selection are REST-only operations (not exposed via MCP). Agents connect to MCP after they already have a key.
</Info>

<Info>
  **Orchestration tools** (CEO, tasks, objectives, employees, cron, memory) are available via the **REST API and CLI only**. They are not exposed as MCP tools because orchestration requires stateful conversation flows that don't map well to single tool calls.
</Info>

<Info>
  The following are also **REST/SDK (and where noted, CLI) only** and have no MCP tools: AccountKits, tenant Users CRUD, Approvals (approve/deny), Sessions, Templates and Template Apps, the `profile` primitive, and the browser `save_credential` route. Agents act *within* a kit/session that an agent profile has already configured; managing those objects is a control-plane concern.
</Info>

## Agent Profiles

Provision and govern a per-tenant real-world agent profile (identity, card, comms, runtime). Every regulated action the agent profile's agent takes still routes through the governance gateway.

| Tool                            | Description                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naive_provision_agent_profile` | Provision a governed agent profile for a tenant from a template (idempotent on `idempotency_key`). Returns the id + status                                                          |
| `naive_list_agent_profiles`     | List provisioned agent profiles for the company                                                                                                                                     |
| `naive_get_agent_profile`       | Get a single agent profile's status by id                                                                                                                                           |
| `naive_revoke_agent_profile`    | Revoke — freeze the card, halt sends, tear down runtime. Every subsequent MCP tool call for that profile is refused, and so is every mutating HTTP call. HTTP *reads* are not gated |

<Warning>
  **Revoke is stricter on this transport than on REST, and the tool list does not
  change.** A tool call has no HTTP method, so the dispatcher cannot refuse writes and
  allow reads the way the Express chain does — and `readOnlyHint` is declared for only 14
  of 271 tools, which is not a partition anything should be keyed on. So a revoked or
  suspended profile is refused **every** tool call here. Its session is still *offered*
  all 271 tools: the list is a connect-time snapshot, and hiding them would be a second
  policy in a second place that could disagree with the first.

  **What stops an agent on this transport, ranked by immediacy:**

  | Lever                                                              | Effect on an open MCP session                                                                                                                                                                                                        |
  | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | Revoke the agent profile                                           | **Immediate**, every tool — the subject is re-resolved per call                                                                                                                                                                      |
  | Switch the primitive off in the AccountKit                         | **Immediate**, on the 49 tools that assert a primitive. No effect on the other 222                                                                                                                                                   |
  | Deny the capability, or cross a cap                                | **Immediate**, on the 28 tools that call `mcpGuard` — the governor is consulted per call                                                                                                                                             |
  | Revoke or rotate the key (`DELETE`/`POST …/keys/{keyId}[/rotate]`) | Blocks **new** sessions, and message POSTs from clients that re-send `Authorization`. Does **not** end an SSE session already open whose client omits the header — `AuthContext` is cached at connect and cleared only on disconnect |

  Full measurement, including what this looked like before the current release:
  [the governance gateway](/docs/architecture/governance-gateway#the-second-place-mcp-binds-the-subject-policy-but-a-much-smaller-kit-gate).
</Warning>

## Domains

| Tool                         | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `naive_list_domains`         | List all domains for the company (includes `app_connect_status`)                                                 |
| `naive_connect_domain`       | Connect a custom domain (BYOD)                                                                                   |
| `naive_resend_setup_records` | Get the email-provider setup records the user must add at their registrar to pass verification (read-only)       |
| `naive_verify_domain`        | Trigger DNS verification                                                                                         |
| `naive_search_domain`        | Check domain availability and price                                                                              |
| `naive_purchase_domain`      | Purchase a domain via checkout                                                                                   |
| `naive_list_dns_records`     | List every DNS record on the live DNS zone (with provider record IDs)                                            |
| `naive_set_dns_record`       | Create or replace a DNS record (A/AAAA/CNAME/MX/TXT/CAA). Apex A/AAAA writes flip the domain to `agent_managed`. |
| `naive_delete_dns_record`    | Delete a DNS record by its provider record ID                                                                    |

<Info>
  The DNS edit tools (`naive_list_dns_records`, `naive_set_dns_record`, `naive_delete_dns_record`) are gated behind `AGENT_DNS_EDIT_ENABLED=true` on the API. They enforce a strict allowlist (A/AAAA/CNAME/MX/TXT/CAA), block DMARC/DKIM/inbound records, and rate-limit at 5/min and 20/hr per company. **List** is allowed for system domains (`*.usenaive.ai`); **set/delete** refuse with `SYSTEM_DOMAIN`. For app HTTP on a system domain use `naive apps domains connect` / `verify-dns` — the platform writes the apex A record.
</Info>

### `naive_set_dns_record`

```json theme={"theme":"css-variables"}
{
  "domain_id": "UUID of the domain (required)",
  "type": "A | AAAA | CNAME | MX | TXT | CAA (required)",
  "name": "Record name; '@' or omitted for apex (optional)",
  "value": "Record value (required)",
  "ttl": "TTL in seconds, 60-86400 (optional)",
  "priority": "MX priority 0-65535 (required for MX)",
  "mode": "replace (default) | append (optional)",
  "acknowledge_unowned": "boolean — required when overwriting a record not created by Naive"
}
```

### `naive_delete_dns_record`

```json theme={"theme":"css-variables"}
{
  "domain_id": "UUID of the domain (required)",
  "record_id": "Provider record ID from naive_list_dns_records (required)",
  "acknowledge_unowned": "boolean — required when deleting a record not created by Naive"
}
```

## Email

| Tool                           | Description                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `naive_email_inboxes`          | List sendable inboxes                                                                                    |
| `naive_create_inbox`           | Create a new email inbox on company domain                                                               |
| `naive_delete_inbox`           | Delete (deactivate) an email inbox                                                                       |
| `naive_send_email`             | Send email from inbox (supports CC/BCC, attachments, scheduling via `scheduled_at`, and reply threading) |
| `naive_email_inbox`            | List received emails                                                                                     |
| `naive_get_email`              | Get full email body (includes `message_id` for reply threading)                                          |
| `naive_list_email_attachments` | List attachments on a received email (filename, size, content type, download URL)                        |
| `naive_get_email_attachment`   | Get the download URL for a specific attachment on a received email                                       |
| `naive_reschedule_email`       | Reschedule a previously scheduled email to a new time                                                    |
| `naive_cancel_scheduled_email` | Cancel a scheduled email before it is sent (cannot be re-scheduled afterward)                            |
| `naive_get_sent_email_status`  | Check the delivery status of a sent email (sent, delivered, bounced, opened, clicked)                    |

## Phone

Provision phone numbers and send/receive SMS (Surge-backed). Provisioning is approval-gated; outbound SMS is gated until the carrier (10DLC) campaign is approved. Inbound SMS works immediately.

| Tool                                  | Description                                                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `naive_phone_provision`               | Buy a US number + register the carrier campaign (requires the company EIN)                                              |
| `naive_phone_list`                    | List phone numbers                                                                                                      |
| `naive_phone_status`                  | Carrier-registration pipeline (account → campaign → numbers)                                                            |
| `naive_phone_resend_verification_otp` | Resend the sole-proprietor brand-verification SMS OTP to the KYC member's verified mobile (tier `sole_proprietor` only) |
| `naive_phone_get`                     | Get a single phone number                                                                                               |
| `naive_phone_send`                    | Send an outbound SMS (gated until the campaign is approved)                                                             |
| `naive_phone_messages`                | List received SMS (newest first, cursor-paginated)                                                                      |
| `naive_phone_read`                    | Read a received SMS in full                                                                                             |
| `naive_phone_assignments`             | List agents connected to a number                                                                                       |
| `naive_phone_assign`                  | Connect an agent to a number                                                                                            |
| `naive_phone_release`                 | Release a number back to the provider (stops billing)                                                                   |

## Search

| Tool               | Description                |
| ------------------ | -------------------------- |
| `naive_web_search` | Search the web             |
| `naive_read_url`   | Fetch + extract from URL   |
| `naive_research`   | Multi-source deep research |

## LLM

OpenRouter-backed chat completions across 300+ models. Billed in Naive credits by the model's token cost.

| Tool               | Description                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `naive_llm_chat`   | Run a chat completion (`model` + `messages`, optional `models` fallback chain, `temperature`, `max_tokens`) |
| `naive_llm_models` | List the models OpenRouter can route to (optional `search` filter) — free                                   |

## Audio

Speech routing — transcription, and native audio-in/audio-out turns, across a managed
catalog of speech models. Billed in Naive credits by audio duration.

| Tool                        | Description                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `naive_audio_transcribe`    | Transcribe base64 audio (`data` + `format`, optional `model`, `language`, `diarize`, `timestamps`, `prompt`, `async`) |
| `naive_audio_transcription` | Poll a queued transcription by request `id`                                                                           |
| `naive_audio_converse`      | Send one spoken turn and get the model's spoken reply (`data` + `format`, optional `instructions`)                    |
| `naive_audio_models`        | List audio models and routing aliases (optional `task` filter) — free                                                 |

<Note>
  Text-to-speech has no MCP tool on purpose: it returns raw binary audio, and a
  base64 clip in a tool result would consume the model's context for no benefit.
  Call `POST /v1/audio/speech`, `naive.audio.speech()`, or `naive audio speak` instead.
  `naive_audio_converse` likewise strips the reply audio from its result and returns
  only the transcript — the audio stays available via the REST route.
</Note>

## Images

| Tool                    | Description                     |
| ----------------------- | ------------------------------- |
| `naive_generate_images` | Generate images using AI models |
| `naive_image_status`    | Check image job status          |
| `naive_stock_search`    | Search stock photos             |
| `naive_image_models`    | List available models           |

## Video

| Tool                   | Description                    |
| ---------------------- | ------------------------------ |
| `naive_generate_video` | Generate video using AI models |
| `naive_video_status`   | Check video job status         |
| `naive_video_models`   | List available models          |

## Video Clipping

| Tool                  | Description                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------- |
| `naive_clip_video`    | Submit a long video (public https URL, 90 min or shorter) for AI auto-clipping — async, returns a job id |
| `naive_clip_status`   | Check a clipping or compose job's status                                                                 |
| `naive_video_compose` | Mux a voiceover track onto a video (audio `replace` mode)                                                |

## Voice

Synthesis and discovery only. There is deliberately no clone/create/revoke tool — cloning a voice requires out-of-band human action in the dashboard.

| Tool                           | Description                                                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `naive_voice_list`             | List voices available to this agent (ready + usable). Returns id, display name, tier, status                           |
| `naive_voice_synthesize`       | Generate speech audio in an existing, consented voice you own → a temporary audio URL to attach to email/video/content |
| `naive_voice_synthesis_status` | Get the status of a past synthesis by its `synthesis_id`                                                               |

## Clone (Digital Twin)

Generate a lip-synced talking video of a real person from a reference image + saved cloned voice. Feature-flagged (private beta) — the tools only appear in the catalog when `CLONE_GENERATE_ENABLED` is on.

| Tool                   | Description                                                                                                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naive_clone_generate` | Generate a lip-synced talking video from a reference image + SAVED cloned voice + script (optional scene/relight). Async — returns a job ID; poll `naive_clone_status`. Requires `i_affirm` consent. Credits charged on completion only |
| `naive_clone_status`   | Check the status of a clone generation job                                                                                                                                                                                              |

## Media Assets

| Tool                     | Description                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- |
| `naive_media_list`       | List and filter media assets (auto-populated from clipping and generation jobs) |
| `naive_media_get`        | Get a single asset by ID                                                        |
| `naive_media_upload_url` | Upload media from a public URL                                                  |
| `naive_media_update`     | Update asset title, description, tags                                           |
| `naive_media_delete`     | Delete an asset                                                                 |

## Social

| Tool                             | Description                               |
| -------------------------------- | ----------------------------------------- |
| `naive_social_status`            | Check activation + connected accounts     |
| `naive_social_activate`          | Activate social media for company         |
| `naive_social_connect`           | Get OAuth URL for a platform              |
| `naive_social_portal`            | Get portal URL for multi-platform connect |
| `naive_social_accounts`          | List connected accounts                   |
| `naive_social_disconnect`        | Disconnect an account                     |
| `naive_social_label`             | Set a label on an account                 |
| `naive_social_sync`              | Sync connected accounts                   |
| `naive_social_upload`            | Upload media from URL                     |
| `naive_social_create_post`       | Create a post (draft or publish)          |
| `naive_social_list_posts`        | List social posts                         |
| `naive_social_get_post`          | Get post details                          |
| `naive_social_edit_post`         | Edit a draft post                         |
| `naive_social_delete_post`       | Delete a post                             |
| `naive_social_publish_post`      | Publish a draft                           |
| `naive_social_post_analytics`    | Get post analytics                        |
| `naive_social_post_comments`     | Get post comments                         |
| `naive_social_account_analytics` | Get account analytics                     |

## Verification

| Tool                                 | Description                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `naive_start_verification`           | Start KYC for members with ownership percentages and responsible party designation |
| `naive_list_verifications`           | List all verification requests for the company                                     |
| `naive_get_verification`             | Get verification status + member statuses + `ready_for_formation` flag             |
| `naive_complete_member_verification` | Submit verification validation token for a member                                  |
| `naive_resend_verification_link`     | Resend/regenerate a member's KYC link                                              |

## Formation

| Tool                                | Description                                         |
| ----------------------------------- | --------------------------------------------------- |
| `naive_list_naics_codes`            | List NAICS industry codes for formation             |
| `naive_submit_formation`            | Step 1: Validate KYC + create \$349 hosted checkout |
| `naive_retry_formation_payment`     | Generate fresh checkout URL if original expired     |
| `naive_execute_formation`           | Step 2: Submit for filing after payment is complete |
| `naive_list_formations`             | List all formation requests                         |
| `naive_get_formation`               | Get formation status and details                    |
| `naive_formation_documents`         | List formation documents                            |
| `naive_formation_document_download` | Get document download URL                           |

## Apps

Managed Next.js apps with an optional managed database (fullstack). Fully standalone — no orchestration required: the create response includes a starter-template clone command, and local projects deploy via tarball upload (REST/CLI — `naive_apps_deploy` itself deploys the agent's container workspace). When a company container exists, a dedicated engineer agent is provisioned on creation. Beyond the curated tools, `naive_apps_vercel_api` and `naive_apps_supabase_api` proxy **any** hosting REST API / backend management API operation, scoped to the app's own project with credentials injected.

| Tool                             | Description                                                                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naive_apps_list`                | List all apps                                                                                                                                                           |
| `naive_apps_create`              | Create an app (`frontend_only` or `fullstack` — provisions managed hosting + optional managed backend; optional template `variant`; returns the template clone command) |
| `naive_apps_templates`           | List starter templates (GitHub repo + clone commands)                                                                                                                   |
| `naive_apps_get`                 | Get app details (hosting project, backend, secrets, domains, deployments)                                                                                               |
| `naive_apps_delete`              | Delete an app and all its infrastructure                                                                                                                                |
| `naive_apps_deploy`              | Deploy workspace code (preview)                                                                                                                                         |
| `naive_apps_publish`             | Promote a deployment to production                                                                                                                                      |
| `naive_apps_deployments`         | List deployment history                                                                                                                                                 |
| `naive_apps_retry`               | Re-run failed provisioning                                                                                                                                              |
| `naive_apps_secrets_list`        | List env var keys                                                                                                                                                       |
| `naive_apps_secrets_set`         | Set an env var (`preview` / `production`), synced to the app environment                                                                                                |
| `naive_apps_secrets_delete`      | Delete an env var (removed from the app environment too)                                                                                                                |
| `naive_apps_secrets_reveal`      | Reveal an env var value                                                                                                                                                 |
| `naive_apps_domains_list`        | List app domains                                                                                                                                                        |
| `naive_apps_domains_add`         | Add a custom domain to the app                                                                                                                                          |
| `naive_apps_domains_remove`      | Remove a domain                                                                                                                                                         |
| `naive_apps_domains_set_primary` | Set the primary production domain                                                                                                                                       |
| `naive_apps_connect_domain`      | Connect a company domain as the app's production domain                                                                                                                 |
| `naive_apps_disconnect_domain`   | Disconnect a company domain                                                                                                                                             |
| `naive_apps_verify_domain_dns`   | Verify DNS for a connected company domain                                                                                                                               |
| `naive_apps_db_tables`           | List database tables (fullstack only)                                                                                                                                   |
| `naive_apps_db_query`            | Run a SQL query (fullstack only)                                                                                                                                        |
| `naive_apps_vercel_api`          | Call any hosting REST API operation (scoped to the app's project)                                                                                                       |
| `naive_apps_supabase_api`        | Call any backend management API operation (scoped to the app's project)                                                                                                 |

## Mobile

Cloud mobile emulators/devices via Mobilerun. Provision hosted devices, run natural-language agent tasks, display the live screen, manage an app library, and reach the **entire** Mobilerun API via the `search`/`call` wildcard. Naïve holds the operator key; each tenant only sees its own devices. Every tool takes an optional `user_id` and is gated by the user's AccountKit (`mobile` primitive).

| Tool                       | Description                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `naive_mobile_status`      | Integration status (configured/reachable) + your device count                                                              |
| `naive_mobile_search`      | **Wildcard** — search the Mobilerun API catalog (devices, tasks, apps, proxies, device tools, …) for operationIds          |
| `naive_mobile_call`        | **Wildcard** — call ANY Mobilerun operation by operationId. Mutating ops are **sensitive** (may return `pending_approval`) |
| `naive_mobile_devices`     | List this user's cloud devices with live state                                                                             |
| `naive_mobile_provision`   | Provision a new cloud device — **sensitive**                                                                               |
| `naive_mobile_device`      | Get a device's live details                                                                                                |
| `naive_mobile_stream`      | Get the live stream URL + token to display the screen                                                                      |
| `naive_mobile_reboot`      | Reboot a device — **sensitive**                                                                                            |
| `naive_mobile_reset`       | Reset a device to a fresh state — **sensitive**                                                                            |
| `naive_mobile_terminate`   | Terminate (release) a device — **sensitive**                                                                               |
| `naive_mobile_wait`        | Block until a device is ready                                                                                              |
| `naive_mobile_run`         | Run an agent task with a natural-language instruction — **sensitive**                                                      |
| `naive_mobile_tasks`       | List agent tasks                                                                                                           |
| `naive_mobile_task`        | Get a task's status/result                                                                                                 |
| `naive_mobile_stop`        | Cancel a running task — **sensitive**                                                                                      |
| `naive_mobile_screenshots` | List a task's screenshot URLs                                                                                              |
| `naive_mobile_trajectory`  | Get a task's step-by-step trajectory                                                                                       |
| `naive_mobile_apps`        | List apps (APKs) in the Mobilerun library                                                                                  |
| `naive_mobile_upload_app`  | Create a signed upload URL for an app — **sensitive**                                                                      |

## Compute

Run Docker workloads on managed cloud compute (AWS Fargate/ECS). Workload `type` is `service` (long-running container, optional public URL, scale-to-zero), `job` (run-to-completion batch), or `schedule` (a job on a cron/rate expression).

| Tool                          | Description                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `naive_compute_create`        | Provision a Docker workload (`service` / `job` / `schedule`) — **sensitive** (may return `pending_approval`) |
| `naive_compute_list`          | List the user's compute workloads (type, status, public URL)                                                 |
| `naive_compute_get`           | Get a workload's details (status, public URL, recent runs, secret keys)                                      |
| `naive_compute_destroy`       | Delete a workload and tear down its ECS service/task-def/schedule/ALB route                                  |
| `naive_compute_start`         | Wake a scaled-to-zero service (desired count back to 1)                                                      |
| `naive_compute_stop`          | Scale a service to zero (stops compute billing, keeps the definition)                                        |
| `naive_compute_scale`         | Set a service's running replica count (0 stops it)                                                           |
| `naive_compute_run`           | Trigger a job/schedule run now. Returns a run id; poll `naive_compute_runs` / `naive_compute_logs`           |
| `naive_compute_runs`          | List a workload's runs (status, exit code, credits charged)                                                  |
| `naive_compute_logs`          | Tail CloudWatch logs for a workload (latest or a specific run)                                               |
| `naive_compute_exec`          | Run a one-off command in a running task via ECS Exec — **sensitive**                                         |
| `naive_compute_secret_set`    | Set an encrypted env var injected into the workload's tasks at start                                         |
| `naive_compute_secret_list`   | List a workload's secret keys (values not returned)                                                          |
| `naive_compute_secret_delete` | Delete a workload's secret by key                                                                            |

## Sandbox

Disposable, isolated micro-VM code sandboxes any agent can hold — run commands, move files, expose ports, checkpoint, fork. Billed for **observed usage** (CPU/memory/disk actually used + a one-time creation fee) from credits while running; sleeping and parked sandboxes are free, and running out of credits auto-destroys the sandbox. Every tool takes an optional `user_id` and is gated by the user's AccountKit (`sandbox` primitive).

| Tool                       | Description                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `naive_sandbox_create`     | Create a sandbox (usage-billed; `size` s/m/l ceiling) — **sensitive** (may return `pending_approval`) |
| `naive_sandbox_status`     | Primitive status: configured, your sandbox count, sizes, usage rates                                  |
| `naive_sandbox_list`       | List the user's sandboxes                                                                             |
| `naive_sandbox_get`        | Get a sandbox (status, metered credits)                                                               |
| `naive_sandbox_exec`       | Run a shell command in the sandbox — **sensitive**                                                    |
| `naive_sandbox_write_file` | Write a file into the sandbox (utf-8 or base64)                                                       |
| `naive_sandbox_read_file`  | Read a file from the sandbox                                                                          |
| `naive_sandbox_ls`         | List a directory's entries (`{ name, type }[]`)                                                       |
| `naive_sandbox_mkdir`      | Create a directory and any missing parents (mkdir -p)                                                 |
| `naive_sandbox_rm`         | Remove a file or directory tree (rm -rf; no-op when absent)                                           |
| `naive_sandbox_expose`     | Expose a guest port at a public URL (http or tcp) — **sensitive**                                     |
| `naive_sandbox_unexpose`   | Stop exposing a guest port                                                                            |
| `naive_sandbox_ports`      | List exposed ports + endpoints (doesn't wake the sandbox)                                             |
| `naive_sandbox_checkpoint` | Durable checkpoint of the whole machine (disk + memory + connections)                                 |
| `naive_sandbox_fork`       | Start a NEW sandbox from a checkpoint — **sensitive**                                                 |
| `naive_sandbox_park`       | Checkpoint + stop the sandbox (free; stops the meter)                                                 |
| `naive_sandbox_sleep`      | Idle the sandbox (free; wakes on traffic, exec, or an optional `wake_at`)                             |
| `naive_sandbox_resume`     | Resume a parked or sleeping sandbox (meter restarts)                                                  |
| `naive_sandbox_destroy`    | Destroy the sandbox (stops billing)                                                                   |

## Queue

Durable SQS work queues. Type `standard` (at-least-once, best-effort order) or `fifo` (exactly-once, ordered); optional dead-letter queue for failed messages.

| Tool                     | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `naive_queue_create`     | Create a queue (`standard` / `fifo`, optional `dlq`)                         |
| `naive_queue_list`       | List the user's queues with approximate depth                                |
| `naive_queue_get`        | Get a queue's details + attributes (approximate message / in-flight counts)  |
| `naive_queue_delete`     | Delete a queue (and its dead-letter queue, if any)                           |
| `naive_queue_send`       | Enqueue a message (FIFO requires `group_id`)                                 |
| `naive_queue_receive`    | Long-poll for messages (returns receipt handles — ack each after processing) |
| `naive_queue_ack`        | Delete (acknowledge) a processed message by its receipt handle               |
| `naive_queue_purge`      | Delete all messages in a queue                                               |
| `naive_queue_attributes` | Get a queue's approximate depth / in-flight / delayed counts                 |

## Jobs

| Tool               | Description     |
| ------------------ | --------------- |
| `naive_list_jobs`  | List async jobs |
| `naive_get_job`    | Get job details |
| `naive_cancel_job` | Cancel a job    |

## Status

| Tool           | Description            |
| -------------- | ---------------------- |
| `naive_status` | Agent status + credits |
| `naive_usage`  | Credit usage history   |

## Tool Schemas

### `naive_generate_images`

```json theme={"theme":"css-variables"}
{
  "model": "fal-ai/flux/schnell (optional, default)",
  "input": { "prompt": "required", "image_size": "optional", "num_images": "optional", "seed": "optional" }
}
```

### `naive_stock_search`

```json theme={"theme":"css-variables"}
{
  "query": "required",
  "count": "number (optional, default 10, max 80)",
  "orientation": "landscape | portrait | square (optional)",
  "color": "red | orange | yellow | green | turquoise | blue | violet | pink | brown | black | gray | white (optional)",
  "size": "large | medium | small (optional)"
}
```

### `naive_send_email`

```json theme={"theme":"css-variables"}
{
  "from_inbox": "UUID of inbox to send from (required)",
  "to": "Recipient email address (required)",
  "subject": "Email subject (required)",
  "body": "Email body — plain text or HTML (required)"
}
```

### `naive_web_search`

```json theme={"theme":"css-variables"}
{
  "query": "Search query (required)",
  "count": "Number of results, default 5, max 20 (optional)"
}
```

### `naive_generate_video`

```json theme={"theme":"css-variables"}
{
  "model": "Model ID (required)",
  "input": { "prompt": "required", "duration": "optional", "aspect_ratio": "optional", "image_url": "for image-to-video" }
}
```

## Billing Tools

| Tool                   | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `naive_list_plans`     | List subscription plans with pricing                      |
| `naive_subscribe`      | Create subscription checkout (7-day trial for first-time) |
| `naive_upgrade_plan`   | Upgrade existing subscription                             |
| `naive_billing_status` | Check subscription + credit balance                       |
| `naive_billing_portal` | Get billing portal URL                                    |
| `naive_list_packs`     | List credit top-up packs ($10-$100)                       |
| `naive_topup_credits`  | Buy more credits                                          |

### `naive_social_connect`

```json theme={"theme":"css-variables"}
{
  "platform": "TWITTER | LINKEDIN | INSTAGRAM | FACEBOOK | TIKTOK | YOUTUBE | THREADS | PINTEREST | REDDIT | BLUESKY",
  "redirect_url": "URL the user returns to after connecting (required)"
}
```

### `naive_social_create_post`

```json theme={"theme":"css-variables"}
{
  "content": "Post text content (required)",
  "title": "Post title (optional, auto-generated from content)",
  "platforms": ["TWITTER", "LINKEDIN"],
  "platform_data": { "REDDIT": { "sr": "subreddit", "title": "..." } },
  "media_urls": ["https://example.com/video.mp4"],
  "account_ids": ["uuid (optional, specific accounts to post from)"],
  "youtube_type": "SHORT | VIDEO (optional, default SHORT)",
  "publish_now": "boolean (optional, default false = draft). Costs 2.5 credits (+0.5 if targeting X, +5 if the X post carries a link).",
  "scheduled_at": "ISO 8601 datetime (optional). Same publish pricing."
}
```

### `naive_start_verification`

```json theme={"theme":"css-variables"}
{
  "members": [
    {
      "first_name": "required",
      "last_name": "required",
      "email": "required",
      "phone_number": "optional (E.164)",
      "ownership_percentage": "integer 0-100 (required, must sum to 100)",
      "role": "primary | secondary (required, exactly one primary)",
      "is_responsible_party": "boolean (required, exactly one true)"
    }
  ]
}
```

### `naive_complete_member_verification`

```json theme={"theme":"css-variables"}
{
  "member_id": "UUID of the member (required)",
  "validation_token": "verification validation token from onComplete (required)"
}
```

### `naive_submit_formation`

```json theme={"theme":"css-variables"}
{
  "verification_id": "UUID (required)",
  "entity_type": "llc (required)",
  "state": "US state code, e.g. WY (required)",
  "naics_code_id": "NAICS code ID (required)",
  "description": "Business description (required)",
  "name_options": [{ "name": "Acme", "entity_type_ending": "llc" }]
}
```

## SEO

| Tool                      | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `naive_seo_discover`      | Find the right SEO endpoint using natural language     |
| `naive_seo_execute`       | Execute any SEO endpoint (Live mode — instant results) |
| `naive_seo_execute_async` | Execute any SEO endpoint (Standard mode — async task)  |

Supports Keywords Data (Google, Bing, Trends), Backlinks, and SEO Labs (Google, Bing, Amazon).

## App Data

| Tool                           | Description                                                |
| ------------------------------ | ---------------------------------------------------------- |
| `naive_app_data_discover`      | Find the right App Data endpoint using natural language    |
| `naive_app_data_execute`       | Execute any App Data endpoint (Live mode)                  |
| `naive_app_data_execute_async` | Execute any App Data endpoint (Standard mode — async task) |

Supports Google Play and App Store — app searches, listings, info, and reviews.

## Business Data

| Tool                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `naive_business_discover`       | Find the right Business Data endpoint using natural language        |
| `naive_business_execute`        | Execute any Business Data endpoint (Live mode — instant results)    |
| `naive_business_execute_async`  | Execute any Business Data endpoint (Standard mode — async task)     |
| `naive_business_places_search`  | Search local listings on Google Maps — normalized places, immediate |
| `naive_business_places_reviews` | Read Google Maps reviews for known place ids                        |

Supports Google My Business, Hotels, Reviews, Q\&A, Trustpilot, TripAdvisor, and social media engagement — reputation and local listings, as opposed to the company itself (see Company Data below).

The two `places` tools are a **second provider** (Google Maps) rather than more DataForSEO endpoints: they return normalized `place` and `review` objects instead of the vendor's task envelope, name the provider that answered, and bill 3× what the provider run actually cost. Neither returns contact people, and reviewer identity is never collected — see [Reviews & Listings](/docs/getting-started/business-places).

## People

| Tool                  | Description                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| `naive_people_search` | Find B2B people by title, company, industry, geo or seniority                |
| `naive_people_enrich` | Enrich one identity (LinkedIn URL, or name plus company) into a work profile |
| `naive_people_batch`  | Async batch enrich, up to 1,000 identities                                   |
| `naive_people_task`   | Check a batch task and collect its records                                   |

OPT-IN: every tool here is refused until an AccountKit enables `people`, the same
gate REST callers meet on `/v1/people/*`. B2B only — work details, never a home
address or personal phone, and never for employment, credit, insurance or housing
decisions. Metered on 3× the provider run's real spend; a no-match is billed too, because the
run still happened.

## Company Data

| Tool                        | Description                                                                   |
| --------------------------- | ----------------------------------------------------------------------------- |
| `naive_company_data_search` | Find private companies by industry or geography                               |
| `naive_company_data_enrich` | Enrich a domain or name into firmographics, funding, investors and tech stack |
| `naive_company_data_batch`  | Async batch enrich, up to 1,000 identities                                    |
| `naive_company_data_task`   | Check a batch task and collect its records                                    |

Distinct from Business Data above: this is the company (headcount, funding,
investors, technology), not its reputation. Search filters on industry and geo
only — the search provider returns no funding or headcount fields, so those
thresholds are refused rather than silently ignored.

## Social Data

| Tool                         | Description                                                 |
| ---------------------------- | ----------------------------------------------------------- |
| `naive_social_data_discover` | Search public posts by keyword on Bluesky, Hacker News or X |
| `naive_social_data_collect`  | Fetch known posts by id, optionally with comment threads    |
| `naive_social_data_batch`    | Async read, up to 1,000 posts — the only route to Reddit    |
| `naive_social_data_task`     | Check a collection task and collect its posts               |

READ ONLY, and distinct from the Social tools, which publish to accounts you own.
The five scraped platforms bill 3x real provider spend; Bluesky and Hacker News need no
credential and keep a flat 1 credit (2 with comments) per block of 100 posts.

Reddit is absent from `naive_social_data_discover` and `naive_social_data_collect` on
purpose: a Reddit read takes minutes, so it is reachable only through
`naive_social_data_batch`, in either `discover` or `collect` mode.

## AEO (AI Optimization)

| Tool                      | Description                                            |
| ------------------------- | ------------------------------------------------------ |
| `naive_aeo_discover`      | Find the right AEO endpoint using natural language     |
| `naive_aeo_execute`       | Execute any AEO endpoint (Live mode — instant results) |
| `naive_aeo_execute_async` | Execute any AEO endpoint (Standard mode — async task)  |

Supports LLM Responses (ChatGPT, Claude, Gemini, Perplexity), LLM Scraper, AI Keywords, and LLM Mentions.

## E-commerce

| Tool                            | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| `naive_ecommerce_discover`      | Find the right E-commerce endpoint using natural language    |
| `naive_ecommerce_execute`       | Execute any E-commerce endpoint (Live mode)                  |
| `naive_ecommerce_execute_async` | Execute any E-commerce endpoint (Standard mode — async task) |

Supports Google Shopping and Amazon — product searches, info, sellers, and reviews.

## Cards

| Tool                            | Description                                                   |
| ------------------------------- | ------------------------------------------------------------- |
| `naive_cards_cardholder`        | Get the company's virtual card cardholder                     |
| `naive_cards_create_cardholder` | Create a virtual card cardholder (required for managed cards) |
| `naive_cards_update_cardholder` | Update cardholder details                                     |
| `naive_cards_list`              | List all virtual cards                                        |
| `naive_cards_create`            | Create a virtual card — returns checkout URL for funding      |
| `naive_cards_details`           | Get card credentials (PAN/CVC or redeem code)                 |
| `naive_cards_check_payment`     | Check if funding checkout completed and issue card            |
| `naive_cards_retry_issue`       | Retry issuance for a card that failed after payment           |
| `naive_cards_topup`             | Top up a card's spending limit — returns checkout URL         |
| `naive_cards_refund`            | Refund a failed card's payment                                |
| `naive_cards_cancel`            | Cancel/deactivate a card                                      |
| `naive_cards_assignments`       | List agents assigned to a card                                |
| `naive_cards_assign`            | Assign an agent to a card                                     |
| `naive_cards_unassign`          | Remove an agent's card assignment                             |
| `naive_cards_log_transaction`   | Log a manual spend transaction                                |
| `naive_cards_transactions`      | List card transactions                                        |

### `naive_cards_create`

```json theme={"theme":"css-variables"}
{
  "name": "Marketing Card (required)",
  "spending_limit_cents": 10000,
  "provider": "prepaid_gift | managed_virtual (optional, default prepaid_gift)",
  "agent_id": "optional UUID"
}
```

### `naive_cards_create_cardholder`

```json theme={"theme":"css-variables"}
{
  "first_name": "required",
  "last_name": "required",
  "billing_line1": "required",
  "billing_city": "required",
  "billing_state": "required (2-letter code)",
  "billing_postal_code": "required",
  "dob_day": 15,
  "dob_month": 6,
  "dob_year": 1990,
  "email": "optional",
  "phone": "optional"
}
```

### `naive_cards_topup`

```json theme={"theme":"css-variables"}
{
  "card_id": "UUID of the card (required)",
  "amount_cents": 5000
}
```

## Trading

Link a brokerage account via OAuth and trade stocks, options & crypto. The order `symbol`
decides the market (`AAPL`, `BTC/USD`, `AAPL241213C00250000`).

| Tool                           | Description                                                       |
| ------------------------------ | ----------------------------------------------------------------- |
| `naive_trading_connect`        | Begin the brokerage OAuth flow — returns an authorize URL to open |
| `naive_trading_connections`    | List connected environments (paper/live) and status               |
| `naive_trading_account`        | Get the connected brokerage account (buying power, equity)        |
| `naive_trading_assets`         | List tradable assets (filter by `asset_class`)                    |
| `naive_trading_positions`      | List open positions                                               |
| `naive_trading_position`       | Get one open position by symbol                                   |
| `naive_trading_orders`         | List orders (`open`/`closed`/`all`)                               |
| `naive_trading_get_order`      | Get one order by id                                               |
| `naive_trading_quote`          | Latest quote(s) for symbols                                       |
| `naive_trading_create_order`   | Place an order — **sensitive** (may require approval)             |
| `naive_trading_cancel_order`   | Cancel an open order — **sensitive**                              |
| `naive_trading_close_position` | Close (liquidate) a position — **sensitive**                      |

### `naive_trading_create_order`

```json theme={"theme":"css-variables"}
{
  "symbol": "BTC/USD (required)",
  "side": "buy | sell (required)",
  "notional": "25 (use notional OR qty)",
  "qty": "0.5 (use qty OR notional)",
  "type": "market | limit | stop | stop_limit | trailing_stop (default market)",
  "time_in_force": "day | gtc | opg | cls | ioc | fok (crypto: gtc|ioc)",
  "limit_price": "for limit/stop_limit",
  "env": "paper | live (optional)"
}
```

## Payments

Each agent gets its own crypto wallet (USDC on Base) and pays for x402-paywalled
resources with it. x402 is the HTTP 402 protocol: a paywalled resource answers with
`402 Payment Required` and a `payment-required` header describing what it accepts.

| Tool                      | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `naive_payments_quote`    | Probe an x402 URL for its price — zero side effects, nothing is spent            |
| `naive_payments_pay`      | Pay for and fetch an x402 resource — **sensitive** (spends real USDC)            |
| `naive_payments_receipts` | List this agent's x402 payment receipts (each links a payment to its onchain tx) |
| `naive_wallet_balance`    | Get the agent's crypto wallet balances — read-only                               |

<Info>
  There is **no approval workflow** for payments, and that is deliberate. A payment is
  bounded by the wallet balance, by `perTxMax` (enforced at runtime *and* as a static
  policy inside the custody plane at signing time), and optionally by a rolling
  `dailyBudget`. The wallet's admin verbs (`fund`, `transfer`, `policy`, `sweep`) are
  deliberately **not** MCP tools — they are the operator REST surface only. See
  [Payments](/docs/getting-started/payments).
</Info>

### `naive_payments_quote`

```json theme={"theme":"css-variables"}
{
  "url": "https://api.example.com/report (required)",
  "method": "optional, default GET",
  "headers": { "optional": "request headers" }
}
```

Returns `accepts[].amount` in **atomic** units — USDC has 6 decimals, so `500000` =
0.50 USDC. A non-paywalled resource returns `free: true`.

### `naive_payments_pay`

```json theme={"theme":"css-variables"}
{
  "url": "https://api.example.com/report (required)",
  "max_amount": "'0.10' — optional per-call cap in DECIMAL USDC; effective cap is min(max_amount, wallet perTxMax)",
  "method": "optional, default GET",
  "headers": { "optional": "request headers" }
}
```

Fetches the URL; on a `402` it signs a USDC payment and retries **once**. Returns the
resource body plus a receipt. A non-402 response means no payment was made.

### `naive_payments_receipts`

```json theme={"theme":"css-variables"}
{
  "direction": "buy | sell (optional)",
  "origin": "filter to one resource origin (optional)",
  "since": "ISO-8601, e.g. '2026-07-01T00:00:00Z' (optional)",
  "limit": 50
}
```

### `naive_wallet_balance`

```json theme={"theme":"css-variables"}
{
  "network": "CAIP-2 filter, e.g. 'eip155:8453' (optional)"
}
```
