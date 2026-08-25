> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connection Guide

> How to connect different MCP clients to the Naive hosted server.

## SSE Transport

The Naive MCP server uses **Server-Sent Events (SSE)** transport. This is a standard HTTP connection that stays open for bidirectional communication.

## Connecting

<Steps>
  <Step title="Get an API key">
    Register at `POST /v1/auth/register` or use an existing key.
  </Step>

  <Step title="Connect SSE">
    Open a connection to:

    ```
    GET https://api.usenaive.ai/mcp/sse
    Authorization: Bearer nv_sk_live_...
    ```

    The server responds with a session event containing a `sessionId`.
  </Step>

  <Step title="Send messages">
    ```
    POST https://api.usenaive.ai/mcp/messages?sessionId=<session-id>
    Content-Type: application/json
    ```
  </Step>
</Steps>

## Client Configuration Examples

<Tabs>
  <Tab title="Claude Desktop">
    Add to `claude_desktop_config.json`:

    ```json theme={"theme":"css-variables"}
    {
      "mcpServers": {
        "naive": {
          "type": "sse",
          "url": "https://api.usenaive.ai/mcp/sse",
          "headers": {
            "Authorization": "Bearer nv_sk_live_..."
          }
        }
      }
    }
    ```
  </Tab>

  <Tab title="Cursor">
    Add to `.cursor/mcp.json` in your workspace:

    ```json theme={"theme":"css-variables"}
    {
      "mcpServers": {
        "naive": {
          "type": "sse",
          "url": "https://api.usenaive.ai/mcp/sse",
          "headers": {
            "Authorization": "Bearer nv_sk_live_..."
          }
        }
      }
    }
    ```
  </Tab>

  <Tab title="Custom Client">
    ```typescript theme={"theme":"css-variables"}
    import { Client } from "@modelcontextprotocol/sdk/client/index.js";
    import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

    const transport = new SSEClientTransport(
      new URL("https://api.usenaive.ai/mcp/sse"),
      {
        requestInit: {
          headers: {
            Authorization: "Bearer nv_sk_live_...",
          },
        },
      }
    );

    const client = new Client({ name: "my-agent", version: "1.0.0" });
    await client.connect(transport);

    // `callTool` takes ONE params object: { name, arguments }.
    const result = await client.callTool({
      name: "naive_web_search",
      arguments: { query: "latest AI news" },
    });
    ```

    <Warning>
      `callTool` is **not** `(name, args)`. Its signature is
      `callTool(params, resultSchema?, options?)` where `params` is
      `{ name, arguments }`. Passing the name as the first argument sends a malformed
      request rather than failing loudly at the call site.
    </Warning>
  </Tab>
</Tabs>

## Two SSE endpoints

There are **two** ways to open a session, and they scope differently.

| Endpoint                           | Credential                             | Scope                                 |
| ---------------------------------- | -------------------------------------- | ------------------------------------- |
| `GET /mcp/sse`                     | a company API key (`nv_sk_…`)          | The company's **default** tenant user |
| `GET /mcp/sse` + `X-Naive-User-Id` | an **un-sealed** company API key       | The tenant user the header names      |
| `GET /mcp/sse/{session_id}`        | a per-user session token (`nv_sess_…`) | Bound to **that** tenant user         |

## Selecting a subject: `X-Naive-User-Id`

MCP has no `/v1/users/{user_id}/…` path, so the header is how a connection names a
subject other than the default — the same header, the same validation and the same
refusals as on every REST route (see [Subject resolution](/docs/architecture/subject-resolution)).
Set it alongside `Authorization` in your client config:

```json theme={"theme":"css-variables"}
{
  "mcpServers": {
    "naive": {
      "type": "sse",
      "url": "https://api.usenaive.ai/mcp/sse",
      "headers": {
        "Authorization": "Bearer nv_sk_live_...",
        "X-Naive-User-Id": "8f2c…"
      }
    }
  }
}
```

It is resolved **once, when the session opens**, so the tool list you are offered, the
AccountKit gate on every call and the rows each tool reads all belong to that subject.
Send it on the message `POST` as well as the SSE connect — clients that re-send
`Authorization` per message must re-send this too, or the message is refused as a
different identity than the one that opened the session.

<Warning>
  **A connection already bound to a subject may only name that subject.** A key sealed to
  an agent profile, or a `nv_sess_…` per-user session, refuses a header naming anyone else
  with **403 `key_subject_mismatch`** — never a redirect. Send `me` or `default`, or drop
  the header, to act as the bound subject. An unknown, malformed or another company's id is
  a clean **404**.
</Warning>

The per-user form is what every multi-tenant integration should use. Mint it with
`POST /v1/users/{user_id}/sessions`, which returns the `/mcp/sse/{session_id}` URL; the
`nv_sess_…` token still travels in the `Authorization` header. `GET /v1/users/{user_id}/sessions/{id}/tools`
shows exactly which tools that session will be offered, before you connect.

<Warning>
  **Scoped keys cannot open an MCP session.** A key carrying any `scopes` array — the ephemeral
  voice-worker key, for example — is refused with `401 unauthorized` and the message *"Scoped voice
  session keys cannot open an MCP session."* This is a deliberate policy, not a gap: every tool now
  carries a scope and the dispatcher enforces it, so admitting scoped sessions would *grant* access
  those keys do not have today. If you are getting a 401 with a key that works fine on REST, check
  whether it is scoped.
</Warning>

## Session Lifecycle

* Sessions are tied to the SSE connection
* When connection drops, the session ends
* Each new connection creates a new session
* The server sends an SSE **comment frame (`:`) every 25 seconds** so an idle stream is not
  closed by an intermediary. You do not need to send anything to hold the session open, and
  your client should ignore comment frames (every standard SSE parser already does)
* If the stream does drop, the next `POST /mcp/messages` answers
  `404 {"error":{"code":"session_expired"}}`. That code means **reconnect and replay** — the
  resource you named is unaffected. It is deliberately distinct from `resource_not_found`,
  which means the inbox/app/deployment you asked about does not exist
* Auth is validated when the SSE connection opens
* On `POST /mcp/messages`, an `Authorization` header that is **present and does not match** the
  identity that opened the session is rejected with `401`. An **absent** header is accepted and
  falls back to the session binding, because many MCP clients only authenticate the SSE connect
  and requiring it per message would 401 every tool call
* The tool list is assembled **once, at connect time**, from the resolved tenant's Account Kit. A
  kit edit mid-session does not retract a listed tool; the execution gate still denies it.
  Reconnect to refresh

## Differences from Original Naive MCP

| Feature                | Original (`@usenaive-sdk/server`)     | v2 (Hosted)            |
| ---------------------- | ------------------------------------- | ---------------------- |
| Transport              | stdio (local process)                 | SSE (remote)           |
| Requires local install | Yes (`npm i -g @usenaive-sdk/server`) | No                     |
| Auth                   | `NAIVE_API_KEY` env var               | Bearer header on SSE   |
| Proxies through        | api.usenaive.ai → Paperclip           | Direct (same instance) |
| Latency                | Two hops                              | Single hop             |
