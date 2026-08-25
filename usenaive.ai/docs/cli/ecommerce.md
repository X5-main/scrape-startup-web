> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# ecommerce

> Product listings, pricing, sellers, and reviews from Google Shopping and Amazon via the CLI.

## Overview

| Command                             | Description                  | Method           |
| ----------------------------------- | ---------------------------- | ---------------- |
| `naive ecommerce google <endpoint>` | Google Shopping product data | Standard (async) |
| `naive ecommerce amazon <endpoint>` | Amazon product data          | Standard (async) |

All endpoints use the Standard (async) method except Google Shopping Sellers Ad URL.

***

## Google Shopping

```bash theme={"theme":"css-variables"}
naive ecommerce google products --keyword "wireless headphones" --location-code 2840
naive ecommerce google product-info --product-id "abc123"
naive ecommerce google sellers --product-id "abc123"
naive ecommerce google reviews --product-id "abc123"
```

### Endpoints

| Endpoint       | Description                   | Method   |
| -------------- | ----------------------------- | -------- |
| products       | Search product listings       | Standard |
| product-info   | Detailed product information  | Standard |
| sellers        | Seller list for a product     | Standard |
| sellers-ad-url | Get ad click URL for a seller | GET      |
| reviews        | Product reviews               | Standard |

### Options

| Flag                     | Required | Description            |
| ------------------------ | -------- | ---------------------- |
| `--keyword <text>`       | Varies   | Product search keyword |
| `--product-id <id>`      | Varies   | Product identifier     |
| `--location-code <code>` | No       | Location code          |
| `--language-code <code>` | No       | Language code          |
| `--tag <tag>`            | No       | Tag for the task       |

### Sellers Ad URL

Get the ad click URL for a Google Shopping seller:

```bash theme={"theme":"css-variables"}
naive ecommerce google-sellers-ad-url --aclk "encoded_aclk_string"
```

| Flag              | Required | Description                    |
| ----------------- | -------- | ------------------------------ |
| `--aclk <string>` | Yes      | The encoded ad click parameter |

***

## Amazon

```bash theme={"theme":"css-variables"}
naive ecommerce amazon products --keyword "bluetooth speaker" --location-code 2840
naive ecommerce amazon asin --asin "B09XYZ1234"
naive ecommerce amazon sellers --asin "B09XYZ1234"
```

### Endpoints

| Endpoint | Description               | Method   |
| -------- | ------------------------- | -------- |
| products | Search product listings   | Standard |
| asin     | Get product info by ASIN  | Standard |
| sellers  | Seller list for a product | Standard |

### Options

| Flag                     | Required | Description            |
| ------------------------ | -------- | ---------------------- |
| `--keyword <text>`       | Varies   | Product search keyword |
| `--asin <id>`            | Varies   | Amazon ASIN            |
| `--location-code <code>` | No       | Location code          |
| `--language-code <code>` | No       | Language code          |
| `--tag <tag>`            | No       | Tag for the task       |

***

## Task Management

All async endpoints return a task ID:

```bash theme={"theme":"css-variables"}
# Submit task
naive ecommerce google products --keyword "headphones"
# → task_id: abc-123

# Check ready tasks
naive ecommerce tasks-ready --platform google --endpoint products

# Get results
naive ecommerce task-get abc-123 --platform google --endpoint products

# Get HTML format
naive ecommerce task-get abc-123 --platform google --endpoint products --format html

# Get advanced format
naive ecommerce task-get abc-123 --platform google --endpoint products --format advanced
```

| Flag                                                               | Description                         |
| ------------------------------------------------------------------ | ----------------------------------- |
| `naive ecommerce tasks-ready --platform <p> --endpoint <e>`        | List tasks with ready results       |
| `naive ecommerce task-get <task_id> --platform <p> --endpoint <e>` | Retrieve results for a task         |
| `--format <type>`                                                  | Output format: `advanced` or `html` |
