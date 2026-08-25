> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# queue

> Durable work queues (Amazon SQS) for agent pipelines — standard & FIFO, with dead-letter queues.

```ts theme={"theme":"css-variables"}
// Standard (default), or FIFO with an optional dead-letter queue
const q = await naive.queue.create({ name: "jobs" });
await naive.queue.create({ name: "orders", type: "fifo", dlq: true });

await naive.queue.list();
await naive.queue.get(q.id);
await naive.queue.attributes(q.id);     // approximate depth / in-flight

// Producer
await naive.queue.send(q.id, JSON.stringify({ task: "resize", url }));
// FIFO: pass a group id → await naive.queue.send(q.id, body, { group_id: "u_123" });

// Consumer — long-poll, process, then ack each receipt handle
const { messages } = await naive.queue.receive(q.id, { max: 10, wait: 20 });
for (const m of messages) {
  // ...process m.body...
  await naive.queue.ack(q.id, m.receipt_handle);
}

await naive.queue.purge(q.id);
await naive.queue.destroy(q.id);
```

Per-user and AccountKit-gated: `naive.queue` (account default agent profile) or `naive.forUser(id).queue`. Unacknowledged messages reappear after the visibility timeout (at-least-once with retries). The natural pairing for a [compute](/docs/sdk/sub-clients/compute) worker that long-polls the queue. See the [Queue guide](/docs/getting-started/queue).
