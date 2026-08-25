> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# email

> Per-user inboxes + sending.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);
await client.email.createInbox({ local_part: "outreach" });
await client.email.listInboxes();
await client.email.deleteInbox(inboxId);
await client.email.send({ from_inbox, to, subject, body }); // from_inbox = inbox id or address

// Inbound (received) email
await client.email.inbox({ inboxId, limit: 20 }); // list received messages
await client.email.getEmail(emailId);             // one message (sent or received)
```

Gated by the `email` primitive in the user's AccountKit. Inbound deliveries can also trigger the [`email.received` webhook](/docs/getting-started/webhooks).
