> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Accounts

> GET /v1/social/accounts — List all connected social accounts.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/social/accounts \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "accounts": [
      {
        "id": "acc-uuid-1",
        "platform": "TWITTER",
        "username": "acmecorp",
        "display_name": "Acme Corp",
        "avatar_url": "https://pbs.twimg.com/profile_images/.../photo.jpg",
        "external_id": "12345678",
        "label": null,
        "status": "active",
        "team_id": "team-uuid"
      },
      {
        "id": "acc-uuid-2",
        "platform": "LINKEDIN",
        "username": "acme-corp",
        "display_name": "Acme Corp",
        "avatar_url": "https://media.licdn.com/.../photo.jpg",
        "external_id": "urn:li:organization:87654321",
        "label": "Company Page",
        "status": "active",
        "team_id": "team-uuid"
      }
    ]
  }
  ```
</ResponseExample>
