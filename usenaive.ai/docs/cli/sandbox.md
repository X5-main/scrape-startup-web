> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# sandbox

> naive sandbox — disposable micro-VM code sandboxes, usage billed from your credits.

Disposable, isolated Linux micro-VM sandboxes — run shell commands, read/write files, expose ports, checkpoint, fork, park/sleep & resume. Billed for **observed usage** (CPU, memory, disk actually used + a one-time creation fee) from your credits while running; sleeping and parked sandboxes are free. Scratch-work counterpart to [compute](/docs/cli/compute).

## Create & manage

```bash theme={"theme":"css-variables"}
naive sandbox status                          # configured? your count + sizes + usage rates
naive sandbox create --name scratch --size s  # usage-billed; may require approval
naive sandbox list
naive sandbox show <id>
naive sandbox destroy <id>                    # stops billing (un-checkpointed state is lost)
```

`--size s|m` sets a resource ceiling (1/4 vCPU, up to 16/32 GiB memory, up to 32/128 GiB disk) — you pay for what the sandbox uses, not the ceiling. `--memory <gib>` / `--disk <gib>` override the ceilings within the size's range.

## Run commands & move files

```bash theme={"theme":"css-variables"}
naive sandbox exec <id> "python3 -c 'print(40 + 2)'"     # may require approval
naive sandbox exec <id> "npm test" --cwd /app/repo --timeout 120000

naive sandbox write <id> /app/server.py --file ./server.py
naive sandbox write <id> /app/note.txt --content "hello"
naive sandbox read <id> /app/out.json

naive sandbox ls <id> /app                # list a directory ({ name, type }[])
naive sandbox mkdir <id> /app/data        # mkdir -p
naive sandbox rm <id> /app/tmp            # rm -rf (no-op when absent)
```

## Expose ports

```bash theme={"theme":"css-variables"}
naive sandbox exec <id> "python3 -m http.server 8000 &"
naive sandbox expose <id> 8000            # -> public https URL; may require approval
naive sandbox expose <id> 5432 --protocol tcp
naive sandbox ports <id>                  # list exposed ports (doesn't wake it)
naive sandbox unexpose <id> 8000
```

## Checkpoint & fork

A checkpoint captures the whole machine — disk, memory, and open connections — without stopping it. Fork starts a NEW sandbox from a checkpoint (bills like create; may require approval).

```bash theme={"theme":"css-variables"}
naive sandbox checkpoint <id> --name golden
naive sandbox fork <id> --name variant-b
```

## Park, sleep & resume (free idle)

```bash theme={"theme":"css-variables"}
naive sandbox park <id>     # checkpoint + stop the sandbox (and the meter) until resume
naive sandbox sleep <id>    # idle it — wakes on ingress traffic or the next exec
naive sandbox sleep <id> --wake-at 2026-08-04T09:00:00Z   # schedule a wall-clock wake
naive sandbox resume <id>   # restore; the meter restarts
```

## Billing

The usage meter runs from `create`/`resume` until `park`/`sleep`/`destroy`, charging for observed CPU/memory/disk at the rates shown by `naive sandbox status`, plus a one-time creation fee per size. Running out of credits auto-destroys the sandbox, as does the max-runtime failsafe. Full guide: [/docs/getting-started/sandbox](/docs/getting-started/sandbox).
