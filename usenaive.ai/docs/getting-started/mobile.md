> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# Mobile

> Provision, control, and display cloud mobile emulators/devices via Mobilerun — run natural-language agent tasks, stream the live screen, and call any Mobilerun API — without ever holding a Mobilerun key.

The **Mobile** primitive runs cloud mobile emulators/devices on [Mobilerun Cloud](https://docs.mobilerun.ai). You provision hosted Android/iOS devices, run natural-language agent tasks on them ("Open Settings and enable dark mode"), display the live screen, manage an app (APK) library, and reach the **entire** Mobilerun API through a wildcard wrapper. Naïve owns the Mobilerun credentials and scopes every device to your tenant — your agents never hold a Mobilerun key (the same operator-key model as [Compute](/docs/getting-started/compute) with AWS).

<Info>
  Phones are **billed per minute from your credits** (3 credits/device-minute by default, \~\$0.15/min) and **agent tasks are billed per step actually taken** (0.4 credits/step; the `steps` budget you request, default 25, is reserved on dispatch and the unused remainder is refunded when the task finishes): `provision` creates the device immediately and the meter runs until you `terminate` it — **there is no upstream auto-stop**, so always terminate phones you're done with (running out of credits auto-terminates the phone, as does the max-runtime failsafe). Provisioning, device lifecycle (`reboot`/`reset`/`terminate`), proxy changes, running/stopping tasks, uploading apps, and mutating wildcard `call`s are **sensitive** — depending on the user's Account Kit they may require human approval (`status: "pending_approval"`).
</Info>

## Create a phone & display it

```ts theme={"theme":"css-variables"}
// Create a phone — provisions immediately, billed per minute from your credits.
// Defaults to dedicated_premium_device (the minute-billed cloud phone).
const { phone, credits_per_minute } = await naive.mobile.provision({ country: "US" });

// Operate by the Mobilerun device id:
await naive.mobile.waitReady(phone.device_id);
const { stream_url, stream_token, console_url } = await naive.mobile.stream(phone.device_id);

// Done? Terminate — this is what stops the per-minute meter.
await naive.mobile.terminate(phone.device_id);
```

Scope follows the client you hold: `naive.mobile.*` (your default user) vs `naive.forUser(id).mobile.*` (an end-user). Each tenant only ever sees the phones it created through Naïve, and each tenant's credits fund only its own phones.

## Run an agent task

```ts theme={"theme":"css-variables"}
const task = await naive.mobile.run({
  task: "Open the Settings app and tell me the Android version",
  deviceId: phone.device_id, // required — run on one of your active phones
  vision: true,
  reasoning: true,
});

await naive.mobile.task(task.id);          // status + result
await naive.mobile.screenshots(task.id);   // captured screenshots
await naive.mobile.trajectory(task.id);    // step-by-step actions
await naive.mobile.stop(task.id);          // cancel a running task
```

## Device lifecycle

```ts theme={"theme":"css-variables"}
await naive.mobile.reboot(phone.device_id);
await naive.mobile.reset(phone.device_id);       // wipe to a fresh state
await naive.mobile.terminate(phone.device_id);   // release the phone (STOPS the per-minute meter)
```

## Proxy (optional residential IP)

Devices come online on a **datacenter IP** by default. Attach a SOCKS5 proxy for a residential / country-specific IP:

```ts theme={"theme":"css-variables"}
await naive.mobile.setProxy(phone.device_id, { host: "…", port: 1080, user: "…", password: "…" });
await naive.mobile.proxy(phone.device_id);        // → { connected: true, ... }
await naive.mobile.removeProxy(phone.device_id);  // back to the datacenter IP
```

**Bring your own proxy and there is no bandwidth charge** — you pay your proxy provider, not Naïve. Mobilerun's own sticky-IP "Connect" layer (`smart_ip: true`) bills residential bandwidth per GB with no per-device byte counter, so it is off unless the operator enables it; while a Connect proxy is attached the phone meters an extra **+2 credits/device-minute** and the surcharge stops when you `removeProxy`.

## Apps

```ts theme={"theme":"css-variables"}
await naive.mobile.apps();                                   // app library
await naive.mobile.uploadApp({ name: "MyApp", fileName: "app.apk" }); // signed upload URL
```

## Wildcard: search & call any Mobilerun API

Mobilerun Cloud is large (devices, tasks, apps, proxies, eSIM, device tools like tap/swipe/screenshot, flows, triggers, …). The `mobile` primitive ships a generated catalog of every operation, so any endpoint is reachable without a dedicated method:

```ts theme={"theme":"css-variables"}
// Discover operations
const { methods } = await naive.mobile.search("screenshot");
// → [{ operationId: "take-screenshot", method: "GET", path: "/devices/{deviceId}/screenshot", ... }]

// Call any operation by operationId; path params are substituted
await naive.mobile.call("take-screenshot", { path: { deviceId: phone.device_id } });
await naive.mobile.call("list-proxies");
```

Device-scoped operations are restricted to your own devices, and mutating calls go through the same approval gate as the curated methods.

## CLI

```bash theme={"theme":"css-variables"}
naive mobile provision --country US        # provisions immediately, billed per minute from credits
naive mobile phones                        # list your phones + status + metered spend
naive mobile stream <device-id>
naive mobile run "Open Settings and enable dark mode" --device <device-id> --vision
naive mobile call take-screenshot --path deviceId=<device-id>
naive mobile terminate <device-id>         # STOPS the per-minute meter
```

## Configuration

Set the operator's Mobilerun Cloud API key (`dr_sk_…`) in the API environment as `MOBILERUN_API_KEY` (override the base URL with `MOBILERUN_API_BASE`). Billing is metered by the API: `NAIVE_MOBILE_CREDITS_PER_MINUTE` (default 3) is charged per device-minute, `NAIVE_MOBILE_CREDITS_PER_TASK_STEP` (default 0.4) per agent step taken (the requested budget is reserved on dispatch, then reconciled against the step count Mobilerun reports), and devices auto-terminate on credit exhaustion or after `NAIVE_MOBILE_MAX_RUNTIME_MINUTES` (default 1440). Mobilerun Connect (`smart_ip`) proxies are rejected unless `NAIVE_MOBILE_CONNECT_ENABLED=true`, which adds `NAIVE_MOBILE_CONNECT_CREDITS_PER_MINUTE` (default 2) per minute while one is attached to recover the \~\$10/GB upstream bandwidth. `naive mobile status` reports configuration, reachability, your phone counts, and the operator-wide upstream device total (the "confirm nothing is billing" check).
