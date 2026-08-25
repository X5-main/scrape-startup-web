> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Guide: an agent that reacts to webhooks

> Give an agent its own signed URL, point Stripe or GitHub at it, and let inbound events wake it.

The goal: a GitHub `pull_request` event wakes an agent, which reviews the diff
and posts a summary. The provider talks to a URL; the agent wakes on it.

## 1. Mint the agent's URL

```ts theme={"theme":"css-variables"}
const hook = await client.agents.createWebhook(agent.id, { name: "github-pr" });

hook.url;    // "https://api.usenaive.ai/webhooks/hooks/hk_9f2c…"
hook.secret; // "hksec_…"  ← returned ONCE, in this response, and never again
```

```bash theme={"theme":"css-variables"}
naive agents webhook-add <agent-id> --name github-pr
```

<Warning>
  🔴 **The secret is in this response and in no other.** `webhooks()` reports
  `secret_set: true` and never the value — a secret a list can return is a secret
  in every log that rendered a list. If you lose it, delete the endpoint and mint
  a new one; there is no read-back.
</Warning>

## 2. Point the provider at it

Paste `hook.url` into GitHub's webhook settings (or Stripe's, or Linear's) and
give it the secret. Naïve verifies the signature and refuses anything that fails
— your agent never sees unverified traffic.

The delivery must carry two headers:

| header              | value                                                          |
| ------------------- | -------------------------------------------------------------- |
| `X-Naive-Timestamp` | Unix **seconds**, as a decimal string                          |
| `X-Naive-Signature` | `HMAC-SHA256(secret, "<timestamp>.<raw body>")`, lowercase hex |

Two separate headers, and the signature is **bare hex** — a leading `sha256=` or
`v1,` is tolerated and nothing else is. A single Stripe-style combined header
(`t=…,v1=…`) does **not** verify.

The window is five minutes. An unknown or inactive endpoint answers `404` — the
same answer as a wrong slug — so the URL is never an existence oracle.

<Warning>
  🔴 **URLs minted before 2026-08-18 point at nothing.** `createWebhook()` returned
  `https://hooks.usenaive.ai/wh/{slug}` — a host with no deployment behind it —
  while the receiver ran on `/webhooks/hooks/{slug}` the whole time. A provider
  pointed at one of those got `404 DEPLOYMENT_NOT_FOUND` and the agent never woke,
  with nothing on any surface to say so. Call `webhooks()` to read the current
  address; `agents.status().webhook_ingress` says whether the deployment has one at
  all, and a deployment that does not now refuses `createWebhook()` with
  `feature_not_configured` rather than minting an address to nowhere.
</Warning>

## 3. Signing it yourself

If you are the one calling the URL — a backend of yours, a test, a provider with
no built-in signing — use the SDK helper rather than rebuilding the string:

```ts theme={"theme":"css-variables"}
import { signAgentWebhook } from "@usenaive-sdk/node";

const rawBody = JSON.stringify({ action: "opened", number: 412 });
const headers = signAgentWebhook(hook.secret, rawBody);
// { "X-Naive-Timestamp": "1786…", "X-Naive-Signature": "9c1f…" }

await fetch(hook.url, {
  method: "POST",
  headers: { "content-type": "application/json", ...headers },
  body: rawBody,   // ← the EXACT bytes that were signed
});
```

<Warning>
  **Two details that verify fine locally and fail only as a security property.**

  The timestamp is part of the **signed content**, not a header beside it. A
  body-only signature is replayable forever, and a timestamp the MAC does not
  cover is editable by whoever captured the request.

  And `rawBody` must be the exact bytes you send. Re-serialising the object
  reorders keys and the signature stops matching — sign the string, then send that
  same string.
</Warning>

## 4. What the agent receives

The delivery becomes a task with `source: "webhook"` and the provider's body in
`payload`:

```ts theme={"theme":"css-variables"}
const { items } = await client.agents.tasks(agent.id, { source: "webhook" });
const t = items[0]!;

t.source;    // "webhook"  ← why this agent woke
t.metadata;  // { trigger_subscription_id: "…", event_type: "webhook.received" }
t.text;      // the work description, with the payload rendered into it
t.status;    // "queued" → "running" → "done"
```

<Note>
  **`source` is platform-set and a request body can never write it.** It travels
  from the trigger router to the runtime on a header the gateway sets, so a task
  you create yourself is `"api"` no matter what you put in the body — that is what
  makes the column worth filtering on.

  Runtimes before 2026-08-19 wrote `api` into this column for every task, so
  `tasks({ source: "webhook" })` came back `{items: []}` on them. If you are
  reading a task created by one of those builds, filter on
  `metadata.event_type` / `metadata.trigger_subscription_id` instead; the router
  has always written those.
</Note>

The call returns as soon as the row is durably written. **The agent's work never
runs on the provider's clock**, so a slow review does not time out GitHub's
delivery and trigger a retry storm.

Write the instructions so the agent knows to read `payload`:

```ts theme={"theme":"css-variables"}
await client.agents.update(agent.id, {
  instructions: [
    "You review pull requests.",
    "The inbound GitHub event is in the task payload. Read `payload.number` and `payload.pull_request.diff_url`.",
    "Deliver one review: what changed, what is risky, what to check by hand.",
  ].join("\n"),
});
```

## 5. List and revoke

```ts theme={"theme":"css-variables"}
const { webhooks } = await client.agents.webhooks(agent.id);
// [{ id, agent_id, subscription_id, url, secret_set: true, active: true, last_event_at }]

await client.agents.deleteWebhook(agent.id, webhooks[0]!.id!);
```

```bash theme={"theme":"css-variables"}
naive agents webhooks <agent-id>
naive agents webhook-rm <agent-id> <hook-id>
```

<Note>
  **Revoking answers `404` when it removed nothing** — a delete that matched
  nothing is an error you can see, not a silent success.
</Note>

## 6. Watch it react, live

```bash theme={"theme":"css-variables"}
naive agents logs <agent-id> --follow
```

```ts theme={"theme":"css-variables"}
const stream = await client.agents.watch(agent.id);
for await (const e of stream) {
  if (e.kind === "task_started") console.log("woke on", e.data);
  if (e.kind === "delivered") console.log("filed", e.data);
}
stream.close();
```

Watching does not pin the agent awake — the stream is a view over the log, not a
hold on the worker — so leaving a tail open does not change what the agent costs.

## One URL per agent, or one per provider?

One endpoint is bound to exactly one agent, and the binding is by the endpoint's
own slug rather than anything in the provider's payload. So:

* **Two providers, one agent** — mint two endpoints on the same agent. Both wake
  it; `payload` tells them apart.
* **One provider, two agents** — mint one endpoint per agent and register both
  URLs with the provider. Name them (`--name github-pr`, `--name github-issues`)
  so the list still reads six months later.

Agents never wake on each other's traffic, because the subscription filters on
the delivery's own hook slug.
