> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# List NAICS Codes

> GET /v1/formation/naics-codes — List available NAICS industry codes for formation.

Returns the full list of NAICS codes and industries available for company formation. Use the `naicsCodeId` when submitting a formation.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/formation/naics-codes \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "naics_codes": [
      {
        "naicsCodeId": "31tizctUA0I3WDKKH5PMw1mYjE0",
        "naicsCode": "812990",
        "industry": "Personal Services"
      },
      {
        "naicsCodeId": "2o8v0kcaCWyPyi3LJFsCiTCFSyk",
        "naicsCode": "541511",
        "industry": "Custom Computer Programming Services"
      }
    ]
  }
  ```
</ResponseExample>
