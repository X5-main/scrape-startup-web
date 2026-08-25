> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# formation

> Per-user US company formation.

```ts theme={"theme":"css-variables"}
await naive.forUser(alice.id).formation.submit({ state: "WY", description: "..." });
```

Gated by the `formation` primitive in the user's AccountKit.
