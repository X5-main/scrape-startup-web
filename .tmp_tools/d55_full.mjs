// D55: full-page capture via real-Chrome relay (browser-level WS 9224).
// Scope: create fresh tab, settle + lazy-sweep, capture FULL scrollHeight,
// close tab. Output PNG (scale via device metrics if >1).
// Usage: bun d55_full.mjs <url> <out.png> [scale=1]
const [, , url, out, scaleArg = "1"] = process.argv;
if (!url || !out) { console.error("usage: d55_full.mjs <url> <out.png> [scale=1]"); process.exit(1); }
const sc = Number(scaleArg);
const withT = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT " + what)), ms))]);
const bws = new WebSocket("ws://127.0.0.1:9224/cdp");
let bidc = 0; const pend = new Map();
const bmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++bidc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); }), 20000, m);
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });
const tids = [];
try {
  const created = await bmsg("Target.createTarget", { url });
  const tid = created.result.targetId; tids.push(tid);
  const attach = await bmsg("Target.attachToTarget", { targetId: tid, flatten: true });
  const sid = attach.result.sessionId;
  let pidc = 0; const ppend = new Map();
  const pmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p, sessionId: sid })); }), 30000, m);
  bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); ppend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
  await pmsg("Page.enable"); await pmsg("Runtime.enable");
  if (sc > 1) await pmsg("Emulation.setDeviceMetricsOverride", { width: 1512, height: 716, deviceScaleFactor: sc, mobile: false });
  await new Promise(r => setTimeout(r, 9000));
  const evalJs = async (expr, ap = false) => (await pmsg("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: ap })).result?.result?.value;
  const state = JSON.parse(await evalJs("JSON.stringify({t: document.title, h1: document.querySelector('h1')?.innerText ?? null, h: document.body.scrollHeight, w: innerWidth, ih: innerHeight, len: document.body.innerText.length})"));
  console.log("STATE", url, JSON.stringify(state));
  await evalJs(`(async () => { const s=380; for (let y=0; y<=document.body.scrollHeight; y+=s){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); } window.scrollTo(0,0); return true; })()`, true);
  await new Promise(r => setTimeout(r, 2500));
  const cap = await pmsg("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: state.w, height: state.h, scale: sc }, captureBeyondViewport: true, fromSurface: true });
  if (cap.result?.data) { await Bun.write(out, Buffer.from(cap.result.data, "base64")); console.log("WROTE", out, state.w + "x" + state.h, "scale", sc); }
  else console.log("NO-DATA", url, JSON.stringify(cap).slice(0, 200));
} catch (e) {
  console.log("ERR", e.message);
} finally {
  for (const tid of tids) { try { await bmsg("Target.closeTarget", { targetId: tid }); } catch (e) {} }
  bws.close(); process.exit(0);
}
