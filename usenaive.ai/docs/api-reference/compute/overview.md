> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Compute API Reference

> All Compute REST endpoints — run Docker workloads on managed cloud compute: services, jobs, schedules, runs, logs, shell, and secrets.

## Overview

Per-user; requires `Authorization: Bearer nv_sk_…`. Naïve owns the cluster and
the cloud credentials — your agents never hold a cloud key. A workload has one of
three `type`s: `service` (long-running, optional public URL, scale-to-zero),
`job` (run-to-completion), or `schedule` (cron/rate — runs the image on a
cadence).

Routes are available both company-scoped (`/v1/compute/...`, acting as the
account's default agent profile) and per-user (`/v1/users/:user_id/compute/...`). Gated
by the `compute` primitive in the user's AccountKit. Billed by running time
(vCPU-seconds + GB-seconds) in credits; a stopped service accrues \~nothing.

<Note>
  `POST /v1/compute` (create) and `POST /v1/compute/:id/exec` + `POST /v1/compute/:id/shell`
  are approval-gated by default. An agent (API-key) call may return
  `202 { "status": "pending_approval", "approval_id" }`; a human approves it via
  [Approvals](/docs/api-reference/approvals/overview) and the action runs on replay.
</Note>

## Endpoints

| Method | Path                                  | Description                                                            |
| ------ | ------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/v1/compute`                         | List the user's workloads                                              |
| POST   | `/v1/compute`                         | Create a workload (`type`: service \| job \| schedule) — **sensitive** |
| GET    | `/v1/compute/:id`                     | Get a workload (status, public URL, recent runs, secret keys)          |
| DELETE | `/v1/compute/:id`                     | Delete a workload + stop in-flight runs                                |
| POST   | `/v1/compute/:id/start`               | Wake a scaled-to-zero service                                          |
| POST   | `/v1/compute/:id/stop`                | Scale a service to zero                                                |
| POST   | `/v1/compute/:id/scale`               | Set the replica count (`{ count }`)                                    |
| POST   | `/v1/compute/:id/run`                 | Trigger a job/schedule run now                                         |
| GET    | `/v1/compute/:id/runs`                | List runs (status, exit code, credits)                                 |
| GET    | `/v1/compute/:id/runs/:runId/logs`    | Logs for a run                                                         |
| GET    | `/v1/compute/:id/logs`                | Logs for the latest run / live service task                            |
| POST   | `/v1/compute/:id/exec`                | One-off command in a running task — **sensitive**                      |
| POST   | `/v1/compute/:id/shell`               | Broker an interactive shell session — **sensitive**                    |
| GET    | `/v1/compute/:id/secrets`             | List secret keys                                                       |
| POST   | `/v1/compute/:id/secrets`             | Set an encrypted env var (auto-redeploys)                              |
| DELETE | `/v1/compute/:id/secrets/:key`        | Delete a secret                                                        |
| GET    | `/v1/compute/:id/secrets/:key/reveal` | Reveal a secret value                                                  |

## Create body

```json theme={"theme":"css-variables"}
{
  "name": "bot",
  "type": "service",
  "image": "ghcr.io/me/bot:latest",
  "command": ["node", "server.js"],
  "cpu": 256,
  "memory": 512,
  "port": 8080,
  "env": { "LOG_LEVEL": "info" },
  "schedule_expr": "cron(0 9 * * ? *)"
}
```

`port` (services) exposes a public URL via the compute ALB. If the ALB is not
configured (`NAIVE_COMPUTE_ALB_LISTENER_ARN` / `NAIVE_COMPUTE_VPC_ID`), create
with `port` returns `feature_not_configured` (501) — omit `port` for a headless
service. `schedule_expr` is required for `type: "schedule"`. The image must
contain `/bin/sh` to support `exec`/`shell`.

## Shell sessions

`POST /v1/compute/:id/shell` returns a short-lived, task-scoped exec session —
`{ session: { sessionId, streamUrl, tokenValue }, region }`. The client connects
the WebSocket directly to `streamUrl` with `tokenValue` (the CLI's
`naive compute ssh` does this via the `session-manager-plugin`). No cloud
credentials are returned to the client. Sessions are transcript-logged.

See the [Compute guide](/docs/getting-started/compute) and the [SDK sub-client](/docs/sdk/sub-clients/compute).
