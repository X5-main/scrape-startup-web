> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Storage Overview

> File storage buckets and objects on a fullstack app's managed backend.

The Storage primitive proxies a [fullstack app's](/docs/api-reference/apps/overview) storage API (`/storage/v1`) with the project service-role key injected. App-scoped, on both the company mount (`/v1/apps/:id/...`) and per-user mount (`/v1/users/:user_id/apps/:id/...`). On per-user mounts the kit must enable the `storage` primitive.

## Endpoint

| Method | Path                           | Description                               |
| ------ | ------------------------------ | ----------------------------------------- |
| `ANY`  | `/v1/apps/:id/storage/proxy/*` | Storage API passthrough (`/storage/v1/*`) |

Everything after `storage/proxy/` maps to the project's `/storage/v1/`:

| Operation           | Method + path                                                 |
| ------------------- | ------------------------------------------------------------- |
| List buckets        | `GET storage/proxy/bucket`                                    |
| Create bucket       | `POST storage/proxy/bucket`                                   |
| Get / delete bucket | `GET` / `DELETE storage/proxy/bucket/{id}`                    |
| List objects        | `POST storage/proxy/object/list/{bucket}`                     |
| Upload object       | `POST storage/proxy/object/{bucket}/{path}`                   |
| Download object     | `GET storage/proxy/object/{bucket}/{path}`                    |
| Delete objects      | `DELETE storage/proxy/object/{bucket}` (body: `{ prefixes }`) |

```bash theme={"theme":"css-variables"}
curl https://api.usenaive.ai/v1/apps/<app-id>/storage/proxy/bucket \
  -H "Authorization: Bearer nv_sk_live_..."
```

<Info>
  `POST .../supabase/proxy/v1/projects/{ref}/storage/buckets` also creates a
  bucket. The Management API has no such route (it is GET-only), so the apps
  proxy rewrites that call to `POST storage/v1/bucket` on the data plane — the
  same thing `storage/proxy/bucket` reaches. Agents kept reaching for the
  management path; it now works instead of returning an opaque upstream failure.
</Info>

<Info>
  Binary uploads are best done with a signed upload URL (`POST .../storage/v1/object/upload/sign/{bucket}/{path}`) then a direct PUT of the bytes — the JSON proxy is intended for metadata and text/JSON content.
</Info>

## SDK

```ts theme={"theme":"css-variables"}
await naive.storage.createBucket("avatars", { public: true });
await naive.forUser(userId).storage.list("avatars", { prefix: "users/" });
```

See the [Storage guide](/docs/getting-started/storage) and the [`storage` sub-client](/docs/sdk/sub-clients/storage).
