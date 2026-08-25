> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Search Domain

> Check if a domain is available for purchase

### Query Parameters

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `domain`  | string | Yes      | Domain to search for (e.g., `example.com`) |

### Response

```json theme={"theme":"css-variables"}
{
  "domain": "coolstartup.ai",
  "available": true,
  "price": 25,
  "priceInCents": 2500,
  "currency": "usd"
}
```

`price` / `priceInCents` are **dynamic**: the registrar's live wholesale quote for
this exact domain (TLDs differ — `.ai` ≠ `.com`) plus a flat **\$2** Naïve markup.
The `25` above is an example, not a fixed rate — always read the returned value.
Purchases are charged in USD at checkout, not in credits.

If the domain is available, use `POST /v1/domains/purchase` to buy it.
