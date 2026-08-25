> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# phone

> Per-user phone numbers + SMS (Surge).

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
// Provision a number — `ein` is required for carrier registration on the first
// number at the default "standard" tier (sensitive — may return a PendingApproval).
const res = await naive.forUser(alice.id).phone.provision({ ein: "12-3456789", area_code: "415", label: "Support" });

// Sole proprietors: no LLC/EIN — requires passed KYC; brand verified via SMS OTP
await naive.forUser(alice.id).phone.provision({ tier: "sole_proprietor", area_code: "415" });
await naive.forUser(alice.id).phone.resendBrandVerificationOtp(); // resend the OTP

// Inspect the carrier-registration pipeline
await naive.forUser(alice.id).phone.status();

// Send an SMS (blocked until the campaign is approved; not approval-gated)
await naive.forUser(alice.id).phone.send({ from: phoneId, to: "+14155551234", body: "Hi" });

// Read inbound SMS
await naive.forUser(alice.id).phone.messages(phoneId, { limit: 50 });
await naive.forUser(alice.id).phone.read(messageId);

// List, assign an agent, release a number
await naive.forUser(alice.id).phone.list();
await naive.forUser(alice.id).phone.assign(phoneId, agentId, ["send_sms", "receive_sms"]);
await naive.forUser(alice.id).phone.release(phoneId);
```

`provision` is sensitive; when the user's AccountKit gates it for an agent caller the resolved value is a `PendingApproval` (HTTP 202) — check with `isPendingApproval(res)`. `send` is not gated.

Gated by the `phone` primitive in the user's AccountKit.
