> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Sandbox API Reference

> All Sandbox REST endpoints — disposable micro-VM code sandboxes: create, exec, files, ports, checkpoint, fork, park/sleep, resume, destroy.

## Overview

Per-user; requires `Authorization: Bearer nv_sk_…`. Each sandbox is an isolated
Linux micro-VM owned by one tenant — Naïve holds the compute vendor account, so
your agents never hold a vendor key.

Routes are available both company-scoped (`/v1/sandboxes/...`, acting as the
account's default agent profile) and per-user (`/v1/users/:user_id/sandboxes/...`).
Gated by the `sandbox` primitive in the user's AccountKit. **Create, fork, exec, and
expose are approval-gated by default** and may return `202 { status: "pending_approval" }`.

## Endpoints

| Method | Path                             | Description                                                                  |
| ------ | -------------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/v1/sandboxes/status`           | Primitive status: configured, your count, sizes, usage rates                 |
| GET    | `/v1/sandboxes`                  | List the user's sandboxes                                                    |
| POST   | `/v1/sandboxes`                  | Create a sandbox (`{ name?, size?, memory_gib?, disk_gib? }`) — usage-billed |
| GET    | `/v1/sandboxes/:id`              | Get a sandbox + metered credits                                              |
| DELETE | `/v1/sandboxes/:id`              | Destroy the sandbox (stops billing)                                          |
| POST   | `/v1/sandboxes/:id/exec`         | Run a shell command (`{ command, cwd?, env?, timeout_ms? }`)                 |
| POST   | `/v1/sandboxes/:id/files`        | Write a file (`{ path, content, encoding? }`)                                |
| GET    | `/v1/sandboxes/:id/files`        | Read a file (`?path=&encoding=`)                                             |
| GET    | `/v1/sandboxes/:id/files/ls`     | List a directory (`?path=`) — `{ name, type }[]`                             |
| POST   | `/v1/sandboxes/:id/files/mkdir`  | Create a directory + missing parents (`{ path }`)                            |
| DELETE | `/v1/sandboxes/:id/files`        | Remove a file or directory tree (`?path=`)                                   |
| POST   | `/v1/sandboxes/:id/expose`       | Expose a guest port publicly (`{ port, protocol? }`) — **sensitive**         |
| DELETE | `/v1/sandboxes/:id/expose/:port` | Stop exposing a guest port                                                   |
| GET    | `/v1/sandboxes/:id/expose`       | List exposed ports + endpoints (doesn't wake it)                             |
| POST   | `/v1/sandboxes/:id/checkpoints`  | Durable checkpoint (disk + memory + connections)                             |
| POST   | `/v1/sandboxes/:id/fork`         | New sandbox from a checkpoint (`{ name?, checkpoint_id? }`)                  |
| POST   | `/v1/sandboxes/:id/park`         | Checkpoint + stop the sandbox (free while parked)                            |
| POST   | `/v1/sandboxes/:id/sleep`        | Idle the sandbox (free; wakes on traffic, exec, or `{ wake_at? }`)           |
| POST   | `/v1/sandboxes/:id/resume`       | Resume a parked/sleeping sandbox (meter restarts)                            |

## Create & run

```bash theme={"theme":"css-variables"}
# Create (may return 202 pending_approval)
curl -X POST https://api.usenaive.ai/v1/sandboxes \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "name": "scratch", "size": "s" }'

# Exec
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/exec \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "command": "python3 -c \"print(40 + 2)\"" }'
# → { "exit_code": 0, "stdout": "42\n", "stderr": "" }

# Serve something from inside the sandbox
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/expose \
  -H "Authorization: Bearer $NAIVE_KEY" -H "Content-Type: application/json" \
  -d '{ "port": 8000 }'
# → { "port": 8000, "protocol": "http", "url": "https://…" }

# Checkpoint, fork, park / sleep / resume, destroy
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/checkpoints -H "Authorization: Bearer $NAIVE_KEY"
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/fork -H "Authorization: Bearer $NAIVE_KEY"
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/park -H "Authorization: Bearer $NAIVE_KEY"
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/sleep -H "Authorization: Bearer $NAIVE_KEY"
curl -X POST https://api.usenaive.ai/v1/sandboxes/<id>/resume -H "Authorization: Bearer $NAIVE_KEY"
curl -X DELETE https://api.usenaive.ai/v1/sandboxes/<id> -H "Authorization: Bearer $NAIVE_KEY"
```

## Billing

Running sandboxes are metered on **observed usage** in credits — the CPU, memory,
and disk actually used, at the per-hour rates returned from `status`, plus a
one-time creation fee per size (`s`/`m` set ceilings of 1/4 vCPU, up to
16/32/64 GiB memory, up to 32/128/256 GiB disk). Sleeping and parked sandboxes
are free. Running out of credits auto-destroys the sandbox, as does the
max-runtime failsafe; the record keeps the reason in `error`. Every read is
ownership-guarded — another tenant's sandbox id returns a 404. See the
[Sandbox guide](/docs/getting-started/sandbox).
