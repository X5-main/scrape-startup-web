> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Phone Overview

> Phone numbers + SMS endpoints (Surge-backed, carrier-registered).

The phone primitive provisions US phone numbers and sends/receives SMS via [Surge](https://docs.surge.app). Numbers are carrier-registered (10DLC) automatically; inbound SMS works immediately while outbound SMS unlocks when the campaign is approved. Brands register at the `standard` tier (LLC formation + EIN) or the `sole_proprietor` tier (passed KYC, no LLC/EIN — verified via SMS OTP, lower carrier throughput).

All endpoints are available company-level (`/v1/phone/...`) and per-user (`/v1/users/:user_id/phone/...`). They are gated by the `phone` primitive in the subject's AccountKit.

## Endpoints

| Method & Path                              | Description                                                  |
| ------------------------------------------ | ------------------------------------------------------------ |
| `POST /v1/phone/provision`                 | Buy a US number + register the carrier campaign              |
| `POST /v1/phone/brand-verification/resend` | Resend the sole-proprietor brand-verification SMS OTP        |
| `GET /v1/phone`                            | List phone numbers (optional `?agent=<id>`)                  |
| `GET /v1/phone/status`                     | The account → campaign → numbers pipeline                    |
| `GET /v1/phone/:id`                        | Get a single phone number                                    |
| `DELETE /v1/phone/:id`                     | Release the number back to the provider (stops billing)      |
| `POST /v1/phone/:id/sms`                   | Send an outbound SMS (carrier-gated until campaign approval) |
| `GET /v1/phone/:id/messages`               | List received SMS (newest first, cursor-paginated)           |
| `GET /v1/phone/messages/:id`               | Read a single received SMS                                   |
| `GET /v1/phone/:id/campaign`               | The carrier-registration campaign for a number               |
| `GET /v1/phone/:id/assignments`            | List agents connected to a number                            |
| `POST /v1/phone/:id/assign`                | Connect an agent (permissions: `send_sms`, `receive_sms`)    |
| `DELETE /v1/phone/:id/assign/:agentId`     | Disconnect an agent                                          |

## Capabilities object

Every phone row carries a `capabilities` object reflecting carrier-side state:

```json theme={"theme":"css-variables"}
{ "voice": false, "sms_inbound": true, "sms_outbound": false, "mms": false }
```

`sms_outbound` flips to `true` automatically when the carrier campaign is approved.

## Billing & gating

Provisioning a number charges a one-time carrier registration (first number only) plus the first month's rental, and is **approval-gated by default**. Monthly rental recurs per number until released (`DELETE /v1/phone/:id`). Outbound SMS is billed per 160-char segment and is **not** approval-gated. Receiving SMS is free. See [the guide](/docs/getting-started/phone#pricing) for credit amounts.

## Inbound webhook

Surge delivers inbound events (`message.received`, `campaign.approved`, …) to `POST /webhooks/surge`, verified with the `Surge-Signature` HMAC-SHA256 header. Received texts are stored and also fan out to your per-user `sms.received` [webhook subscriptions](/docs/api-reference/webhooks/overview).
