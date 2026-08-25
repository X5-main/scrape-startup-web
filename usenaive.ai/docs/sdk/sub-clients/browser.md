> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# browser

> Cloud browser sessions and autonomous signup/login.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);

// Drive a session step by step
const s = await client.browser.createSession({ allowed_domains: ["example.com"], allow_writes: true });
const nav = await client.browser.navigate(s.session_id, "https://example.com"); // { url, title, ... }
const act = await client.browser.act(s.session_id, "click the first result");   // { success, action_taken, url }
const data = await client.browser.extract(s.session_id, "the product names and prices");

// Read real link targets + the current URL (what `extract` can't see — see note below)
const { url, links } = await client.browser.links(s.session_id, { contains: "linkedin.com" });
// → url: "https://example.com/…",  links: [{ text: "LinkedIn", href: "https://linkedin.com/in/…" }]

await client.browser.closeSession(s.session_id);

// Autonomous signup / login — the password is generated + vaulted server-side
const res = await client.browser.signup({ service: "figma.com", url: "https://www.figma.com/signup" });
if (isPendingApproval(res)) {
  // gated by the AccountKit — a human must approve before it runs
} 
await client.browser.login({ service: "figma.com", url: "https://www.figma.com/login" });

// List a user's sessions
const { sessions } = await client.browser.listSessions();
```

<Warning>
  **`extract` reads the page's accessibility tree (visible text) — it does NOT return link
  `href` attributes or the page URL.** Ask `extract` for a URL and you'll get visible text or
  an element index, not the real link. To get link targets or the current URL:

  * **`links(session_id, { contains?, limit? })`** — returns `{ url, links: [{ text, href }] }` from a
    direct DOM read (the reliable way to capture LinkedIn/GitHub/profile URLs).
  * **the `url` field** returned by **`act`** and **`navigate`** — the page URL *after* the action,
    which is how you learn where a click navigated (including SPA route changes with opaque tokens).
</Warning>

`act` and `navigate` send a stable `Idempotency-Key` automatically. `signup` is sensitive and may
resolve to a `PendingApproval` — check with `isPendingApproval(res)`. Credentials never reach
the model; the password is filled server-side via variable substitution. `links` is read-only and,
on a logged-in (context-backed) session, is capability-gated + redacted exactly like `extract`.
Human-only surfaces (live view, grants/revoke) live in the dashboard, not the SDK. See
[Browser](/docs/getting-started/browser).
