// Full-page screenshot via an ISOLATED headless Chrome CDP (creates its own tab).
// Usage: bun .tmp_tools/fab_cdp_shot.mjs <port> <url> <out> [scale] [quality]
//   scale=3, quality=80 default. always png (webp capture unreliable in headless). Captures whole scrollable page at 1280px-wide viewport.
const [, , portArg, url, out, scaleArg = "3", qualityArg = "80"] = process.argv;
if (!portArg || !url || !out) { console.error("usage: fab_cdp_shot.mjs <port> <url> <out.webp|out.png> [scale] [quality]"); process.exit(1); }
const sc = Number(scaleArg);

const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const browserWsUrl = version.webSocketDebuggerUrl;

const bws = new WebSocket(browserWsUrl);
let bidc = 0;
const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => {
  const id = ++bidc;
  bpend.set(id, { res, rej });
  bws.send(JSON.stringify({ id, method, params }));
});
bws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && bpend.has(m.id)) {
    const { res, rej } = bpend.get(m.id);
    bpend.delete(m.id);
    m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m);
  }
};
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const targetId = created.result.targetId;
console.log("TARGET", targetId, url);

// wait for the page ws to appear in /json/list
let pick = null;
for (let i = 0; i < 20 && !pick; i++) {
  await new Promise((r) => setTimeout(r, 250));
  const list = await (await fetch(base + "/json/list")).json();
  pick = list.find((t) => t.id === targetId && t.webSocketDebuggerUrl);
}
if (!pick) { console.error("page ws not exposed"); process.exit(1); }

const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0;
const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => {
  const id = ++pidc;
  ppend.set(id, { res, rej });
  pws.send(JSON.stringify({ id, method, params }));
});
pws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && ppend.has(m.id)) {
    const { res, rej } = ppend.get(m.id);
    ppend.delete(m.id);
    m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m);
  }
};
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });

await pmsg("Page.enable");
await pmsg("Runtime.enable");
if (sc > 1) {
  await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: sc, mobile: false });
}
// wait for network idle + hydration
await new Promise((r) => setTimeout(r, 4000));
const fmt = "png"; // headless webp capture returns empty
const ready = await pmsg("Runtime.evaluate", { expression: "JSON.stringify({rs: document.readyState, h: document.body ? document.body.scrollHeight : null, t: document.title})", returnByValue: true });
console.log("PAGE_STATE", ready.result?.result?.value);
let cap = null;
for (let attempt = 0; attempt < 4 && !(cap && cap.result?.data); attempt++) {
  if (attempt) await new Promise((r) => setTimeout(r, 2500));
  cap = await pmsg("Page.captureScreenshot", {
    format: fmt,
    quality: Number(qualityArg),
    captureBeyondViewport: true,
    fromSurface: true,
  });
}
if (!cap.result?.data) { console.error("no screenshot data", JSON.stringify(cap).slice(0, 300)); process.exit(1); }
await Bun.write(out, Buffer.from(cap.result.data, "base64"));
console.log("WROTE", out, "(scale", sc + ")");
bws.close(); pws.close();
process.exit(0);
