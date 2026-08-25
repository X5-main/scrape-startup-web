// D54 settle+scroll-wave capture. Usage: bun .tmp_tools/d54_shot.mjs <port> <url> <out.png> [scale=2] [settleMs=14000]
const [, , portArg, url, out, scaleArg = "2", settleArg = "14000"] = process.argv;
const sc = Number(scaleArg);
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const { res, rej } = bpend.get(m.id); bpend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });
const created = await bmsg("Target.createTarget", { url });
const targetId = created.result.targetId;
let pick = null;
for (let i = 0; i < 24 && !pick; i++) { await new Promise((r) => setTimeout(r, 250)); const list = await (await fetch(base + "/json/list")).json(); pick = list.find((t) => t.id === targetId && t.webSocketDebuggerUrl); }
if (!pick) { console.error("page ws not exposed"); process.exit(1); }
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); pws.send(JSON.stringify({ id, method: m, params: p })); });
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const { res, rej } = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });
await pmsg("Page.enable"); await pmsg("Runtime.enable");
await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: sc, mobile: false });
// settle for hero media (videos/posters/lazy images)
await new Promise((r) => setTimeout(r, Number(settleArg)));
// scroll wave bottom->top to force lazy content
await pmsg("Runtime.evaluate", { expression: "window.scrollTo(0, document.body.scrollHeight); 'bottom'" });
await new Promise((r) => setTimeout(r, 1400));
await pmsg("Runtime.evaluate", { expression: "window.scrollTo(0, 0); 'top'" });
await new Promise((r) => setTimeout(r, 1400));
const ready = await pmsg("Runtime.evaluate", { expression: "JSON.stringify({h: document.body?document.body.scrollHeight:null, t: document.title})", returnByValue: true });
console.log("PAGE_STATE", ready.result?.result?.value);
let cap = null;
for (let attempt = 0; attempt < 4 && !(cap && cap.result?.data); attempt++) {
  if (attempt) await new Promise((r) => setTimeout(r, 2500));
  cap = await pmsg("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
}
if (!cap.result?.data) { console.error("no screenshot"); process.exit(1); }
await Bun.write(out, Buffer.from(cap.result.data, "base64"));
console.log("WROTE", out);
bws.close(); pws.close(); process.exit(0);
