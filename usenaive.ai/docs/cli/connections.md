> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# connections

> 3rd-party connections from the CLI.

> `naive integrations` is kept as an alias for `naive connections`.

```bash theme={"theme":"css-variables"}
naive connections list --user alice
naive connections connect gmail --user alice
naive connections disconnect gmail --user alice [--purge]
naive connections tools gmail --user alice
naive connections execute gmail GMAIL_SEND_EMAIL --user alice \
  --args '{"recipient_email":"lead@example.com","subject":"Hi","body":"..."}'
```

Omit `--user` to act on the active user (`naive use`) or the api key's default. All calls
are filtered by the user's AccountKit.
