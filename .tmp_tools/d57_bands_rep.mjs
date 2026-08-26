// D57: same band pipeline as d56_bands.mjs, but navigates AFTER attach
// (createTarget-with-URL races for loopback through the relay and leaves a
// Chrome error tab). Writes <outdir>/band_<NNN>.png + state.json.
// Usage: bun d57_bands_rep.mjs <url> <outdir>
const [, , url, outdir] = process.argv;
if (!url || !outdir) { console.error("usage: d57_bands_rep.mjs <url> <outdir>"); process.exit(1); }
const withT = (p, ms, what) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT " + what)), ms)),
]);
const bws = new WebSocket("ws://127.0.0.1:9224/cdp");
let bidc = 0; const pend = new Map();
const bmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++bidc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); }), 20000, m);
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });
const tids = [];
try {
  const created = await bmsg("Target.createTarget", { url: "about:blank" });
  const tid = created.result.targetId; tids.push(tid);
  const attach = await bmsg("Target.attachToTarget", { targetId: tid, flatten: true });
  const sid = attach.result.sessionId;
  let pidc = 0; const ppend = new Map();
  const pmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p, sessionId: sid })); }), 25000, m);
  bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
  await pmsg("Page.enable"); await pmsg("Runtime.enable");
  // navigate AFTER attach: relay createTarget-with-URL races loopback
  const nav = await pmsg("Page.navigate", { url });
  console.log("NAV", JSON.stringify(nav));
  // wait for a real document: readyState complete, no Chrome error page, body text > 1k
  let state = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const ev = await pmsg("Runtime.evaluate", { expression: `JSON.stringify({t: document.title, h1: document.querySelector('h1')?.innerText ?? null, h: document.body?.scrollHeight ?? 0, w: innerWidth, ih: innerHeight, len: document.body?.innerText?.length ?? -1})`, returnByValue: true });
    const raw = ev.result?.result?.value;
    if (!raw) continue;
    state = JSON.parse(raw);
    if (state.len > 1000 && state.h1 !== "This page couldn’t load") break;
    if (i === 29) { console.log("STATE-FAIL", JSON.stringify(state)); process.exit(2); }
  }
  console.log("STATE", url, JSON.stringify(state));
  const evalJs = async (expr, ap = false) => (await pmsg("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: ap })).result?.result?.value;
  // lazy-sweep then return to top
  await evalJs(`(async () => { const s=380; for (let y=0; y<=document.body.scrollHeight; y+=s){ window.scrollTo(0,y); await new Promise(r=>setTimeout(r,40)); } window.scrollTo(0,0); await new Promise(r=>setTimeout(r,1500)); return true; })()`, true);
  const { h, w, ih } = state;
  const bands = Math.ceil(h / ih);
  await Bun.write(outdir + "/state.json", JSON.stringify({ url, state, bands }));
  for (let i = 0; i < bands; i++) {
    const y = i * ih;
    await evalJs(`window.scrollTo(0, ${y}); true`);
    await new Promise(r => setTimeout(r, 550)); // settle band (fonts/images)
    const cap = await pmsg("Page.captureScreenshot", { format: "png", clip: { x: 0, y, width: w, height: ih, scale: 1 }, captureBeyondViewport: true, fromSurface: true });
    if (cap.result?.data) { await Bun.write(outdir + "/band_" + String(i).padStart(3, "0") + ".png", Buffer.from(cap.result.data, "base64")); console.log("BAND", i, "y=" + y, "ok"); }
    else { console.log("BAND", i, "NO-DATA"); }
  }
  console.log("BANDS_DONE", bands);
} catch (e) {
  console.log("ERR", e.message);
} finally {
  for (const tid of tids) { try { await bmsg("Target.closeTarget", { targetId: tid }); } catch (e) {} }
  bws.close(); process.exit(0);
}
