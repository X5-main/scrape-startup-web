> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Link Account (Retired)

> POST /v1/auth/link — retired legacy verification-code endpoint.

<Warning>
  This endpoint is retired because the legacy flow never delivered its in-memory
  six-digit code. It now returns `400 invalid_input` and never claims that an
  email was sent.
</Warning>

Use the durable CLI email magic-link flow instead:

```bash theme={"theme":"css-variables"}
naive auth email existing@example.com
```

There is **no `naive link` command**. It was removed together with this endpoint
and is not registered on any released CLI; `naive link` falls through to the
unknown-command handler.

Direct API clients should use `POST /v1/auth/register`, `POST /v1/auth/login`, or
the browser OAuth flow.

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
