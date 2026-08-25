// Flush full-page or hero (viewport) capture with lazy-load sweep, headless CDP (port arg).
// Usage: bun .tmp_tools/d49_flush.mjs <port> <url> <out.png> <scale> <mode:full|hero>
//   mode=full: captureBeyondViewport (whole scrollable page)
//   mode=hero: viewport-only shot after sweep + top settle (hero frame)
import { writeFile } from "node:fs/promises";
const [, , portArg, url, out, scaleArg = "2", modeArg = "full"] = process.argv;
if (!portArg || !url || !out) { console.error("usage: d49_flush.mjs <port> <url> <out.png> <scale> <full|hero>"); process.exit(1); }
const sc = Number(scaleArg);
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let idc = 0; const pend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => {
  const id = ++idc; pend.set(id, { res, rej });
  bws.send(JSON.stringify({ id, method, params }));
});
bws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    const { res, rej } = pend.get(m.id); pend.delete(m.id);
    m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m);
  }
};
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 24 && !pick; i++) {
  await new Promise(r => setTimeout(r, 250));
  const list = await (await fetch(base + "/json/list")).json();
  pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl);
}
if (!pick) throw new Error("page ws missing " + url);
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => {
  const id = ++pidc; ppend.set(id, { res, rej });
  pws.send(JSON.stringify({ id, method, params }));
});
pws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && ppend.has(m.id)) {
    const { res, rej } = ppend.get(m.id); ppend.delete(m.id);
    m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m);
  }
};
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });

await pmsg("Page.enable"); await pmsg("Runtime.enable");
await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: sc, mobile: false });

// lazy sweep: step 500px until bottom, settle 900ms, back to top
for (let y = 0; y < 300000; ) {
  const r = await pmsg("Runtime.evaluate", {
    expression: `(() => { const m = document.body.scrollHeight - innerHeight - ${y};
      if (m <= 0) return false; scrollTo(0, ${y}); return true; })()`,
    returnByValue: true });
  if (r.result?.result?.value !== true) break;
  y += 500;
  await new Promise(r => setTimeout(r, 60));
}
await pmsg("Runtime.evaluate", { expression: `scrollTo(0, document.body.scrollHeight)` });
await new Promise(r => setTimeout(r, 900));
await pmsg("Runtime.evaluate", { expression: `scrollTo(0, 0)` });
const settleTop = parseInt(process.env.SETTLE_TOP_MS || "1500", 10);
await pmsg("Runtime.evaluate", { expression: `new Promise(r => { requestAnimationFrame(() => requestAnimationFrame(r)); })`, awaitPromise: true });
await new Promise(r => setTimeout(r, settleTop));

const st = await pmsg("Runtime.evaluate", { expression: "JSON.stringify({h: document.body.scrollHeight, t: document.title})", returnByValue: true });
console.log("PAGE_STATE", st.result?.result?.value);
const shot = await pmsg("Page.captureScreenshot", {
  format: "png", captureBeyondViewport: modeArg === "full", fromSurface: true });
const buf = Buffer.from(shot.result.data, "base64");
await writeFile(out, buf);
console.log(`WROTE ${out} mode=${modeArg} scale=${sc} bytes=${buf.length}`);
pws.close();
try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
bws.close(); process.exit(0);
