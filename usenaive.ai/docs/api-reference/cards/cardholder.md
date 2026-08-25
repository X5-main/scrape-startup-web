> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Cardholder

> Get the company's virtual card cardholder

Retrieves the cardholder profile associated with your company. Returns `null` if no cardholder has been created yet.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/cards/cardholder \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "cardholder": {
      "id": "ich_1abc123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@acme.com",
      "phone": "+14155551234",
      "billingLine1": "123 Main St",
      "billingCity": "San Francisco",
      "billingState": "CA",
      "billingPostalCode": "94105",
      "billingCountry": "US",
      "type": "individual",
      "status": "active",
      "created_at": "2026-01-15T10:00:00Z"
    }
  }
  ```
</ResponseExample>

If no cardholder exists yet, the response will be:

```json theme={"theme":"css-variables"}
{
  "cardholder": null
}
```
