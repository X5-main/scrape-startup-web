> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Phone

> Provision phone numbers and send/receive SMS (Surge) from the CLI

## Commands

| Command                                | Description                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| `naive phone`                          | List phone numbers (default)                                          |
| `naive phone provision`                | Buy a US number + register the carrier campaign                       |
| `naive phone resend-otp`               | Resend the sole-prop brand-verification SMS OTP                       |
| `naive phone status`                   | Show the carrier-registration pipeline (account → campaign → numbers) |
| `naive phone send`                     | Send an outbound SMS (gated until the campaign is approved)           |
| `naive phone messages <id>`            | List received SMS for a phone (newest first)                          |
| `naive phone read <id>`                | Read a received SMS in full                                           |
| `naive phone assign <id>`              | Connect an agent to a phone number                                    |
| `naive phone assignments <id>`         | List agents connected to a phone number                               |
| `naive phone unassign <id> <agent_id>` | Remove an agent connection                                            |
| `naive phone release <id>`             | Release a number back to the provider (stops billing)                 |

## Provision a number

```bash theme={"theme":"css-variables"}
naive phone provision --ein 12-3456789
naive phone provision --ein 12-3456789 --area-code 415
naive phone provision --ein 12-3456789 --area-code 415 --label "Support" --type local
naive phone provision --sole-prop --area-code 415
```

Standard provisioning requires a completed LLC formation and the company EIN (for carrier registration). Sole proprietors can pass `--sole-prop` instead: no LLC/EIN needed, just a passed KYC verification — the brand is registered against the verified individual and Surge texts an SMS OTP to their verified mobile (lower carrier throughput than EIN-registered brands). Returns the new number (live for inbound SMS immediately) and the carrier campaign status. Outbound SMS unlocks automatically when the campaign is approved.

## Resend the brand-verification OTP

```bash theme={"theme":"css-variables"}
naive phone resend-otp
```

Re-sends the sole-proprietor brand-verification SMS OTP if it expired or never arrived. Sole-prop accounts only.

## Check status

```bash theme={"theme":"css-variables"}
naive phone status
```

Shows the Surge account, the 10DLC campaign status, and per-number capabilities — use it to see whether outbound SMS is unlocked.

## Send an SMS

```bash theme={"theme":"css-variables"}
naive phone send --from <phone-id> --to +14155551234 --body "Hello"
```

Returns `compliance_pending` (no charge) if the campaign isn't approved yet. Sending is not approval-gated.

## Read received SMS

```bash theme={"theme":"css-variables"}
naive phone messages <phone-id>
naive phone messages <phone-id> --limit 50
naive phone messages <phone-id> --cursor 2026-05-01T00:00:00.000Z

naive phone read <message-id>
```

## Agent assignment

```bash theme={"theme":"css-variables"}
naive phone assign <phone-id> --agent-id <agent-uuid>
naive phone assign <phone-id> --agent-id <agent-uuid> --permissions send_sms,receive_sms
naive phone assignments <phone-id>
naive phone unassign <phone-id> <agent-uuid>
```

## Release a number

```bash theme={"theme":"css-variables"}
naive phone release <phone-id>
```

Releases the number back to the provider, removes agent connections, and stops monthly rental billing. Permanent.

## Governance

Provisioning a number is **sensitive** (it spends credits and registers a carrier campaign). Depending on the user's Account Kit it may require human approval — the command then returns `status: "pending_approval"` and runs only after `naive approvals approve <id>`. Sending SMS is **not** approval-gated. See `naive approvals --help`.
