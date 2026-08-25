> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Verify Code (Retired)

> POST /v1/auth/verify — retired legacy verification-code endpoint.

<Warning>
  The six-digit verification-code flow is retired. This endpoint now returns
  `400 invalid_input` and does not mint an API key.
</Warning>

Use the durable CLI email magic-link flow instead:

```bash theme={"theme":"css-variables"}
naive auth email existing@example.com
```

Direct API clients should use `POST /v1/auth/register`,
`POST /v1/auth/login`, or the browser OAuth flow.

<Note>
  The CLI's `naive verify` command still exists, and it is a **refusal**: it makes no
  request, reaches no endpoint, and prints the two commands that do work
  (`naive auth email <email>`, `naive auth google`). It is retired rather than
  deprecated — the flow was removed for security and has no successor, so upgrading
  the CLI will not bring it back.
</Note>

<ResponseExample>
  ```json 400 theme={"theme":"css-variables"}
  {
    "error": {
      "code": "invalid_input",
      "message": "Legacy verification-code sign-in has been retired",
      "hint": "Run `naive auth email <email>` to use the durable email magic-link flow."
    }
  }
  ```
</ResponseExample>
