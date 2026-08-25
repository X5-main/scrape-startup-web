> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# E-commerce API Reference

> All E-commerce REST endpoints — Google Shopping and Amazon.

## Overview

Company-scoped; requires `Authorization: Bearer nv_sk_…`. Pay-per-use via our data provider.

All product/info/seller/review endpoints are **Standard (async)**: POST to `…/task` to enqueue, poll `…/tasks-ready`, then fetch `…/task/:id` (an `…/task/:id/html` variant returns the raw HTML). MCP equivalents: `naive_ecommerce_discover` + `naive_ecommerce_execute(_async)`.

Common params: `keyword` (product search), `product_id` (Google Shopping), `asin` (Amazon), optional `location_code`, `language_code`, `depth`.

## Google Shopping

| Method | Path                                              | Description                     |
| ------ | ------------------------------------------------- | ------------------------------- |
| POST   | `/v1/ecommerce/google/products/task`              | Submit product search task      |
| GET    | `/v1/ecommerce/google/products/tasks-ready`       | Check ready search tasks        |
| GET    | `/v1/ecommerce/google/products/task/:id`          | Get product results             |
| GET    | `/v1/ecommerce/google/products/task/:id/html`     | Get product results (HTML)      |
| POST   | `/v1/ecommerce/google/product-info/task`          | Submit product info task        |
| GET    | `/v1/ecommerce/google/product-info/tasks-ready`   | Check ready info tasks          |
| GET    | `/v1/ecommerce/google/product-info/task/:id`      | Get product info results        |
| GET    | `/v1/ecommerce/google/product-info/task/:id/html` | Get product info results (HTML) |
| POST   | `/v1/ecommerce/google/sellers/task`               | Submit sellers task             |
| GET    | `/v1/ecommerce/google/sellers/tasks-ready`        | Check ready seller tasks        |
| GET    | `/v1/ecommerce/google/sellers/task/:id`           | Get seller results              |
| GET    | `/v1/ecommerce/google/sellers/task/:id/html`      | Get seller results (HTML)       |
| GET    | `/v1/ecommerce/google/sellers/ad-url/:aclk`       | Get ad click URL for a seller   |
| POST   | `/v1/ecommerce/google/reviews/task`               | Submit reviews task             |
| GET    | `/v1/ecommerce/google/reviews/tasks-ready`        | Check ready review tasks        |
| GET    | `/v1/ecommerce/google/reviews/task/:id`           | Get review results              |
| GET    | `/v1/ecommerce/google/reviews/task/:id/html`      | Get review results (HTML)       |

## Amazon

| Method | Path                                          | Description                |
| ------ | --------------------------------------------- | -------------------------- |
| POST   | `/v1/ecommerce/amazon/products/task`          | Submit product search task |
| GET    | `/v1/ecommerce/amazon/products/tasks-ready`   | Check ready search tasks   |
| GET    | `/v1/ecommerce/amazon/products/task/:id`      | Get product results        |
| GET    | `/v1/ecommerce/amazon/products/task/:id/html` | Get product results (HTML) |
| POST   | `/v1/ecommerce/amazon/asin/task`              | Submit ASIN lookup task    |
| GET    | `/v1/ecommerce/amazon/asin/tasks-ready`       | Check ready ASIN tasks     |
| GET    | `/v1/ecommerce/amazon/asin/task/:id`          | Get ASIN results           |
| GET    | `/v1/ecommerce/amazon/asin/task/:id/html`     | Get ASIN results (HTML)    |
| POST   | `/v1/ecommerce/amazon/sellers/task`           | Submit sellers task        |
| GET    | `/v1/ecommerce/amazon/sellers/tasks-ready`    | Check ready seller tasks   |
| GET    | `/v1/ecommerce/amazon/sellers/task/:id`       | Get seller results         |
| GET    | `/v1/ecommerce/amazon/sellers/task/:id/html`  | Get seller results (HTML)  |

## Utility

| Method | Path                             | Description                |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/v1/ecommerce/google/locations` | Available Google locations |
| GET    | `/v1/ecommerce/google/languages` | Available Google languages |
| GET    | `/v1/ecommerce/amazon/locations` | Available Amazon locations |
| GET    | `/v1/ecommerce/amazon/languages` | Available Amazon languages |
| POST   | `/v1/ecommerce/id-list`          | List task IDs              |

## Example (async flow)

```bash theme={"theme":"css-variables"}
# 1. Enqueue an Amazon product search
curl -X POST https://api.usenaive.ai/v1/ecommerce/amazon/products/task \
  -H "Authorization: Bearer nv_sk_your_key" \
  -H "Content-Type: application/json" \
  -d '{ "keyword": "wireless headphones", "location_code": 2840, "language_code": "en" }'

# 2. Poll, then 3. fetch results
curl https://api.usenaive.ai/v1/ecommerce/amazon/products/tasks-ready \
  -H "Authorization: Bearer nv_sk_your_key"
curl https://api.usenaive.ai/v1/ecommerce/amazon/products/task/TASK_ID \
  -H "Authorization: Bearer nv_sk_your_key"
```
