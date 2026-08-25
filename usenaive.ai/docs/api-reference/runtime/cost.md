> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Cost

> GET …/cost — spend for a team's tenant, bucketed by action, over the tenant's own budget window.

```
GET /v1/teams/{team}/tenants/{tenantUserId}/cost?by=action
```

Real rows from the tenant spend ledger, grouped by action type.

<Warning>
  This reads the platform's own ledger (`tenant_spend_events`) on both runtimes. A durable
  tenant's compute reaches it only if the runtime's usage push is delivered **and** the
  tenant has an agent-profile budget group; otherwise `buckets` is `[]` — which is not the
  same as "this tenant spent nothing". The same caveat applies to `spend.spent_cents` on
  [the team header](/docs/api-reference/runtime/teams).
</Warning>

### Query parameters

| Name | Values   | Notes                                                                                                                                                                                                                     |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `by` | `action` | The **only** accepted value. Anything else is `400 invalid_input` with the message `by must be "action" (the only bucketing this build can compute)`. Bucketing by role or by model needs a manifest, and none is stored. |

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "period": { "name": "month", "start": "2026-07-01T00:00:00.000Z" },
    "buckets": [
      { "key": "llm.chat",   "cents": 1240, "class": "meter", "cap_cents": null, "enforced": false },
      { "key": "email.send", "cents":  600, "class": "meter", "cap_cents": null, "enforced": false }
    ]
  }
  ```
</ResponseExample>

## The window is the tenant's, not the calendar's

`period` comes from the tenant's AccountKit budget — a weekly cap gives a weekly window.
With no budget declared, the window falls back to the calendar month and `cap_cents` is
`null`.

## `enforced` on this endpoint is always `false`

Two endpoints on this surface report `enforced`, answering different questions:

| Endpoint                                               | `enforced` means                                                                       |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| [`GET …/{tenantUserId}`](/docs/api-reference/runtime/teams) | *Is this tenant's declared cap a hard cap?* `true` when the AccountKit budget is hard. |
| `GET …/cost` (this page)                               | *Does anything refuse a call on the basis of this bucket?* Always `false`.             |

The per-bucket rows here are recorded after the spend happens — a meter, never a reserve.
To know whether a cap will actually stop anything, read `spend.class` / `spend.enforced`
on the team header, or [`GET /v1/spend`](/docs/api-reference/governance/spend).

## Related

* [`GET /v1/spend`](/docs/api-reference/governance/spend) — the company-wide view, one row per tenant, with each tenant's cap and whether it is enforced
* [`GET /v1/limits`](/docs/api-reference/governance/limits) — the ceilings that bound this surface
