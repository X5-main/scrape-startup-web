> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Card Details

> Get card credentials (number, CVC, expiry)

Retrieves the sensitive card credentials. Response format depends on the card provider.

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl https://api.usenaive.ai/v1/cards/card-uuid-1/details \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "card_id": "card-uuid-1",
    "provider": "managed_virtual",
    "number": "4242424242424242",
    "cvc": "123",
    "exp_month": 12,
    "exp_year": 2028,
    "cardholder_name": "John Doe",
    "billing_address": {
      "line1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105",
      "country": "US"
    }
  }
  ```
</ResponseExample>

### Response by Provider

**Managed virtual cards** (`provider: "managed_virtual"`):

| Field             | Type   | Description                  |
| ----------------- | ------ | ---------------------------- |
| `card_id`         | string | Card UUID                    |
| `number`          | string | Full card number (16 digits) |
| `cvc`             | string | 3-digit security code        |
| `exp_month`       | number | Expiration month (1-12)      |
| `exp_year`        | number | Expiration year (4 digits)   |
| `cardholder_name` | string | Name on card                 |
| `billing_address` | object | Billing address details      |

**Prepaid gift cards** (`provider: "prepaid_gift"`):

| Field     | Type   | Description    |
| --------- | ------ | -------------- |
| `card_id` | string | Card UUID      |
| `number`  | string | Redeem code    |
| `pin`     | string | PIN code       |
| `type`    | string | `prepaid_gift` |

## CLI

```bash theme={"theme":"css-variables"}
naive cards details <id>
```

## MCP

Tool: `naive_cards_details`

```json theme={"theme":"css-variables"}
{
  "card_id": "card-uuid-1"
}
```
