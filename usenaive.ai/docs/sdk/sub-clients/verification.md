> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# verification

> Per-user KYC verification.

```ts theme={"theme":"css-variables"}
await naive.forUser(alice.id).verification.start({ members: [/* ... */] });
```

Gated by the `verification` primitive in the user's AccountKit.
