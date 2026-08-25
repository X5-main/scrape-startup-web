> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Storage

> File storage buckets and objects for your app or your users' apps — backed by a fullstack app's managed storage.

The **Storage** primitive is object storage (buckets + files), backed by a [fullstack app's](/docs/getting-started/apps) managed backend. Naive injects the project's service-role key and proxies the storage API (`/storage/v1`).

<Info>
  Requires a **fullstack app** (`naive.apps.create({ name, type: "fullstack" })`). Like Database/Functions/Auth, it's a curated surface over the app-scoped backend proxy.
</Info>

## Two ways to use it

```ts theme={"theme":"css-variables"}
// Your own project (default user)
await naive.storage.listBuckets();

// A specific end-user's project
await naive.forUser(alice.id).storage.listBuckets();
```

Omit `{ appId }` to auto-resolve the user's single fullstack app; pass it when they own several.

## Buckets

```ts theme={"theme":"css-variables"}
await naive.storage.createBucket("avatars", { public: true });
await naive.storage.listBuckets();
await naive.storage.getBucket("avatars");
await naive.storage.deleteBucket("avatars");
```

## Objects

```ts theme={"theme":"css-variables"}
// List objects under a prefix
await naive.storage.list("avatars", { prefix: "users/" });

// Upload text/JSON content
await naive.storage.upload("avatars", "users/alice.json", { name: "Alice" });

// Download + remove
await naive.storage.download("avatars", "users/alice.json");
await naive.storage.remove("avatars", ["users/alice.json"]);
```

<Info>
  Binary uploads (images, video) are best done with a signed upload URL rather than the JSON proxy. Request one via the backend proxy (`POST .../storage/v1/object/upload/sign/{bucket}/{path}`) and PUT the bytes directly.
</Info>

## REST

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/apps/<app-id>/storage/proxy/bucket \
  -H "Authorization: Bearer nv_sk_live_..."
```

Your own project uses `/v1/apps/<app-id>/…`; an end-user's project uses `/v1/users/<user-id>/apps/<app-id>/…`.

Everything under `storage/proxy/*` forwards to the project's `/storage/v1/*`. See the [Storage API reference](/docs/api-reference/storage/overview).

## Billing

Object operations (list / upload / download / remove) are **free** — there is no per-request credit cost. A provisioned storage **bucket** carries a recurring vendor cost, so it is **duration-metered** (`storage_usage`) while it is `ready`, like the other [Path A infrastructure](/docs/getting-started/credits#infrastructure-duration-metered). That meter is **not currently charging**: it ships at a rate of `0`, and the expected \~`0.02 credits/hour` per bucket will be [announced](/docs/getting-started/credits#infrastructure-duration-metered) before it starts. Removing the bucket (`naive down`) stops the meter; your objects persist until then. Account Kits can gate the `storage` primitive per user.
