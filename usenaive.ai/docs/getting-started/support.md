> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Support

> Chat with naive support from the dashboard or CLI — answered by the hosted support agent, escalated to humans when needed.

naive support is a chat surface built into the platform. Every conversation is a **ticket**
answered first by the hosted support agent, which:

* answers product questions grounded in these docs,
* escalates anything that needs manual intervention (refunds, billing disputes, account
  changes) to the naive team by email,
* files platform **bugs** to the team *and* queues an automated fix sub-agent that pulls the
  platform repository, root-causes the issue, and opens a pull request.

When a ticket is escalated, a human from the naive team takes over and replies on the same
thread — in the dashboard you'll see their messages appear live.

## From the dashboard

Click the chat beacon in the bottom-right corner of any dashboard screen (or open
**Support** in the sidebar at [dashboard.usenaive.ai/support](https://dashboard.usenaive.ai/support)).
Start a conversation; the agent replies in seconds, with full markdown. Escalated tickets
show a "With the team" badge, and human replies appear on the same thread.

## From the CLI

```bash theme={"theme":"css-variables"}
naive support ask "My agent's card decline says spend_cap_exceeded but the cap looks fine"
naive support list
naive support show <ticketId>
naive support send <ticketId> "Here is the error output..."
naive support close <ticketId>
```

See the [CLI reference](/docs/cli/support) for details.

## By email

Email [support@usenaive.ai](mailto:support@usenaive.ai) from any address. Your message
opens a ticket answered by the same support agent, and every reply — agent or human —
comes back on the same email thread. If you write from the address on your naive account,
the ticket is linked to it and also appears in your dashboard ticket list.

## From the API

| Route                                          | What it does                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------- |
| `POST /v1/support/tickets`                     | Open a ticket with a first message; the agent replies in the same call |
| `GET /v1/support/tickets`                      | List your tickets                                                      |
| `GET /v1/support/tickets/{ticketId}`           | Ticket + full thread                                                   |
| `POST /v1/support/tickets/{ticketId}/messages` | Send a message (agent replies unless a human holds the ticket)         |
| `POST /v1/support/tickets/{ticketId}/close`    | Mark resolved                                                          |

<Note>
  Escalations always email the naive team. Bug reports additionally queue the automated fix
  sub-agent; you'll be notified on the ticket when a human follows up.
</Note>
