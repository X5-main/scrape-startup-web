> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# compute

> naive compute — run Docker containers, background workers, and scheduled jobs on managed cloud compute.

Run agent-owned Docker workloads on managed cloud compute. Three types: `service` (long-running, optional public URL, scale-to-zero), `job` (run-to-completion), and `schedule` (cron-for-code). Billed by the second; a stopped service costs \~nothing.

## Create & manage

```bash theme={"theme":"css-variables"}
# Long-running service (optionally expose a public URL with --port)
naive compute create --name bot --type service --image ghcr.io/me/bot:latest --port 8080

# One-off job, and a cron-for-code schedule
naive compute create --name ingest --type job --image me/etl:latest --command "python ingest.py"
naive compute create --name ingest --type job --image me/etl:latest --command python ingest.py   # unquoted is fine too
naive compute create --name nightly --type schedule --image me/etl:latest --schedule "cron(0 9 * * ? *)"
```

`--command` is variadic: quoted or unquoted, the words become the container argv.

<Warning>
  `--port` requires the compute load balancer. Where it is not configured, create
  with `--port` fails with `feature_not_configured` (501) rather than quietly
  producing a service with no public URL. Omit `--port` for a headless service.
</Warning>

```bash theme={"theme":"css-variables"}
naive compute list
naive compute show <id>
naive compute delete <id>
```

## Lifecycle, runs & logs

```bash theme={"theme":"css-variables"}
naive compute run <id>                 # trigger a job/schedule now
naive compute runs <id>
naive compute logs <id> --limit 200
naive compute start <id>               # wake a scaled-to-zero service
naive compute stop <id>                # scale a service to zero
naive compute scale <id> 3
```

## Secrets

```bash theme={"theme":"css-variables"}
# Encrypted env vars injected into tasks (saving auto-redeploys the workload)
naive compute secret set <id> OPENAI_API_KEY sk-...
naive compute secret list <id>
naive compute secret delete <id> OPENAI_API_KEY
```

## Interactive shell

```bash theme={"theme":"css-variables"}
naive compute exec <id> "ls -la"       # one-off command
naive compute ssh <id>                 # interactive shell
```

`ssh` opens an interactive shell into a running container over a managed exec channel — no port 22, no SSH keys, no inbound access. It requires the `session-manager-plugin` installed locally, and the image must contain `/bin/sh`.

## Governance

Creating a workload and `exec`/`ssh` are **sensitive** — depending on the user's Account Kit they may require human approval (the command returns `status: "pending_approval"` and runs after `naive approvals approve <id>`). Pair compute with [`naive queue`](/docs/cli/queue) for a worker pipeline. Full guide: [/docs/getting-started/compute](/docs/getting-started/compute).
