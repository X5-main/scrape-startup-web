> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# AccountKits

> Policy templates that govern what a tenant user's agents can do.

An **AccountKit** is a reusable policy template: author a few kits ("Starter", "Pro",
"Enterprise") and assign users to them. A kit controls which native **primitives** are
enabled and which third-party **apps** a user may connect.

## Kits live in a project

A kit belongs to one [project](/docs/architecture/projects) (`account_kits.project_id`), and
so does every child project it governs. Assignment does not cross the boundary:
pointing a child project at a kit from another project is a `404`. Kits that predate
the projects layer belong to the organization's default project, where every un-scoped
call still lands. Each project provisions its own default kit and default child
project.

```jsonc theme={"theme":"css-variables"}
{
  "name": "Pro",
  "primitives_config": {
    "cards":  { "enabled": true, "defaults": { "spending_limit_cents": 250000 } },
    "email":  { "enabled": true },
    "vault":  { "enabled": true },
    "social": { "enabled": false }
  },
  "connections_config": {
    "mode": "allowlist",
    "toolkits": ["gmail", "slack", "stripe", "hubspot", "notion", "linear"],
    "tools": { "gmail": { "enable": ["GMAIL_FETCH_EMAILS", "GMAIL_SEND_EMAIL"] } },
    "custom_auth_configs": { "gmail": "ac_brand_gmail" }
  }
}
```

## App filter — three modes

| Mode        | Behavior                                                   |
| ----------- | ---------------------------------------------------------- |
| `open`      | No filter — every third-party app available (the default). |
| `allowlist` | Only the listed `toolkits` are available.                  |
| `blocklist` | Every app except the listed ones.                          |

`allowlist` and `blocklist` are mutually exclusive — modeled as
`toolkits: { enable }` vs `{ disable }`.

## Per-tool filter

Within an allowed toolkit, restrict to specific tools with
`tools.<toolkit>.enable` or `.disable` (mutually exclusive). E.g. allow Gmail but only
read + send.

## White-label

`custom_auth_configs.<toolkit>` pins your own provider auth config id for an app, so
the OAuth consent screen shows *your* brand instead of Naive's or the provider's.

## Governance — require approval

Each gated primitive accepts `requiresApproval`, and connections accept
`requiresApproval` / `approvalToolkits`. When on, an agent's sensitive action is
frozen as a pending [approval](/docs/architecture/approvals) (HTTP 202) until a human
approves it.

```jsonc theme={"theme":"css-variables"}
{
  "primitives_config": {
    "cards":   { "enabled": true, "requiresApproval": true },
    "domains": { "enabled": true, "requiresApproval": true },
    "social":  { "enabled": true, "requiresApproval": false }
  },
  "connections_config": {
    "mode": "open",
    "requiresApproval": false,
    "approvalToolkits": ["stripe"]   // only Stripe connects need approval
  }
}
```

### What requires approval by default

The built-in set (`DEFAULT_APPROVAL_ACTIONS`) covers every action that spends,
registers with a regulator, creates a real third-party account, or destroys knowledge:

| Family          | Actions gated by default                                                            |
| --------------- | ----------------------------------------------------------------------------------- |
| **cards**       | `cards.create`, `cards.cardholder.create`, `cards.topup`                            |
| **trading**     | `trading.order.create`, `trading.order.cancel`, `trading.position.close`            |
| **identity**    | `domains.purchase`, `verification.start`, `formation.create`, `formation.submit`    |
| **connections** | `connections.connect`                                                               |
| **browser**     | `browser.signup` (creates a real account + stores a credential)                     |
| **compute**     | `compute.create`, `compute.exec` (`exec` opens an interactive shell)                |
| **phone**       | `phone.provision`, `phone.voice_enable`, `phone.call`                               |
| **brain**       | `brain.kb.delete`, `brain.document.delete`, `brain.forget`, `brain.proposal.accept` |
| **mobile**      | the mutating device actions                                                         |

Sending email and SMS are **not** gated by default. Set `requiresApproval` per
primitive to opt in or out.

Two callers bypass the gate entirely: a **signed-in human**, and an agent acting on the
**company's default tenant\_user**. Only an agent (API key / MCP) acting on a
*non-default* tenant user is gated — see [Approvals](/docs/architecture/approvals).

## How it maps to the connections provider

Naive translates a kit to the provider's session config:

| Kit                   | Provider session config           |
| --------------------- | --------------------------------- |
| `mode: "open"`        | `toolkits` omitted (full catalog) |
| `mode: "allowlist"`   | `toolkits: { enable: [...] }`     |
| `mode: "blocklist"`   | `toolkits: { disable: [...] }`    |
| `tools`               | passed through unchanged          |
| `custom_auth_configs` | `authConfigs`                     |

The default kit on signup is `mode: "open"` with every native primitive enabled.
