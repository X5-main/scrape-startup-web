> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Mobile API Reference

> All Mobile REST endpoints — cloud mobile emulators/devices via Mobilerun: devices, live stream, agent tasks, apps, plus a wildcard search/call wrapper for the entire Mobilerun API.

## Overview

Per-user; requires `Authorization: Bearer nv_sk_…`. Naïve owns the Mobilerun
operator key — your agents never hold one. Each tenant is isolated by Naïve: every
phone and task is recorded against `(company, user)`, and all list/by-id
operations (including the wildcard `call` for device/task-scoped paths) are
scoped to the caller (404 cross-tenant).

**Billing:** phones are **billed per minute from your credits**
(`NAIVE_MOBILE_CREDITS_PER_MINUTE`, default **3 credits/device-minute**) and agent
tasks are **billed per step taken** (`NAIVE_MOBILE_CREDITS_PER_TASK_STEP`,
default **0.4 credits/step**; the `steps` budget, default 25, is reserved then
reconciled) — the only funding models.
`POST /v1/mobile/devices` provisions the device immediately and the meter runs
until `DELETE /v1/mobile/devices/:id` — **there is no upstream auto-stop**
(credit exhaustion or max-runtime auto-terminates the device). Phones default
to `dedicated_premium_device` (the minute-billed cloud phone).

Routes are available both company-scoped (`/v1/mobile/...`, acting as the
operator's default user) and per-user (`/v1/users/:user_id/mobile/...`). Gated by
the `mobile` primitive in the user's AccountKit. Mobilerun usage is billed in credits.

<Note>
  `POST /v1/mobile/devices` (provision), the device lifecycle routes, `POST /v1/mobile/tasks` (run),
  `POST /v1/mobile/tasks/:id/stop`, `POST /v1/mobile/apps` (upload), and a mutating
  `POST /v1/mobile/call` are approval-gated by default. An agent (API-key) call may
  return `202 { "status": "pending_approval", "approval_id" }`; a human approves it via
  [Approvals](/docs/api-reference/approvals/overview) and the action runs on replay.
</Note>

## Endpoints

| Method | Path                               | Description                                                                                                                                                                                                                                                                  |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/mobile/status`                | Integration status (configured/reachable) + your device count                                                                                                                                                                                                                |
| GET    | `/v1/mobile/methods`               | **Wildcard** — search the Mobilerun API catalog (`?q=`, `?tag=`)                                                                                                                                                                                                             |
| POST   | `/v1/mobile/call`                  | **Wildcard** — execute any operation (`{ operation_id, path?, query?, body? }`) — **sensitive (non-GET)**                                                                                                                                                                    |
| GET    | `/v1/mobile/devices`               | List this tenant's devices (`?state&type&country&page&page_size`)                                                                                                                                                                                                            |
| POST   | `/v1/mobile/devices`               | Create a phone (`{ type?, country?, profile_id?, name? }`) — provisions immediately, metered per minute from credits — **sensitive**                                                                                                                                         |
| GET    | `/v1/mobile/devices/:id`           | Get a device's live details                                                                                                                                                                                                                                                  |
| GET    | `/v1/mobile/devices/:id/stream`    | Get `{ stream_url, stream_token, stream_protocol, console_url }` for live display                                                                                                                                                                                            |
| POST   | `/v1/mobile/devices/:id/reboot`    | Reboot a device — **sensitive**                                                                                                                                                                                                                                              |
| POST   | `/v1/mobile/devices/:id/reset`     | Reset a device to a fresh state — **sensitive**                                                                                                                                                                                                                              |
| DELETE | `/v1/mobile/devices/:id`           | Terminate (release) a device — **stops the per-minute meter** — **sensitive**                                                                                                                                                                                                |
| POST   | `/v1/mobile/devices/:id/wait`      | Block until ready (`{ timeout_seconds? }`)                                                                                                                                                                                                                                   |
| GET    | `/v1/mobile/devices/:id/proxy`     | Current proxy attachment (datacenter IP by default)                                                                                                                                                                                                                          |
| POST   | `/v1/mobile/devices/:id/proxy`     | Attach a SOCKS5 proxy (`{ host, port, user?, password?, smart_ip? }`) — free with your own proxy; `smart_ip: true` (Mobilerun Connect) is rejected unless the operator enabled it and meters **+2 credits/device-minute** while attached — **sensitive**                     |
| DELETE | `/v1/mobile/devices/:id/proxy`     | Detach the proxy — **sensitive**                                                                                                                                                                                                                                             |
| GET    | `/v1/mobile/tasks`                 | List agent tasks (`?device_id&status`)                                                                                                                                                                                                                                       |
| POST   | `/v1/mobile/tasks`                 | Run an agent task on one of your active phones (`{ task, device_id (required), model?, vision?, reasoning?, steps? }`) — reserves 0.4 credits per step of the requested budget (`steps`, default 25) on dispatch, refunding every step the task doesn't take — **sensitive** |
| GET    | `/v1/mobile/tasks/:id`             | Get a task (status/result)                                                                                                                                                                                                                                                   |
| POST   | `/v1/mobile/tasks/:id/stop`        | Cancel a running task — **sensitive**                                                                                                                                                                                                                                        |
| GET    | `/v1/mobile/tasks/:id/screenshots` | List a task's screenshot URLs                                                                                                                                                                                                                                                |
| GET    | `/v1/mobile/tasks/:id/trajectory`  | Get a task's step-by-step trajectory                                                                                                                                                                                                                                         |
| GET    | `/v1/mobile/apps`                  | List apps (APKs) in the Mobilerun library                                                                                                                                                                                                                                    |
| POST   | `/v1/mobile/apps`                  | Create a signed upload URL for an app (`{ name, file_name? }`) — **sensitive**                                                                                                                                                                                               |

## Wildcard search / call

`GET /v1/mobile/methods` returns Mobilerun's API tags plus matching operations:

```json theme={"theme":"css-variables"}
{
  "tags": ["Devices", "Tasks", "Tools", "Proxies", "Apps", "..."],
  "methods": [
    { "operationId": "take-screenshot", "method": "GET", "path": "/devices/{deviceId}/screenshot", "tag": "Tools", "pathParams": ["deviceId"], "queryParams": [] }
  ]
}
```

`POST /v1/mobile/call` executes one by id, substituting `path` params and forwarding `query`/`body`:

```json theme={"theme":"css-variables"}
{ "operation_id": "take-screenshot", "path": { "deviceId": "…" } }
```

Read operations execute immediately; mutating ones are approval-gated. Any
`{deviceId}` or `{task_id}` path is verified to belong to the calling tenant.
Account-global operations (no device/task in the path — proxies, credentials,
secrets, flows, and the unscoped device/task lists) are refused for tenant
sub-users by default; the operator's own default user can always call them, and
`MOBILERUN_ALLOW_GLOBAL_CALLS` opens them for everyone. Use the curated
`devices`/`tasks`/`apps` methods for scoped list/create flows.

See the [Mobile guide](/docs/getting-started/mobile) and the [SDK sub-client](/docs/sdk/sub-clients/mobile).
