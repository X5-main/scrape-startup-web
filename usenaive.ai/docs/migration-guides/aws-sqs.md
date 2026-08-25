> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Migrating from Amazon SQS to Naive

> Move an agent's work queues from a raw Amazon SQS account (IAM keys, one shared account for every tenant) to Naive's queue primitive — the same durable, at-least-once SQS queue, but scoped per end-user, with no cloud key in the agent, on the same identity that owns its email, cards, and vault.

<Frame caption="Amazon SQS → the Naive queue primitive">
  <img className="block dark:hidden" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/aws-sqs-light.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=3dd6cd39abe9a5ccc9e1e4c8d17dbebb" alt="Amazon SQS" height="28" data-path="migration-guides/logos/aws-sqs-light.svg" />

  <img className="hidden dark:block" src="https://mintcdn.com/naive/5tmHvttvUjTKnASN/migration-guides/logos/aws-sqs-dark.svg?fit=max&auto=format&n=5tmHvttvUjTKnASN&q=85&s=63b584651257729da60fd495be7b9ff2" alt="Amazon SQS" height="28" data-path="migration-guides/logos/aws-sqs-dark.svg" />
</Frame>

<Note>
  Amazon SQS is a trademark of its respective owner, used here for identification and migration comparison only. No endorsement, partnership, or affiliation is implied.
</Note>

[Amazon SQS](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html)
is the default durable message queue: create a queue, `SendMessage`, long-poll with `ReceiveMessage`,
`DeleteMessage` when you're done, and get at-least-once delivery with retries and dead-letter queues.
It's battle-tested and the SDK is mature. But SQS is also a *raw slice of an AWS account* that sits
apart from everything else your agent touches:

* Every queue lives behind **IAM credentials** (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` or a
  role), an AWS account, and CloudWatch — disconnected from wherever the agent's email, cards,
  secrets, and KYC live.
* The credential is **coarse**: a key with `sqs:*` (or even a scoped policy) is an account-level
  grant. There is no *per-end-user* queue — you build tenant isolation yourself with naming
  conventions and hand-written IAM policies.
* "Which customer's agent enqueued that job, and what *else* can this agent touch?" is answered in
  IAM + CloudWatch for queues, and in unrelated systems for everything else. The queue has no shared
  accountability with the rest of the agent's footprint.

Naive's [`queue`](/docs/getting-started/queue) primitive gives the agent the **same** capability — a
durable, at-least-once work queue (it's Amazon SQS underneath) — but the queue is **rooted in one
governed identity**:

* The [tenant user](/docs/getting-started/users) that owns the queue is the same user that owns its
  [email inboxes](/docs/getting-started/email), its [cards](/docs/getting-started/cards), its
  [vault](/docs/getting-started/vault) secrets, and its [KYC](/docs/getting-started/verification).
* The agent **never holds a cloud key**. Naive owns the underlying cloud credentials and scopes
  every queue to your tenant (one queue per resource, namespaced + tagged, with a queue policy
  locked to your tenant's task role) — the same model as [Compute](/docs/getting-started/compute).
* Whether an agent may use the queue at all is decided by that user's
  [Account Kit](/docs/getting-started/account-kits), and every request is metered against the tenant's
  [plan](/docs/getting-started/customer-billing) — so a leaked agent key can't quietly run up a bill on
  your raw AWS account.

This guide maps SQS's queue model to Naive's `queue` primitive, shows the smallest working swap, and
is explicit about the SQS features that **don't** map yet.

<Info>
  **Tested against:** the AWS SDK for JavaScript v3
  [`@aws-sdk/client-sqs`](https://www.npmjs.com/package/@aws-sdk/client-sqs) **v3.1080.x**
  (`SQSClient`, `CreateQueueCommand`, `SendMessageCommand`, `ReceiveMessageCommand`,
  `DeleteMessageCommand`, `GetQueueAttributesCommand`, `PurgeQueueCommand`, `DeleteQueueCommand`;
  Query/JSON protocol against `https://sqs.<region>.amazonaws.com`) and the Naive Node SDK
  [`@usenaive-sdk/server`](/docs/sdk/overview) against the Naive API (base `https://api.usenaive.ai/v1`,
  docs snapshot July 2026).

  Version notes:

  * SQS has **two queue types**: **standard** (best-effort ordering, at-least-once) and **FIFO**
    (queue name ends `.fifo`, exactly-once, ordered per `MessageGroupId`). Naive maps both:
    `create({ type: "standard" })` and `create({ type: "fifo" })`.
  * SQS **dead-letter queues** are configured with a `RedrivePolicy` attribute pointing at a second
    queue's ARN and a `maxReceiveCount`. Naive maps the DLQ with a single flag: `create({ dlq: true })`
    — but `maxReceiveCount` and redrive config are **not** exposed. See
    [what doesn't map yet](#what-does-not-map-yet).
  * SQS identifies a queue by its **`QueueUrl`** (per region/account). Naive identifies a queue by its
    **id** and resolves the region/account for you.
  * On Naive the queue is **per-tenant**: `naive.queue.*` acts as the account's default agent profile,
    `naive.forUser(id).queue.*` is a specific end-user. There is no SQS equivalent — tenant isolation
    in SQS is naming + IAM you write yourself.
</Info>

## Concept map

| Amazon SQS                                                                                   | Naive                                                                               | Notes                                                                                       |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SQSClient` behind `AWS_ACCESS_KEY_ID` / IAM role — one AWS account, shared across tenants   | `naive.forUser(id).queue` — scopes **every** primitive per end-user                 | The core consolidation win                                                                  |
| IAM credentials held by your code; the queue runs on *your* AWS trust                        | Agent **never holds a cloud key** — Naive owns the AWS creds, scopes to your tenant | Same model as [Compute](/docs/getting-started/compute)                                           |
| `CreateQueueCommand({ QueueName })` → `{ QueueUrl }`                                         | `naive.queue.create({ name })` → `{ id }`                                           | Standard queue                                                                              |
| `CreateQueueCommand({ QueueName: "x.fifo", Attributes: { FifoQueue: "true" } })`             | `naive.queue.create({ name, type: "fifo" })`                                        | FIFO queue                                                                                  |
| `RedrivePolicy` attribute → separate DLQ + `maxReceiveCount`                                 | `naive.queue.create({ name, dlq: true })`                                           | DLQ provisioned for you; `maxReceiveCount` not exposed — see [gaps](#what-does-not-map-yet) |
| `SendMessageCommand({ QueueUrl, MessageBody })` → `{ MessageId }`                            | `naive.queue.send(id, body)`                                                        | Body is a string on both                                                                    |
| `SendMessageCommand({ ..., MessageGroupId, MessageDeduplicationId })`                        | `naive.queue.send(id, body, { group_id, dedup_id })`                                | FIFO ordering + dedup                                                                       |
| `SendMessageCommand({ ..., DelaySeconds })`                                                  | `naive.queue.send(id, body, { delay_seconds })`                                     | Per-message delay                                                                           |
| `ReceiveMessageCommand({ QueueUrl, MaxNumberOfMessages, WaitTimeSeconds })` → `{ Messages }` | `naive.queue.receive(id, { max, wait })` → `{ messages }`                           | Long-poll; `max` ≤ 10, `wait` ≤ 20s                                                         |
| `ReceiveMessageCommand({ ..., VisibilityTimeout })`                                          | `naive.queue.receive(id, { visibility })`                                           | In-flight visibility window                                                                 |
| `message.Body` / `message.ReceiptHandle`                                                     | `m.body` / `m.receipt_handle`                                                       | Per-message fields                                                                          |
| `DeleteMessageCommand({ QueueUrl, ReceiptHandle })`                                          | `naive.queue.ack(id, receipt_handle)`                                               | Ack = delete after processing                                                               |
| `GetQueueAttributesCommand` → `ApproximateNumberOfMessages` etc.                             | `naive.queue.attributes(id)`                                                        | Approximate depth / in-flight / delayed                                                     |
| `PurgeQueueCommand({ QueueUrl })`                                                            | `naive.queue.purge(id)`                                                             | Drop all messages                                                                           |
| `DeleteQueueCommand({ QueueUrl })`                                                           | `naive.queue.destroy(id)`                                                           | Delete the queue (and its DLQ)                                                              |
| `ListQueuesCommand()` → `{ QueueUrls }`                                                      | `naive.queue.list()`                                                                | Queues for the identity                                                                     |
| `GetQueueUrlCommand({ QueueName })`                                                          | `naive.queue.get(id)`                                                               | Fetch one queue                                                                             |
| `MessageAttributes` (typed key/value map alongside the body)                                 | (none)                                                                              | Encode metadata in the body — see [gaps](#what-does-not-map-yet)                            |
| `SendMessageBatchCommand` / `DeleteMessageBatchCommand` (≤10 per call)                       | (none)                                                                              | Loop `send` / `ack` — see [gaps](#what-does-not-map-yet)                                    |
| `ChangeMessageVisibilityCommand` (extend a single in-flight message)                         | (none)                                                                              | Set `visibility` on `receive`; no per-message extend — see [gaps](#what-does-not-map-yet)   |
| `SetQueueAttributes` (retention, max size, KMS SSE, redrive tuning)                          | (managed)                                                                           | Naive sets sane defaults; not tunable — see [gaps](#what-does-not-map-yet)                  |
| IAM policy / access policy scopes *SQS in one AWS account*                                   | **Account Kit** gates `queue` per user + plan **quota** meters every call           | Governance on the identity — see [gains](#gain-2-execution-time-governance)                 |
| CloudWatch metrics/logs for the queue                                                        | `naive.forUser(id).logs.query()` — one per-user timeline                            | Queue events beside email, cards, vault — see [gain #3](#gain-3-unified-accountability)     |
| AWS CLI `aws sqs send-message`                                                               | `naive queue send <id> '{...}'`                                                     | Full CLI parity — see [CLI](/docs/cli/queue)                                                     |

## Before / after: the core path

The path that matters for almost every queue-backed agent is *create a queue, enqueue work, long-poll
for it, process, then delete the message*. Here it is on both platforms.

<CodeGroup>
  ```ts Amazon SQS theme={"theme":"css-variables"}
  import {
    SQSClient, CreateQueueCommand, SendMessageCommand,
    ReceiveMessageCommand, DeleteMessageCommand,
  } from "@aws-sdk/client-sqs";

  // Needs AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (or a role) + a region
  const sqs = new SQSClient({ region: "us-east-1" });

  // Create the queue (account-level; you namespace + IAM-scope tenants yourself)
  const { QueueUrl } = await sqs.send(new CreateQueueCommand({ QueueName: "jobs" }));

  // Producer
  await sqs.send(new SendMessageCommand({
    QueueUrl,
    MessageBody: JSON.stringify({ task: "resize", url: "https://..." }),
  }));

  // Consumer — long-poll, process, then delete each message
  const { Messages = [] } = await sqs.send(new ReceiveMessageCommand({
    QueueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20,
  }));
  for (const m of Messages) {
    // ...process m.Body...
    await sqs.send(new DeleteMessageCommand({ QueueUrl, ReceiptHandle: m.ReceiptHandle }));
  }
  // → the queue is a slice of your AWS account behind an IAM key. No per-user
  //   isolation, and no shared identity with the agent's email, cards, or vault.
  ```

  ```ts Naive theme={"theme":"css-variables"}
  import { Naive } from "@usenaive-sdk/server";

  const naive = new Naive({ apiKey: process.env.NAIVE_API_KEY! });
  const client = naive.forUser("acme"); // same id space as your own users

  // Create the queue — scoped to this end-user, no cloud key in the agent
  const q = await client.queue.create({ name: "jobs" });

  // Producer
  await client.queue.send(q.id, JSON.stringify({ task: "resize", url: "https://..." }));

  // Consumer — long-poll, process, then ack each receipt handle
  const { messages } = await client.queue.receive(q.id, { max: 10, wait: 20 });
  for (const m of messages) {
    // ...process m.body...
    await client.queue.ack(q.id, m.receipt_handle);
  }
  // → the SAME `client` also owns this user's email, cards, vault, and KYC.
  ```
</CodeGroup>

The shape is largely the same — *create, send, receive, delete* — because Naive's queue **is** Amazon
SQS underneath. The real differences to plan for:

* **No key, no region wrangling.** SQS needs IAM credentials and a region; the queue runs on *your*
  AWS trust. Naive runs the queue on cloud credentials it owns — the agent holds no cloud key and
  never sees a `QueueUrl`.
* **The queue is per-user, not per-account.** SQS gives you one account; you hand-build tenant
  isolation with naming + IAM. On Naive `naive.forUser(id).queue` *is* the isolation boundary.
* **`ReceiptHandle` → `receipt_handle`, `Body` → `body`.** Field casing changes; the semantics
  (long-poll, visibility timeout, at-least-once, ack-to-delete) are the same SQS semantics.
* **The id is your identity, not a separate account.** In SQS the key scopes *SQS in one AWS
  account*. In Naive the same `forUser(id)` handle also owns the agent's email, cards, vault, and KYC.

## FIFO, delay, and dead-letter queues

The other SQS features teams rely on — FIFO ordering, per-message delay, and a dead-letter queue —
map directly, with less setup.

<CodeGroup>
  ```ts Amazon SQS (FIFO + DLQ) theme={"theme":"css-variables"}
  // DLQ first, then read its ARN, then wire a RedrivePolicy on the main queue
  const { QueueUrl: dlqUrl } = await sqs.send(new CreateQueueCommand({
    QueueName: "orders-dlq.fifo",
    Attributes: { FifoQueue: "true" },
  }));
  const { Attributes } = await sqs.send(new GetQueueAttributesCommand({
    QueueUrl: dlqUrl, AttributeNames: ["QueueArn"],
  }));

  const { QueueUrl } = await sqs.send(new CreateQueueCommand({
    QueueName: "orders.fifo",
    Attributes: {
      FifoQueue: "true",
      RedrivePolicy: JSON.stringify({
        deadLetterTargetArn: Attributes!.QueueArn,
        maxReceiveCount: 5,
      }),
    },
  }));

  // FIFO send needs a MessageGroupId (and optionally a dedup id), plus optional delay
  await sqs.send(new SendMessageCommand({
    QueueUrl,
    MessageBody: JSON.stringify({ order: 42 }),
    MessageGroupId: "u_123",
    MessageDeduplicationId: "order-42",
    DelaySeconds: 10,
  }));
  ```

  ```ts Naive (FIFO + DLQ) theme={"theme":"css-variables"}
  // One call: FIFO queue with a dead-letter queue provisioned for you
  const q = await client.queue.create({ name: "orders", type: "fifo", dlq: true });

  // FIFO send takes the group id (and optional dedup id), plus optional delay
  await client.queue.send(q.id, JSON.stringify({ order: 42 }), {
    group_id: "u_123",
    dedup_id: "order-42",
    delay_seconds: 10,
  });
  ```
</CodeGroup>

* **DLQ is a flag, not a two-queue dance.** SQS makes you create the DLQ, read its ARN, and attach a
  `RedrivePolicy`. Naive provisions the DLQ when you pass `dlq: true` and tears it down with the
  parent on `destroy`.
* **`maxReceiveCount` is not exposed** on Naive — the redrive threshold is managed. If you tune it in
  SQS, note that as a [gap](#what-does-not-map-yet).

## Minimal viable migration

The smallest swap that keeps a working queue-backed agent alive is *create → send → receive → ack*.

<Steps>
  <Step title="Install the SDK and set your key">
    ```bash theme={"theme":"css-variables"}
    npm install @usenaive-sdk/server
    ```

    Set `NAIVE_API_KEY` (a server-side key from the [dashboard](https://dashboard.usenaive.ai)).
    You can drop `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` and the region config for this path.
  </Step>

  <Step title="Pick the identity that owns the queue">
    Use `naive.queue` for the account's default agent profile, or `naive.forUser(id).queue` to scope
    the queue to a specific end-user. There is no `QueueUrl` and no region — Naive resolves them.
  </Step>

  <Step title="Swap queue creation">
    Replace `CreateQueueCommand({ QueueName })` with `naive.queue.create({ name })`. For FIFO pass
    `type: "fifo"`; for a dead-letter queue pass `dlq: true` (no separate DLQ + `RedrivePolicy`).
    Keep the returned `id` in place of the `QueueUrl`.
  </Step>

  <Step title="Swap send">
    Map `SendMessageCommand({ QueueUrl, MessageBody })` → `naive.queue.send(id, body)`. Move
    `MessageGroupId` / `MessageDeduplicationId` / `DelaySeconds` to the
    `{ group_id, dedup_id, delay_seconds }` options object.
  </Step>

  <Step title="Swap receive + ack">
    Map `ReceiveMessageCommand({ MaxNumberOfMessages, WaitTimeSeconds })` →
    `naive.queue.receive(id, { max, wait })`, then read `m.body` / `m.receipt_handle` (lower-case).
    Map `DeleteMessageCommand({ ReceiptHandle })` → `naive.queue.ack(id, receipt_handle)`.
  </Step>

  <Step title="Ship it">
    At this point you are off SQS for the core create → send → receive → ack path. Everything below
    is upside, not a requirement.
  </Step>
</Steps>

## Consolidate further once you're on Naive

This is where the migration pays for itself. In SQS, the IAM credential scopes **queues in one AWS
account and nothing else**, and you build per-tenant isolation with naming conventions and policies.
On Naive, the unit of isolation is a **tenant user**, and the queue is one of many primitives that
identity owns.

<CodeGroup>
  ```ts Amazon SQS (queues only) theme={"theme":"css-variables"}
  // One IAM credential scopes SQS — and only SQS — across your whole account.
  // Per-tenant isolation is a naming + IAM policy you maintain yourself.
  const { QueueUrl } = await sqs.send(new CreateQueueCommand({
    QueueName: `tenant-${customer.id}-jobs`, // your convention
  }));
  await sqs.send(new SendMessageCommand({ QueueUrl, MessageBody: "..." }));

  // The card, the vault secrets, the email inbox, and the KYC for this customer's
  // agent live in entirely separate systems with their own tenancy.
  ```

  ```ts Naive (tenant user — the whole stack) theme={"theme":"css-variables"}
  // One tenant user per customer isolates *every* primitive.
  const acme = await naive.users.create({
    external_id: customer.id,
    email: customer.email,
  });

  const client = naive.forUser(acme.id);

  // The queue is scoped to this user — no naming convention, no IAM policy:
  const q = await client.queue.create({ name: "jobs" });
  await client.queue.send(q.id, "...");

  // The SAME client owns this customer's email inbox, card, vault, and KYC —
  // one identity, isolated end to end.
  await client.email.createInbox({ local_part: "agent" });
  await client.cards.create({ name: "Ops", spending_limit_cents: 25_000, provider: "managed_virtual" });
  ```
</CodeGroup>

### Gain #1 — one identity across primitives

* With SQS, the agent's queues are a slice of one AWS account, and per-tenant isolation is a naming
  convention plus IAM policy you write and audit yourself. With Naive, `naive.forUser(acme.id)` is a
  single handle to **queue *and* email *and* cards *and* vault *and* KYC**.
* Each queue is namespaced + tagged and locked to that tenant's task role automatically — sibling
  tenants can never read each other's queues, secrets, cards, or logs. Tear the customer down from
  one place.

### Gain #2 — execution-time governance

* Whether an agent may use the queue at all is **policy on the identity** — not an IAM policy you
  maintain in a second console. Toggle the `queue` primitive per user in the
  [Account Kit](/docs/getting-started/account-kits), and every request is
  [metered](/docs/getting-started/customer-billing) against the tenant's plan quota.

```ts theme={"theme":"css-variables"}
// A starter tier: queue enabled, capped by the plan's quota; no card for this tier.
const starter = await naive.accountKits.create({
  name: "Starter",
  primitives_config: {
    queue: { enabled: true },
    cards: { enabled: false },
  },
});
await naive.accountKits.assignUser(starter.id, acme.id);

// The plan carries the per-primitive quota that meters queue usage at execution time.
await naive.plans.upsert({
  key: "starter",
  name: "Starter",
  accountKitId: starter.id,
  period: "month",
  quotas: { queue: 100_000 },
});
await naive.forUser(acme.id).billing.setSubscription({ planKey: "starter" });
```

* The agent's code path stays the same for every tier — `client.queue.send(...)`,
  `client.queue.receive(...)`. What changes at execution time:
  * **Disabled primitive → the call is refused.** If the Account Kit doesn't grant `queue`, the
    request never reaches AWS.
  * **Quota exceeded → `429`.** Once usage crosses the plan's `queue` quota for the period, the call
    is rejected with a `rate_limited` error — no surprise AWS bill from a runaway agent.
  * **The agent holds no cloud key.** Naive owns the AWS credentials; a leaked agent key can't
    enumerate or drain queues on your raw AWS account.

<Info>
  Unlike money-moving primitives ([cards](/docs/migration-guides/stripe-issuing),
  [trading](/docs/migration-guides/alpaca)), enqueuing a message is **not** approval-gated — there's no
  human-in-the-loop pause on `send`. Queue governance is **enable/disable + plan quota + unified
  logs**, enforced at execution time. If you need per-action human approval, that lives on the
  sensitive primitives, not the queue.
</Info>

### Gain #3 — unified accountability

* Every queue create, send, receive, and purge for a customer lands in *one* per-user
  [activity log](/docs/getting-started/logs) — alongside their email, card, vault, and KYC events, not in
  a separate CloudWatch namespace:

```ts theme={"theme":"css-variables"}
const { events } = await naive.forUser(acme.id).logs.query({ limit: 50 });
// "what did this agent enqueue, for whom?" — queue, email, cards, vault, one timeline
```

* That is the question that is hard to answer when queues live in SQS/CloudWatch, secrets live in
  your own manager, cards live in Stripe, and email lives somewhere else. Under Naive it is a single
  query.

## What does not map yet

A migration guide that hides gaps is worse than none. The core path (create → send → receive → ack),
FIFO, per-message delay, dead-letter queues, purge, attributes, and long-polling map cleanly — the
queue **is** Amazon SQS underneath. But the following SQS capabilities have **no direct equivalent**
on Naive's `queue` primitive today. Check this list against your app before you commit.

| Amazon SQS feature                                                                             | Status on Naive                                           | Workaround                                                                   |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **`MessageAttributes`** — typed metadata key/value map alongside the body                      | Not provided                                              | Encode metadata inside the JSON `body`                                       |
| **Batch APIs** (`SendMessageBatch` / `DeleteMessageBatch`, ≤10 per call)                       | Not provided                                              | Loop single `send` / `ack` calls                                             |
| **`ChangeMessageVisibility`** — extend a single in-flight message's timeout                    | Not provided                                              | Set `visibility` at `receive` time; size it for your slowest processing      |
| **Redrive tuning** (`maxReceiveCount`, `RedrivePolicy`, `StartMessageMoveTask`)                | `dlq: true` only                                          | DLQ is provisioned; the receive-count threshold is managed, not configurable |
| **Queue attribute tuning** (retention period, max message size, receive-wait default, KMS SSE) | Managed defaults                                          | Not tunable per queue today                                                  |
| **Access policy / cross-account grants** (`AddPermission`, SQS policy)                         | Not applicable                                            | Naive owns the creds and scopes per tenant — that's the point                |
| **Native SNS→SQS fan-out / EventBridge pipes / Lambda event-source mapping**                   | Not provided                                              | Poll the queue from a [compute](/docs/getting-started/compute) `service` worker   |
| **CloudWatch metrics / alarms**                                                                | Per-user [logs](/docs/getting-started/logs) + `attributes(id)` | Approximate depth via `attributes`; events via the activity log              |
| **Raw `QueueUrl` / ARN, region selection**                                                     | Queue `id` only                                           | Naive resolves region/account; you never handle a URL or ARN                 |

<Warning>
  If your agent depends on SQS **`MessageAttributes`**, **batch send/delete**, per-message
  **`ChangeMessageVisibility`**, or fine-grained **queue attribute / redrive tuning**, those are the
  gaps most likely to need a workaround — Naive's queue is a **curated, per-tenant SQS surface**
  (create / send / receive / ack / purge / attributes), not the full SQS control plane. The core
  producer/consumer path, FIFO, delay, and DLQ map directly. The flip side is the gain: the queue, its
  credentials, and its isolation are governed by the *same* identity and Account Kit as the rest of the
  agent — with per-plan quota and a unified audit trail — not a slice of an AWS account behind an
  all-or-nothing IAM key.
</Warning>

## Where to go next

* [`queue` primitive](/docs/getting-started/queue) — standard / FIFO, DLQ, send / receive / ack, worker pattern
* [`queue` SDK sub-client](/docs/sdk/sub-clients/queue) — typed method signatures
* [`queue` CLI](/docs/cli/queue) — create / send / receive / ack / attributes
* [Compute](/docs/getting-started/compute) — pair a `service` worker that long-polls the queue for a cheap autoscaling consumer
* [Customer billing](/docs/getting-started/customer-billing) — the plan + quota that meters queue usage at execution time
* [Account Kits](/docs/getting-started/account-kits) — the policy model that enables/disables the queue per user
* [Tenant users](/docs/getting-started/users) — the identity that owns the queue, compute, email, cards, and vault

## Related reading (blog)

* [Why consolidate agent infra on one governed identity](https://usenaive.ai/blog/why-consolidate-agent-infra-on-one-governed-identity) — migration thesis behind this guide
* [Building AI Agents Into Your SaaS](https://usenaive.ai/blog/building-ai-agents-into-your-saas) — tenant user anchor for every migration
* [How To Build An Agentic Data Pipeline Platform](https://usenaive.ai/blog/how-to-build-an-agentic-data-pipeline-platform) — queue-backed pipeline tutorial
