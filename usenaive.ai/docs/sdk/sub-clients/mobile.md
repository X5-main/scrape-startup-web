> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# mobile

> Provision, control & display cloud mobile emulators/devices via Mobilerun — run agent tasks, stream the live screen, and call any Mobilerun API.

```ts theme={"theme":"css-variables"}
// Create a phone — provisions immediately, billed per minute from your credits.
// Defaults to dedicated_premium_device (the minute-billed cloud phone).
const { phone, credits_per_minute } = await naive.mobile.provision({ country: "US" });

// Operate by the Mobilerun device id:
await naive.mobile.waitReady(phone.device_id);
const { stream_url, stream_token, console_url } = await naive.mobile.stream(phone.device_id);

// Run a natural-language agent task on one of your active phones (deviceId required)
const task = await naive.mobile.run({
  task: "Open Settings and enable dark mode",
  deviceId: phone.device_id,
  vision: true,
});
await naive.mobile.task(task.id);
await naive.mobile.screenshots(task.id);
await naive.mobile.trajectory(task.id);
await naive.mobile.stop(task.id);

// Proxy (optional residential IP — devices default to a datacenter IP)
await naive.mobile.setProxy(phone.device_id, { host: "…", port: 1080, user: "…", password: "…" });
await naive.mobile.proxy(phone.device_id);
await naive.mobile.removeProxy(phone.device_id);

// Device lifecycle
await naive.mobile.reboot(phone.device_id);
await naive.mobile.reset(phone.device_id);
await naive.mobile.terminate(phone.device_id);      // releases the phone — STOPS the per-minute meter

// App library
await naive.mobile.apps();
await naive.mobile.uploadApp({ name: "MyApp", fileName: "app.apk" });

// Wildcard — search & call Mobilerun operations
const { methods } = await naive.mobile.search("screenshot");
await naive.mobile.call("take-screenshot", { path: { deviceId: phone.device_id } });

await naive.mobile.status();
```

Per-user and AccountKit-gated: `naive.mobile` (operator default user) or `naive.forUser(id).mobile`. Naïve holds the Mobilerun operator key and isolates each tenant's phones/tasks. **Phones are billed per minute from your credits until terminated — there is no upstream auto-stop** (the meter auto-terminates devices on credit exhaustion or max-runtime). **Provisioning, device lifecycle, proxy changes, running/stopping tasks, uploads, and mutating wildcard `call`s are approval-gated by default** — an agent call may return `{ status: "pending_approval", approval_id }`. The `search`/`call` pair reaches Mobilerun's API for your device/task-scoped operations (account-global ops are restricted for tenant sub-users). See the [Mobile guide](/docs/getting-started/mobile).
