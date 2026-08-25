> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Phone Numbers & SMS

> Provision US phone numbers and send/receive SMS via Surge — carrier-registered (10DLC), with inbound webhooks and agent assignment.

The phone primitive gives your agents a real US phone number that can send and receive SMS. Numbers are provisioned through [Surge](https://docs.surge.app) and automatically registered with the carriers (10DLC) so messages actually deliver.

Inbound SMS works the moment a number is provisioned. **Outbound** SMS is gated by carrier approval of the messaging campaign — this happens automatically (typically 1-2 business days) and unlocks sending with no further action.

## CLI First

```bash theme={"theme":"css-variables"}
# Provision a US number + register the carrier campaign
naive phone provision --area-code 415 --label "Support"

# Watch the carrier-registration pipeline
naive phone status

# Once the campaign is approved, send SMS
naive phone send --from <phone-id> --to +14155551234 --body "Hello from my agent"

# Read what people text back
naive phone messages <phone-id>
```

## Prerequisites

At the default `standard` tier, provisioning a number requires a completed **LLC formation** and the company's **EIN** — numbers are carrier-registered against your business entity, and the EIN is required for the carrier (10DLC) brand registration. The full chain is:

<Steps>
  <Step title="Verify identity (KYC)">
    `naive verification start` — verify the company's members.
  </Step>

  <Step title="Form the company">
    `naive formation submit` — form the LLC (Surge registers the number against this business).
  </Step>

  <Step title="Provision the number">
    `naive phone provision --ein 12-3456789` — buys the number and submits the carrier campaign.
  </Step>
</Steps>

<Info>
  The EIN is required the first time you provision (it registers the carrier brand). Provide it as 9 digits, with or without the hyphen (e.g. `12-3456789`).
</Info>

### Sole proprietors (no LLC required)

If you operate as a **sole proprietor**, you can skip formation entirely: pass `tier: "sole_proprietor"` (CLI: `--sole-prop`) and the carrier brand is registered against the KYC-verified individual instead of a business entity.

* Requires a KYC member with status `pass` (`naive verification start`) — no formation, no EIN.
* Surge texts an **SMS OTP** to the member's verified mobile number for brand identity verification; the provision response includes `"brand_verification": "pending_otp"`. Resend it with `naive phone resend-otp` (`POST /v1/phone/brand-verification/resend`).
* Sole-proprietor brands have **lower carrier throughput** than EIN-registered brands — fine for notifications and 2FA-style volumes, not bulk campaigns.

```bash theme={"theme":"css-variables"}
naive phone provision --sole-prop --area-code 415
naive phone resend-otp   # if the verification text didn't arrive
```

## How SMS gating works

| Capability       | When it works                                                    |
| ---------------- | ---------------------------------------------------------------- |
| **Voice**        | Out of scope for this primitive                                  |
| **Inbound SMS**  | Immediately on provisioning — no carrier gate                    |
| **Outbound SMS** | After the 10DLC campaign is approved (auto, \~1-2 business days) |

Attempting `naive phone send` before the campaign is approved returns `compliance_pending` — **no message is sent and no credit is charged**. The campaign auto-activates via a Surge webhook; check progress with `naive phone status`.

## Provisioning a number

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/phone/provision \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "ein": "12-3456789", "area_code": "415", "label": "Support" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";
  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });

  const res = await naive.phone.provision({ ein: "12-3456789", area_code: "415", label: "Support" });
  // res.phone.e164, res.campaign.status
  ```
</CodeGroup>

**Response (`202`):**

```json theme={"theme":"css-variables"}
{
  "phone": {
    "id": "phone-uuid",
    "e164": "+14155551234",
    "type": "local",
    "capabilities": { "voice": false, "sms_inbound": true, "sms_outbound": false, "mms": false },
    "status": "active"
  },
  "campaign": { "id": "campaign-uuid", "status": "created", "eta": "1-2 business days" },
  "credits_used": 500,
  "credits_remaining": 9500
}
```

## Sending SMS

```bash theme={"theme":"css-variables"}
naive phone send --from <phone-id> --to +14155551234 --body "Your order shipped!"
```

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/phone/<phone-id>/sms \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "to": "+14155551234", "body": "Your order shipped!" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  await naive.phone.send({ from: phoneId, to: "+14155551234", body: "Your order shipped!" });
  ```
</CodeGroup>

## Receiving SMS

Inbound texts are captured automatically (Surge `message.received` webhook) and stored against the receiving number. List and read them:

```bash theme={"theme":"css-variables"}
naive phone messages <phone-id>          # newest first, cursor-paginated
naive phone read <message-id>            # full body + any media URLs
```

You can also subscribe to the `sms.received` [webhook event](/docs/getting-started/webhooks) to react in real time.

## Agent assignment

Like cards and email, a phone number is a company resource that agents connect to with permissions (`send_sms`, `receive_sms`):

```bash theme={"theme":"css-variables"}
naive phone assign <phone-id> --agent-id <agent-uuid>
naive phone assignments <phone-id>
naive phone unassign <phone-id> <agent-uuid>
```

An agent without `send_sms` on a number is refused with `forbidden` when it tries to send.

## Campaign statuses

| Status      | Meaning                                         |
| ----------- | ----------------------------------------------- |
| `created`   | Campaign submitted, not yet in review           |
| `in_review` | Under carrier review                            |
| `active`    | Approved — outbound SMS unlocked                |
| `rejected`  | Carrier rejected the campaign (contact support) |

## Releasing a number

Release a number back to the provider when you no longer need it — this is permanent and **stops further rental billing**:

```bash theme={"theme":"css-variables"}
naive phone release <phone-id>
```

```javascript JavaScript theme={"theme":"css-variables"}
await naive.phone.release(phoneId);
```

## Pricing

| Action                                                                    | Credits |
| ------------------------------------------------------------------------- | ------- |
| Provision your first number (one-time carrier registration + first month) | \~1023  |
| Provision an additional local number (first month)                        | \~23    |
| Monthly local number rental (recurring, per number)                       | \~23    |
| Monthly toll-free number rental (recurring, per number)                   | \~43    |
| Outbound SMS (per 160-char segment)                                       | \~0.516 |
| Inbound SMS (received)                                                    | Free    |

<Info>
  Approval gating: provisioning a number is **approval-gated by default** (it spends credits and registers a carrier campaign) and can be toggled per Account Kit. Sending SMS is **not** approval-gated — it's a routine action like sending email.
</Info>

## Error handling

| Error                          | Cause                                                     | Recovery                                                                                 |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `invalid_input` (no formation) | No completed LLC formation for this user                  | Run `naive formation submit` first, or provision with `--sole-prop` (passed KYC, no LLC) |
| `invalid_input` (EIN required) | No EIN provided on the first standard-tier provision      | Pass `--ein <ein>` (9 digits), or use `--sole-prop`                                      |
| `invalid_input` (KYC required) | `--sole-prop` without a passed KYC verification           | Run `naive verification start` first                                                     |
| `compliance_pending`           | Outbound SMS attempted before campaign approval           | Wait for approval (auto) — retry after `naive phone status` shows `active`               |
| `forbidden`                    | Agent lacks `send_sms` on the number                      | Assign the agent with `naive phone assign`                                               |
| `feature_not_configured`       | Phone provider not enabled on this environment            | Contact support / set `SURGE_ENABLED`                                                    |
| `resource_not_found`           | Phone/message id doesn't exist or belongs to another user | Use `naive phone list` for valid ids                                                     |

## See also

* [Introducing /phone](https://usenaive.ai/blog/introducing-phone) — primitive overview
* [How agents receive 2FA codes](https://usenaive.ai/blog/how-agents-receive-2fa-codes-with-a-phone-number) — inbound SMS for portal login
* [Build an agentic no-API operator](https://usenaive.ai/blog/how-to-build-an-agentic-no-api-operator) — browser + phone for legacy portals
* [Introducing /browser](https://usenaive.ai/blog/introducing-browser) — governed browser sessions
