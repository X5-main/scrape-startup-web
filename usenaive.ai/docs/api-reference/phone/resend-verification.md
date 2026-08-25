> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Resend Brand Verification OTP

> Resend the sole-proprietor brand-verification SMS OTP

Re-enqueues the SMS OTP Surge sends to the KYC member's verified mobile number for sole-proprietor brand identity verification — use it when the original code expired or never arrived. Only applies to accounts provisioned with `tier: "sole_proprietor"`; standard (EIN-registered) brands are verified against IRS records and have no OTP step.

### Request Body

None.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/phone/brand-verification/resend \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 202 theme={"theme":"css-variables"}
  {
    "status": "enqueued",
    "brand_verification": "pending_otp",
    "hint": "A new verification code was texted to the verified mobile number. Reply to it to complete brand identity verification."
  }
  ```
</ResponseExample>

## CLI

```bash theme={"theme":"css-variables"}
naive phone resend-otp
```

## MCP

Tool: `naive_phone_resend_verification_otp` (no arguments)

## Errors

| Error                | Cause                                                               |
| -------------------- | ------------------------------------------------------------------- |
| `resource_not_found` | No phone account exists yet — provision a number first              |
| `invalid_input`      | The account is standard-tier (EIN-registered) — no OTP step applies |
