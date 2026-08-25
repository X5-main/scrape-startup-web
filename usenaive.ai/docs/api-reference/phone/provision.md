> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Provision Number

> Buy a US phone number and register the 10DLC carrier campaign

Provisions a US phone number via Surge and registers the carrier (10DLC) campaign. The default `standard` tier requires a completed LLC formation for the subject; the `sole_proprietor` tier instead requires a passed KYC verification (see below). Returns `202` — the number is live for inbound SMS immediately; outbound SMS unlocks when the campaign is approved.

### Request Body

| Parameter   | Type   | Required | Description                                                                                                                                                                                    |
| ----------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ein`       | string | Yes\*    | Company EIN / tax id (9 digits, e.g. `"12-3456789"`). \*Required when this is the account's first number at the `standard` tier (registers the carrier brand). Not used for `sole_proprietor`. |
| `tier`      | string | No       | `standard` (default, formation + EIN) or `sole_proprietor` (passed KYC, no LLC/EIN — brand verified via SMS OTP).                                                                              |
| `area_code` | string | No       | Preferred US area code (3 digits, e.g. `"415"`)                                                                                                                                                |
| `type`      | string | No       | `local` (default) or `toll_free`                                                                                                                                                               |
| `label`     | string | No       | Friendly label for the number                                                                                                                                                                  |
| `agent_id`  | string | No       | Agent UUID to connect to the number on creation                                                                                                                                                |

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/phone/provision \
    -H "Authorization: Bearer nv_sk_live_..." \
    -H "Content-Type: application/json" \
    -d '{ "ein": "12-3456789", "area_code": "415", "label": "Support" }'
  ```
</RequestExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
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
</ResponseExample>

## Sole-proprietor tier

Sole proprietors can provision a number **without an LLC or EIN** by passing `tier: "sole_proprietor"`. Requirements and behavior:

* A KYC member with status `pass` (Footprint verification) scoped to the subject — the carrier brand is registered against the verified individual.
* Surge texts an **SMS OTP** to the member's verified mobile number for brand identity verification; the response includes `"brand_verification": "pending_otp"`. Re-send it with [`POST /v1/phone/brand-verification/resend`](/docs/api-reference/phone/resend-verification).
* Sole-proprietor brands have **lower carrier throughput** than EIN-registered brands.

```bash theme={"theme":"css-variables"}
curl -X POST https://api.usenaive.ai/v1/phone/provision \
  -H "Authorization: Bearer nv_sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{ "tier": "sole_proprietor", "area_code": "415" }'
```

## CLI

```bash theme={"theme":"css-variables"}
naive phone provision --ein 12-3456789 --area-code 415 --label "Support"
naive phone provision --sole-prop --area-code 415
```

## MCP

Tool: `naive_phone_provision`

```json theme={"theme":"css-variables"}
{ "ein": "12-3456789", "area_code": "415", "type": "local", "label": "Support" }
```

<Note>
  **May require approval.** If the user's Account Kit gates `phone.provision`, an
  agent (API-key) call returns `202 { "status": "pending_approval", "approval_id" }`
  instead of provisioning. A human approves it via
  [Approvals](/docs/api-reference/approvals/overview); the number is then provisioned on
  replay. See [Approvals](/docs/getting-started/approvals).
</Note>
