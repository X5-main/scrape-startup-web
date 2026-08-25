> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# social

> Per-user social posting.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);
await client.social.listPosts();
await client.social.createPost({ platform: "x", content: "..." });
```

Gated by the `social` primitive in the user's AccountKit.
