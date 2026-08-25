> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# queue

> naive queue — durable message queues (Amazon SQS) for agent work pipelines.

Durable work queues backed by managed Amazon SQS — standard or FIFO, with optional dead-letter queues. The natural pairing for a [compute](/docs/cli/compute) worker.

## Create & manage

```bash theme={"theme":"css-variables"}
naive queue create --name jobs              # standard (default)
naive queue create --name orders --fifo --dlq
naive queue list
naive queue show <id>
naive queue attributes <id>                 # approximate depth / in-flight
naive queue delete <id>
```

## Produce & consume

```bash theme={"theme":"css-variables"}
# Producer
naive queue send <id> '{"task":"resize","url":"https://..."}'
# FIFO queues require a group id:
naive queue send <id> '{"task":"..."}' --group user-123

# Consumer — long-poll, process, then acknowledge by receipt handle
naive queue receive <id> --wait 20
naive queue ack <id> <receiptHandle>

# Empty the queue
naive queue purge <id>
```

Messages you don't `ack` reappear after the visibility timeout — at-least-once delivery with retries.

A receipt handle belongs to one receive on one queue. `naive queue ack` with a
stale or reused handle returns `invalid_input` — run `naive queue receive`
again and ack the handle from that response.

## Worker pattern

```bash theme={"theme":"css-variables"}
naive queue create --name jobs
naive compute create --name worker --type service --image me/worker:latest
# the worker loops: naive queue receive → process → naive queue ack
```

Combined with compute's scale-to-zero and the queue's depth, that's a cheap autoscaling pipeline. Full guide: [/docs/getting-started/queue](/docs/getting-started/queue).
