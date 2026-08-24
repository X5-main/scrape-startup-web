# Beds24 ChatGPT MCP Worker Starter

This starter deploys a read-only Beds24 MCP server on Cloudflare Workers. ChatGPT can then use the Worker as a custom app and call Beds24 API V2 tools for properties, bookings, and room-calendar availability.

The Worker exposes only GET/read tools. It does not create, change, cancel, or message bookings.

## What You Need

- ChatGPT web with developer mode/custom app access.
- A Cloudflare account.
- Beds24 API V2 access.
- A Beds24 long-life token with read scopes, or a Beds24 refresh token.
- A random connector bearer token for ChatGPT-to-Worker authentication.

## Beds24 Token Checklist

Create the token in Beds24 under Settings > Marketplace > API. For a read-only ChatGPT setup, use these scopes:

- `read:properties`
- `read:inventory`
- `read:bookings`
- `read:bookings-personal` if you want guest names, email, phone, or message-related guest data.

Avoid `write:*`, `delete:*`, and `all:*` scopes for this starter. Do not use `all:bookings`.

If you manage linked properties, enable "Allow linked properties" when creating the token. Beds24 tokens do not include linked properties by default.

## Deploy

1. Install Node.js 22 or later.
2. Download this `worker-starter` folder.
3. In a terminal, run:

```bash
npm install
```

4. Log in to Cloudflare:

```bash
npx wrangler login
```

5. Set the Beds24 credential. Use one of these, not both:

```bash
npx wrangler secret put BEDS24_TOKEN
```

or:

```bash
npx wrangler secret put BEDS24_REFRESH_TOKEN
```

6. Set a random bearer token for ChatGPT:

```bash
npx wrangler secret put CONNECTOR_BEARER_TOKEN
```

Use a long random value. Save it because you will paste the same value into ChatGPT when configuring the custom app.

7. Dry-run the Worker:

```bash
npm run check
```

8. Deploy:

```bash
npm run deploy
```

9. Open the Worker URL shown by Wrangler. The health page will show the MCP server URL, which ends in `/mcp`.

## Connect It In ChatGPT

1. Open ChatGPT on the web.
2. Enable developer mode or ask your workspace admin to enable it.
3. Go to Settings > Apps and create a custom app.
4. Use the Worker MCP URL from the health page, for example `https://beds24-chatgpt-mcp.your-subdomain.workers.dev/mcp`.
5. If ChatGPT asks for authentication, choose bearer/API key authentication and paste the exact value you set as `CONNECTOR_BEARER_TOKEN`.
6. Click Scan Tools.
7. Create the app.
8. In a new chat, select the draft app and ask: "Run the Beds24 access check."

## Useful First Prompts

- "Run the Beds24 access check and tell me which scopes appear to be missing."
- "Show arrivals this weekend by property. Include guest names only if the token allows it."
- "Which bookings were created in the last 24 hours?"
- "Show availability counts for the next 10 days by property."

## Troubleshooting

- `Unauthorized` from the Worker: ChatGPT is missing the bearer token or it does not match `CONNECTOR_BEARER_TOKEN`.
- Beds24 says token is missing: set `BEDS24_TOKEN` or `BEDS24_REFRESH_TOKEN` as a Cloudflare Worker secret.
- Beds24 returns a scope/permission error: create a new Beds24 token or invite code with the missing read scope. Beds24 scopes cannot be changed after token creation.
- Guest names or phone numbers are missing: add `read:bookings-personal`.
- Linked-property bookings are missing: recreate the token with "Allow linked properties" enabled.
- Data appears one day off: Beds24 booking filters use the property's time zone. Check property time-zone settings.
- ChatGPT cannot scan tools: confirm the server URL ends in `/mcp`, the Worker is deployed, and developer mode/custom apps are enabled for your ChatGPT account or workspace.
- Rate-limit errors: narrow the date range, avoid repeated broad prompts, and wait for the Beds24 five-minute window to reset.

## Security Notes

- Treat the Worker URL and `CONNECTOR_BEARER_TOKEN` as private.
- Keep the Beds24 token in Cloudflare Worker secrets, not in ChatGPT prompts.
- Use read scopes only unless you intentionally fork this starter and add write tools.
- Disconnect the custom app in ChatGPT and delete the Worker secrets to revoke this path.
