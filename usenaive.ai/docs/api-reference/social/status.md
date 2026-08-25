> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Social Status

> GET /v1/social/status — Check whether social posting is activated and list connected accounts.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/social/status \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "activated": true,
    "team_count": 3,
    "accounts": [
      {
        "id": "acc-uuid-1",
        "platform": "TWITTER",
        "username": "acmecorp",
        "display_name": "Acme Corp",
        "avatar_url": "https://pbs.twimg.com/profile_images/.../photo.jpg",
        "label": null,
        "status": "active"
      },
      {
        "id": "acc-uuid-2",
        "platform": "LINKEDIN",
        "username": "acme-corp",
        "display_name": "Acme Corp",
        "avatar_url": "https://media.licdn.com/.../photo.jpg",
        "label": "Company Page",
        "status": "active"
      }
    ]
  }
  ```
</ResponseExample>
