// Live-viewport band capture via OMP browser relay (David's Chrome, port 9224).
// Creates a background tab, dismisses the consent modal, sweeps lazy-load, and
// captures top/mid/bot viewport bands at the real device scale.
// Usage: bun d33_relay_live.mjs <url> <outprefix> [dismissText]
const [, , url, prefix, dismissArg] = process.argv;
if (!url || !prefix) { console.error("usage: d33_relay_live.mjs <url> <outprefix> [dismissText]"); process.exit(1); }
const dismissText = dismissArg || "CONTINUE WITHOUT INSIGHTS";
const bws = new WebSocket("ws://127.0.0.1:9224/cdp");
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method, params })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const p = bpend.get(m.id); bpend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;

const attach = await bmsg("Target.attachToTarget", { targetId: tid, flatten: true });
const sid = attach.result.sessionId;
let pidc = 0; const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); bws.send(JSON.stringify({ id, sessionId: sid, method, params })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); ppend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };

await pmsg("Page.enable");
await pmsg("Runtime.enable");
await new Promise(r => setTimeout(r, 7000));

const evalJs = async (expr) => (await pmsg("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;

const dismissed = await evalJs(`(() => {
  const q = ${JSON.stringify(dismissText)};
  const els = Array.from(document.querySelectorAll("button, [role=button], a"));
  const hit = els.find(e => (e.textContent || "").replace(/\\s+/g, " ").trim().includes(q));
  if (hit) { hit.click(); return "clicked:" + hit.tagName + ":" + hit.textContent.trim().slice(0, 40); }
  return "notfound";
})()`);
console.log("DISMISS", dismissed);
await new Promise(r => setTimeout(r, 3000));

const state = JSON.parse(await evalJs("JSON.stringify({h: document.body ? document.body.scrollHeight : null, w: innerWidth, ih: innerHeight, dpr: devicePixelRatio, t: document.title})"));
console.log("STATE", JSON.stringify(state));
const h = state.h, vw = state.w, vh = state.ih;

async function shot(y, label) {
  const cap = await pmsg("Page.captureScreenshot", { format: "png", clip: { x: 0, y, width: vw, height: vh, scale: 1 }, captureBeyondViewport: true, fromSurface: true });
  if (!cap.result?.data) { console.error("no data for", label); return; }
  await Bun.write(prefix + "_" + label + ".png", Buffer.from(cap.result.data, "base64"));
  console.log("LIVEBAND", label, "y=" + y, "bytes=" + Math.round(cap.result.data.length * 0.75));
}

await evalJs(`(async () => {
  const step = 400;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 50));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 900));
  return true;
})()`);
await evalJs("window.scrollTo(0, 0); true");
await new Promise(r => setTimeout(r, 1500));

await shot(0, "top");
const mid = Math.max(0, Math.floor((h - vh) / 2));
await evalJs(`window.scrollTo(0, ${mid}); true`);
await new Promise(r => setTimeout(r, 1500));
await shot(mid, "mid");
const bot = Math.max(0, h - vh);
await evalJs(`window.scrollTo(0, ${bot}); true`);
await new Promise(r => setTimeout(r, 1500));
await shot(bot, "bot");

// leave tab open for further inspection; report tab id
console.log("TARGET", tid);
bws.close();
process.exit(0);
