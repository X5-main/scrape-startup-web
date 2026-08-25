> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# mobile

> naive mobile — provision, control & display cloud mobile emulators/devices via Mobilerun, run agent tasks, and call any Mobilerun API.

Create and drive cloud mobile phones (emulators/devices) on Mobilerun. Run natural-language agent tasks, display the live screen, manage an app library, and reach Mobilerun's API via a wildcard `search`/`call`. Naïve holds the Mobilerun operator key — your agents never do. **Phones are billed per minute from your credits until terminated — there is no auto-stop.**

## Phones

```bash theme={"theme":"css-variables"}
# Create a phone (default: dedicated_premium_device, the minute-billed cloud phone).
# Provisions immediately; your credits are metered per minute until you terminate.
naive mobile provision --country US          # alias: naive mobile create-phone

naive mobile phones                          # list your phones + status + metered spend (alias: devices)
naive mobile device <device-id>
naive mobile stream <device-id>              # live stream URL + token (to display)
naive mobile wait <device-id>
naive mobile reboot <device-id>
naive mobile reset <device-id>               # wipe to a fresh state
naive mobile terminate <device-id>           # release the phone — STOPS the per-minute meter
```

## Proxy (optional residential IP)

Devices come online on a datacenter IP. Attach a SOCKS5 proxy for a residential / country-specific IP:

```bash theme={"theme":"css-variables"}
naive mobile proxy <device-id>                                        # current attachment
naive mobile proxy-set <device-id> --host <h> --port <p> --user <u> --password <pw>
naive mobile proxy-remove <device-id>                                 # back to the datacenter IP
```

## Agent tasks

```bash theme={"theme":"css-variables"}
naive mobile run "Open Settings and enable dark mode" --device <device-id> --vision --reasoning
naive mobile tasks
naive mobile task <id>
naive mobile screenshots <id>
naive mobile trajectory <id>
naive mobile stop <id>
```

## Apps

```bash theme={"theme":"css-variables"}
naive mobile apps
naive mobile upload-app MyApp --file app.apk
```

## Wildcard — any Mobilerun API

```bash theme={"theme":"css-variables"}
naive mobile search "screenshot"                       # discover operationIds
naive mobile call take-screenshot --path deviceId=<id>
naive mobile call list-proxies
```

`call` substitutes `--path KEY=VALUE` placeholders and forwards `--query KEY=VALUE` and `--body '<json>'`. Device-/task-scoped operations are restricted to your own resources; account-global operations are restricted for tenant sub-users.

## Billing, status & governance

```bash theme={"theme":"css-variables"}
naive mobile status    # configured? reachable? phone counts + upstream device total
```

Phones charge `NAIVE_MOBILE_CREDITS_PER_MINUTE` (default 3) credits per device-minute from creation until `terminate`, and each agent task charges `NAIVE_MOBILE_CREDITS_PER_TASK_STEP` (default 0.4) per step of the budget it requests (`--steps`, default 25) — the meter auto-terminates the device on credit exhaustion or after the max-runtime failsafe. Provisioning, device lifecycle, proxy changes, running/stopping tasks, uploads, and mutating wildcard `call`s are **sensitive** — depending on the user's Account Kit they may require human approval (`status: "pending_approval"`, runs after `naive approvals approve <id>`). Full guide: [/docs/getting-started/mobile](/docs/getting-started/mobile).
