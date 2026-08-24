// d33_settle.mjs — slow-settle full-page capture (reveal-animation friendly).
// d31_full.mjs with 700ms pause per scroll step + 3s settle at bottom & top,
// for IO-revealed / lazy-heavy pages where the 60ms sweep froze content.
// Usage: bun .tmp_tools/d33_settle.mjs <port> <url> <out.png>
const [, , portArg, url, out] = process.argv;
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
await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 3, mobile: false });

// slow lazy sweep: 500px step, 700ms pause (reveal animations fire)
for (let y = 0; y < 200000; ) {
  const r = await pmsg("Runtime.evaluate", {
    expression: `(() => { const m = document.body.scrollHeight - innerHeight - ${y};
      if (m <= 0) return false; scrollTo(0, ${y}); return true; })()`,
    returnByValue: true });
  if (r.result?.result?.value !== true) break;
  y += 500;
  await new Promise(r => setTimeout(r, 700));
}
await pmsg("Runtime.evaluate", { expression: `scrollTo(0, document.body.scrollHeight)` });
await new Promise(r => setTimeout(r, 3000));
await pmsg("Runtime.evaluate", { expression: `scrollTo(0, 0)` });
await new Promise(r => setTimeout(r, 3000));

const shot = await pmsg("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
require("fs").writeFileSync(out, Buffer.from(shot.result.data, "base64"));
const dims = await pmsg("Runtime.evaluate", {
  expression: `JSON.stringify({ w: document.body.scrollWidth, h: document.body.scrollHeight })`,
  returnByValue: true });
console.log("FULL", out, "pagesize", dims.result?.result?.value || "?", "bytes=" + shot.result.data.length);
pws.close(); bws.close();
try { await fetch(base + "/json/close/" + tid); } catch (e) {}
