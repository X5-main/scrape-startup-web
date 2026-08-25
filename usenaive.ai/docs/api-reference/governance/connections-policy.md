> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Connection policy

> GET /v1/connections/policy, /toolkits and /toolkits/{toolkit}/tools — the resolved connection policy, and the wide: true field that stops it being invisible.

The connection family is the **widest governed lane an agent reaches**. These
three reads report what policy actually says about it.

<Warning>
  **On every AccountKit this build can create, the answer is `mode: "open"` — every
  toolkit and every tool in it is reachable.**

  Both kit-creation paths hardcode `mode: "open"`, which omits the toolkit list
  entirely. The engine implements per-toolkit and per-tool filtering in full; it is
  inert because no kit ever names a toolkit. `wide: true` is a field of its own
  precisely so this is not something you have to infer.
</Warning>

## The resolved policy

```
GET /v1/connections/policy?tenant=<tenant_user_id>
```

<ResponseExample>
  ```json 200 theme={"theme":"css-variables"}
  {
    "tenant_user_id": "8f1c…",
    "kit_id": "kit-…",
    "mode": "open",
    "wide": true,
    "wide_because": "mode 'open' omits the toolkit list entirely, so every Composio toolkit and every tool in it is reachable. The engine implements toolkitAllowed/toolAllowed in full; nothing is calling it.",
    "toolkits": null,
    "tools": {},
    "approval": {
      "requires_approval": null,
      "approval_toolkits": null,
      "connect_action_id": "connections.connect",
      "connect_defaults_to_approval": true
    },
    "custom_auth_configs": []
  }
  ```
</ResponseExample>

### `toolkits: null` does not mean "none"

Under `mode: "open"` the toolkit list is **omitted**, not empty. `null` here means
*all of them*. An empty array would read as the opposite, which is why the API
returns `null` and why `wide` exists as its own boolean.

| `mode`      | `toolkits` | Meaning                              |
| ----------- | ---------- | ------------------------------------ |
| `open`      | `null`     | every toolkit is reachable           |
| `allowlist` | array      | only the listed toolkits             |
| `denylist`  | array      | every toolkit except the listed ones |

### Connecting versus executing

Two different decisions, and only the first has an action id.

* **Connecting** is `connections.connect`, a regular action id that defaults to
  human approval (`connect_defaults_to_approval`).
* **Executing** a tool through a connection is a different evaluation kind
  entirely, dispatched with the toolkit and tool as data. There is no
  `connections.execute:<toolkit>` action id, and minting one would create a third
  representation of a decision the engine already makes two ways.

***

## Which toolkits policy names

```
GET /v1/connections/toolkits?tenant=<tenant_user_id>
```

<Note>
  **This answers from the policy, never from the provider catalogue.** Under
  `mode: "open"` policy names nothing, so `items` is `null` and `governed_count` is
  `0` — the honest answer to "which toolkits does policy name".

  This is deliberately *not* a listing of the provider's \~1,000 toolkits. That
  listing is already reachable elsewhere; a second copy of it under a
  policy-adjacent path would read as an endorsement.
</Note>

```json 200 theme={"theme":"css-variables"}
{
  "mode": "open",
  "wide": true,
  "wide_because": "…",
  "items": null,
  "governed_count": 0,
  "note": "this list is what POLICY names, not what the provider offers. Under mode 'open' policy names nothing and every toolkit is reachable."
}
```

***

## The per-toolkit tool filter

```
GET /v1/connections/toolkits/{toolkit}/tools?tenant=<tenant_user_id>
```

```json 200 theme={"theme":"css-variables"}
{
  "toolkit": "gmail",
  "mode": "open",
  "wide": true,
  "toolkit_reachable": true,
  "enable": null,
  "disable": null,
  "approval_required": false,
  "note": "enable/disable are the per-toolkit tool filter the engine enforces. null means the policy sets no filter for this toolkit, which under mode 'open' means every tool in it is reachable."
}
```

| Field                | Meaning                                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `toolkit_reachable`  | Under `open`, always `true`. Under `allowlist`, whether the toolkit is listed. Under `denylist`, whether it is *not*. |
| `enable` / `disable` | The tool filter for this toolkit. `null` means no filter is set — which under `open` means every tool is reachable.   |
| `approval_required`  | Whether executing against this toolkit requires human approval for this tenant.                                       |

## Related

* [Connections API](/docs/api-reference/connections/list) — the tenant-facing connection surface
* [`GET /v1/limits`](/docs/api-reference/governance/limits) — reports the same `connections` fact in `surface_honesty`
