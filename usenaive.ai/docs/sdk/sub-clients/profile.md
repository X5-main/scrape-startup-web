> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# profile

> Read and set the tenant user's own profile email.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);

// Read the user's profile (id, email, name, …)
const me = await client.profile.get();

// Point the user's email at a provisioned inbox so autonomous signup has a
// verified address to receive confirmation/verification mail.
await client.email.createInbox({ username: "alice-ops" });
await client.profile.setEmail("alice-ops@inbound.usenaive.app");
```

The `profile` sub-client is a thin convenience over the tenant user's own record:

| Method                    | HTTP                   | Notes                                                                       |
| ------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `profile.get()`           | `GET /v1/users/{id}`   | The user's profile (same shape as [Users · get](/docs/api-reference/users/get)). |
| `profile.setEmail(email)` | `PATCH /v1/users/{id}` | Sets the profile `email`.                                                   |

It exists mainly so an agent can give itself a working email before running
[`browser.signup`](/docs/sdk/sub-clients/browser) (signup uses the profile email as the
account email). The same capability is exposed to LLM agents as the `profile`
primitive via [`agentTools()`](/docs/sdk/agent-tools) (`profile.get`, `profile.set_email`).
