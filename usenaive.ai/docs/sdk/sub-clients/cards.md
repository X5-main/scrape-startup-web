> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# cards

> Per-user virtual cards.

Available on the root (default user) and `naive.forUser(id)`.

```ts theme={"theme":"css-variables"}
await naive.forUser(alice.id).cards.create({ name: "Ops", spending_limit_cents: 25000, provider: "managed_virtual" });
await naive.forUser(alice.id).cards.list();
await naive.forUser(alice.id).cards.get(cardId);
```

Gated by the `cards` primitive in the user's AccountKit.
