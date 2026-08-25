> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Install

> Install and initialize @usenaive-sdk/server.

```bash install theme={"theme":"css-variables"}
npm install @usenaive-sdk/server
# or: pnpm add @usenaive-sdk/server / yarn add @usenaive-sdk/server / bun add @usenaive-sdk/server
```

```ts agent.ts theme={"theme":"css-variables"}
import { Naive } from "@usenaive-sdk/server";

const naive = new Naive({
  apiKey: process.env.NAIVE_API_KEY!,
  // baseUrl?: defaults to https://api.usenaive.ai
  // defaultUserId?: pin a user for the root client's data-plane calls
});
```

To get typed team names and the durable-runtime surface, construct it from your config
instead — same credential, same transport, and every method above still present:

```ts client.ts theme={"theme":"css-variables"}
import { createClient } from "@usenaive-sdk/server";
import config from "./naive.config.js";

const naive = createClient<typeof config>({ apiKey: process.env.NAIVE_API_KEY! });
```

* **Node** ≥ 18 (uses global `fetch`). Ships ESM + CJS with bundled types.
* **Server-only** in v1 — your API key is a server secret. Don't ship it to browsers.

<Note>
  **Already importing `@usenaive-sdk/node`?** Keep going — it is published, supported, and not
  deprecated. `@usenaive-sdk/server` re-exports it in full and adds
  `forUser(id).provision(...)`, so moving over is a one-line change to the import specifier with
  no other edits. Installing both is unnecessary: `server` depends on `node`.
</Note>
