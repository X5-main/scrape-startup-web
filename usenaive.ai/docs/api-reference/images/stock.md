> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Stock Photos

> GET /v1/images/stock — Search stock photos (free).

<ParamField query="query" type="string" required>
  Search query
</ParamField>

<ParamField query="count" type="number" default="10">
  Number of results (1-80)
</ParamField>

<ParamField query="orientation" type="string">
  `"landscape"` | `"portrait"` | `"square"`
</ParamField>

<ParamField query="color" type="string">
  Filter by dominant color: `red`, `orange`, `yellow`, `green`, `turquoise`, `blue`, `violet`, `pink`, `brown`, `black`, `gray`, `white`
</ParamField>

<ParamField query="size" type="string">
  Minimum photo size: `"large"` (24MP+) | `"medium"` (12MP+) | `"small"`
</ParamField>

<RequestExample>
  ```bash theme={"theme":"css-variables"}
  curl "https://api.usenaive.ai/v1/images/stock?query=office+workspace&count=10&orientation=landscape" \
    -H "Authorization: Bearer nv_sk_live_..."
  ```
</RequestExample>

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "photos": [
      {
        "id": "stock-123",
        "url": "https://stock.example.com/photo/123",
        "photographer": "John Doe",
        "alt": "Modern office workspace with laptop",
        "width": 1920,
        "height": 1080,
        "src": {
          "original": "https://images.example.com/photos/123/photo-123.jpeg",
          "large": "https://images.example.com/photos/123/photo-123.jpeg?w=940",
          "medium": "https://images.example.com/photos/123/photo-123.jpeg?w=350",
          "small": "https://images.example.com/photos/123/photo-123.jpeg?w=130"
        }
      }
    ],
    "total": 500,
    "credits_used": 0
  }
  ```
</ResponseExample>

**Cost:** Free (0 credits)
