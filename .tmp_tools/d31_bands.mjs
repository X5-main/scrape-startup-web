// Capture top/mid/bottom viewport bands of a URL via headless CDP (port 9344).
// Usage: bun d31_bands.mjs <port> <url> <outprefix>
// Writes <outprefix>_top.png / _mid.png / _bot.png (3840x2160, 1280x720 vp @ scale 3).
const [, , portArg, url, prefix] = process.argv;
if (!portArg || !url || !prefix) { console.error("usage: d31_bands.mjs <port> <url> <outprefix>"); process.exit(1); }
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method, params })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const p = bpend.get(m.id); bpend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 20 && !pick; i++) { await new Promise(r => setTimeout(r, 250)); pick = (await (await fetch(base + "/json/list")).json()).find(t => t.id === tid); }
if (!pick) { console.error("page ws not exposed"); process.exit(1); }
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); pws.send(JSON.stringify({ id, method, params })); });
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); ppend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });

await pmsg("Page.enable");
await pmsg("Runtime.enable");
await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 3, mobile: false });
await new Promise(r => setTimeout(r, 5000));

const evalJs = async (expr) => (await pmsg("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const state = JSON.parse(await evalJs("JSON.stringify({h: document.body ? document.body.scrollHeight : null, t: document.title})"));
console.log("STATE", JSON.stringify(state));
const h = state.h;

async function shot(y, label) {
  const cap = await pmsg("Page.captureScreenshot", { format: "png", clip: { x: 0, y, width: 1280, height: 720, scale: 1 }, captureBeyondViewport: true, fromSurface: true });
  if (!cap.result?.data) { console.error("no data for", label); return; }
  await Bun.write(prefix + "_" + label + ".png", Buffer.from(cap.result.data, "base64"));
  console.log("BAND", label, "y=" + y);
}

// forced scroll sweep: walk the whole page to trigger lazy-load/IO,
// then settle back at top so each band capture sees flushed assets
await evalJs(`(async () => {
  const step = 500;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 900));
  return true;
})()`);
await evalJs("window.scrollTo(0, 0); true");
await new Promise(r => setTimeout(r, 1200));

await shot(0, "top");
const mid = Math.max(0, Math.floor((h - 720) / 2));
await evalJs(`window.scrollTo(0, ${mid}); true`);
await new Promise(r => setTimeout(r, 1800));
await shot(mid, "mid");
const bot = Math.max(0, h - 720);
await evalJs(`window.scrollTo(0, ${bot}); true`);
await new Promise(r => setTimeout(r, 1800));
await shot(bot, "bot");

await pmsg("Target.closeTarget", { targetId: tid });
bws.close(); pws.close();
process.exit(0);
