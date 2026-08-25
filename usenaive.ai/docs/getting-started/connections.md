> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connections

> 3rd-party app access — per user, governed by the Account Kit. Connect Gmail, Slack, GitHub, Stripe, Notion and 1,000+ apps for each of your end-users.

**Connections** give a [tenant user's](/docs/getting-started/users) agents authenticated
access to 1,000+ third-party apps (Gmail, Slack, GitHub, Stripe, Notion, …). Every
connection is per-user and gated by the user's
[Account Kit](/docs/getting-started/account-kits). Naive keeps a local mirror of connection
status so reads are cheap; execute-time auth always goes through the connections provider.

## CLI First

```bash theme={"theme":"css-variables"}
naive connections list --user alice
naive connections connect gmail --user alice
naive connections execute gmail GMAIL_SEND_EMAIL --user alice --args '{"recipient_email":"lead@co.com","subject":"Hi","body":"..."}'
```

## Tools

| Tool                     | Type       | Description                                                                          |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------ |
| `connections_list`       | Core       | List apps available to a user (filtered by their Account Kit) with connection status |
| `connections_connected`  | Core       | List the user's active/expired connections (from the mirror)                         |
| `connections_connect`    | Core       | Start a connect flow — returns a hosted redirect link                                |
| `connections_tools`      | Core       | List the tools an app exposes                                                        |
| `connections_execute`    | Core       | Execute a specific tool for the user                                                 |
| `connections_disconnect` | Management | Disconnect (optionally purge) an app for the user                                    |

## Pricing

| Action                                           | Credits |
| ------------------------------------------------ | ------- |
| `connections_execute` (per tool call)            | Free    |
| Listing apps, listing tools, connect, disconnect | Free    |

Connections are free end to end today — executing a tool included.

## Connecting an App

`connect` returns a hosted `redirectUrl`. Send the user there; once they finish auth the
connection becomes `ACTIVE`. This is a **sensitive** action and may require
[approval](/docs/getting-started/approvals) depending on the Account Kit.

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/{user_id}/connections/connect \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "toolkit": "gmail", "callback_url": "https://myapp.com/oauth/callback" }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  const res = await naive.forUser(alice.id).connections.connect("gmail", {
    callbackUrl: "https://myapp.com/oauth/callback",
  });
  // Send the user to res.redirectUrl. After they finish, the connection becomes ACTIVE.
  ```
</CodeGroup>

**Response:**

```json theme={"theme":"css-variables"}
{
  "status": "INITIATED",
  "toolkit": "gmail",
  "redirectUrl": "https://connect.example.com/link/lk_xxx",
  "connectedAccountId": "ca_xxx"
}
```

### Parameters

| Param          | Type   | Required | Description                                                         |
| -------------- | ------ | -------- | ------------------------------------------------------------------- |
| `toolkit`      | string | Yes      | App slug (e.g. `gmail`, `slack`, `stripe`) — see `GET /v1/toolkits` |
| `callback_url` | string | No       | Where the user is returned after auth                               |

## Executing a Tool

Once connected, execute any of the app's tools:

<CodeGroup>
  ```bash curl theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/users/{user_id}/connections/gmail/execute \
    -H "Authorization: Bearer nv_sk_your_key" \
    -H "Content-Type: application/json" \
    -d '{ "tool": "GMAIL_SEND_EMAIL", "arguments": { "recipient_email": "lead@co.com", "subject": "Hi", "body": "..." } }'
  ```

  ```javascript JavaScript theme={"theme":"css-variables"}
  await naive.forUser(alice.id).connections.execute("gmail", "GMAIL_SEND_EMAIL", {
    recipient_email: "lead@co.com",
    subject: "Hi",
    body: "...",
  });
  ```
</CodeGroup>

## Listing & Status

```bash theme={"theme":"css-variables"}
# Apps available to the user (filtered by their Account Kit) + connection status
curl https://api.usenaive.ai/v1/users/{user_id}/connections \
  -H "Authorization: Bearer nv_sk_your_key"

# Just the user's active/expired connections (cheap mirror read)
curl https://api.usenaive.ai/v1/users/{user_id}/connections/connected \
  -H "Authorization: Bearer nv_sk_your_key"
```

<Info>
  Connection status is read from Naive's local mirror; `INITIATED` rows older than \~10s are
  refreshed before responding. See [Connection status](/docs/architecture/connection-webhooks).
</Info>

## Error Handling

| Error                    | Cause                                                 | Recovery                                                      |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| `feature_not_configured` | 3rd-party connections aren't enabled on the workspace | Contact support to enable them                                |
| `forbidden`              | The user's Account Kit doesn't permit this app        | Adjust the kit's allow/block list                             |
| `pending_approval` (202) | The connect was gated for human approval              | Approve via the [Approvals](/docs/getting-started/approvals) queue |
| `not_found`              | Invalid `user_id`                                     | Use `GET /v1/users` for valid ids                             |

## Typical Workflow

```
Agent needs to email a lead from Alice's Gmail
    │
    ├─ GET  /v1/users/alice/connections?search=gmail   → Is Gmail available + connected?
    │
    ├─ POST /v1/users/alice/connections/connect        → Not connected → get redirectUrl
    │   { toolkit: "gmail" }                              (send Alice to finish OAuth)
    │
    ├─ GET  /v1/users/alice/connections/connected      → status: ACTIVE ✓
    │
    └─ POST /v1/users/alice/connections/gmail/execute  → Send the email
        { tool: "GMAIL_SEND_EMAIL", arguments: {...} }
```
