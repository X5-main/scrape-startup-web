> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List Template Apps

> GET /v1/template-apps — List installed template app instances for the current company.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/template-apps \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "apps": [
      {
        "id": "uuid",
        "companyId": "company-uuid",
        "templateAppType": "media-asset-manager",
        "name": "Media Asset Manager",
        "config": null,
        "status": "active",
        "createdAt": "2026-05-19T12:00:00.000Z"
      }
    ],
    "count": 1
  }
  ```
</ResponseExample>

Returns all active template app instances installed for the company. Template apps are custom UI experiences distinct from managed web apps.
