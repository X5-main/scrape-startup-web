> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Login

> POST /v1/auth/login — Authenticate with email and password to get a fresh API key.

<ParamField body="email" type="string" required>
  Account email address
</ParamField>

<ParamField body="password" type="string" required>
  Account password
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl -X POST https://api.usenaive.ai/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "owner@example.com",
      "password": "securepassword123"
    }'
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "api_key": "nv_sk_live_xyz789...",
    "agent_id": "uuid",
    "company_id": "uuid",
    "company_name": "Acme Corp",
    "companies": [
      { "id": "uuid-1", "name": "Acme Corp" },
      { "id": "uuid-2", "name": "Side Project" }
    ],
    "hint": "You have multiple companies. Use POST /v1/auth/select-company to switch."
  }
  ```
</ResponseExample>

## What this does

1. Verifies email and password against the credential account
2. Finds all companies the user has access to
3. Selects the first company (user can switch with `select-company`)
4. Finds or creates an API agent for that company
5. Issues a fresh API key

## Notes

* No authentication required (public endpoint)
* Each login creates a **new** API key (old keys remain valid)
* If the user has multiple companies, the response includes the full list
* Works with the same credentials used on the Naive dashboard
* Returns `401` for invalid email/password combinations
* Social-login accounts (no password) should use `naive auth email <email>` or `naive auth google`
* CLI: `naive login --email owner@example.com --password mypassword`

## Error responses

| Status | Code                      | When                           |
| ------ | ------------------------- | ------------------------------ |
| 400    | `invalid_input`           | Missing email or password      |
| 401    | `unauthorized`            | Invalid email or password      |
| 403    | `account_not_provisioned` | No companies found for account |
