> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# support

> Contact naive support from the CLI — chat with the support agent, manage your tickets.

```bash theme={"theme":"css-variables"}
naive support ask "How do I raise an agent's card spend cap?"
naive support list
naive support show <ticketId>
naive support send <ticketId> "Still failing after the cap change"
naive support close <ticketId>
```

| Command                                      | What it does                                         | Route                                          |
| -------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| `naive support ask <message...>`             | Open a ticket; the support agent answers immediately | `POST /v1/support/tickets`                     |
| `naive support list`                         | List your tickets                                    | `GET /v1/support/tickets`                      |
| `naive support show <ticketId>`              | Print the full thread                                | `GET /v1/support/tickets/{ticketId}`           |
| `naive support send <ticketId> <message...>` | Reply on a ticket                                    | `POST /v1/support/tickets/{ticketId}/messages` |
| `naive support close <ticketId>`             | Mark it resolved                                     | `POST /v1/support/tickets/{ticketId}/close`    |

## Flags

| Flag                      | on `ask`                                                  |
| ------------------------- | --------------------------------------------------------- |
| `-s, --subject <subject>` | Ticket subject; defaults to the first line of the message |

The agent answers product questions from the docs. Refunds, billing disputes, and account
changes are escalated to the naive team by email; platform bugs are escalated **and** queue an
automated fix sub-agent. Once escalated, a human replies on the same ticket — `naive support
show` (or the dashboard Support page) shows their messages.

<Note>
  `naive support` is the conversational surface. For fire-and-forget bug/feedback reports there
  is also `naive report`, which files an internal issue without opening a chat.
</Note>
