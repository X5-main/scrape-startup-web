> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Queue

> Durable message queues (Amazon SQS) for agent work pipelines — the natural pairing for compute workers.

The **Queue** primitive gives you durable work queues. Naïve owns the underlying cloud credentials and scopes every queue to your tenant (one queue per resource, namespaced + tagged, with a queue policy locked to your tenant's task role). Your agents never hold a cloud key.

Use it to decouple producers from consumers, buffer bursts, fan work out to [Compute](/docs/getting-started/compute) workers, and get at-least-once delivery with retries.

## Create a queue

```ts theme={"theme":"css-variables"}
// Standard (best-effort order, at-least-once)
const q = await naive.queue.create({ name: "jobs" });

// FIFO (ordered, exactly-once) with a dead-letter queue
await naive.queue.create({ name: "orders", type: "fifo", dlq: true });
```

Scope follows the client you hold: `naive.queue.*` (your default user) vs `naive.forUser(id).queue.*` (an end-user).

## Send & receive

```ts theme={"theme":"css-variables"}
// Producer
await naive.queue.send(q.id, JSON.stringify({ task: "resize", url: "https://..." }));

// Consumer — long-poll, process, then ack each message by its receipt handle
const { messages } = await naive.queue.receive(q.id, { max: 10, wait: 20 });
for (const m of messages) {
  // ...process m.body...
  await naive.queue.ack(q.id, m.receipt_handle);
}
```

For FIFO queues, pass `group_id` (and optionally `dedup_id`) on `send`.

## Inspect & manage

```ts theme={"theme":"css-variables"}
await naive.queue.list();
await naive.queue.attributes(q.id);   // approximate depth / in-flight
await naive.queue.purge(q.id);
await naive.queue.destroy(q.id);
```

## CLI

```bash theme={"theme":"css-variables"}
naive queue create --name jobs            # or --fifo, --dlq
naive queue send <id> '{"task":"..."}'
naive queue receive <id> --wait 20
naive queue ack <id> <receiptHandle>
naive queue attributes <id>
```

## Worker pattern

Pair a queue with a compute `service` that long-polls it:

```bash theme={"theme":"css-variables"}
naive queue create --name jobs
naive compute create --name worker --type service --image me/worker:latest
# the worker loops: naive queue receive → process → naive queue ack
```

Combined with scale-to-zero, queue depth drives a cheap autoscaling worker.
