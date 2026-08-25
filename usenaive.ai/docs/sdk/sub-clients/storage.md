> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# storage

> File storage buckets and objects on a fullstack app's managed backend.

```ts theme={"theme":"css-variables"}
// Buckets — auto-resolves the user's single fullstack app (or pass { appId })
await naive.storage.createBucket("avatars", { public: true });
await naive.storage.listBuckets();
await naive.storage.getBucket("avatars");
await naive.storage.deleteBucket("avatars");

// Objects
await naive.storage.list("avatars", { prefix: "users/" });
await naive.storage.upload("avatars", "users/alice.json", { name: "Alice" });
await naive.storage.download("avatars", "users/alice.json");
await naive.storage.remove("avatars", ["users/alice.json"]);
```

Requires a `type: "fullstack"` [app](/docs/sdk/sub-clients/apps). Per-user and AccountKit-gated: `naive.storage` or `naive.forUser(id).storage`. Binary uploads should use a signed URL (request one via the apps backend proxy). See the [Storage guide](/docs/getting-started/storage).
