// One-shot probe of a single URL: fonts, canvases (painted or blank), imgs.
// Usage: bun ndea_probe_one.mjs <cdpPort> <url>
const [, , cdpPort, url] = process.argv;
const base = "http://127.0.0.1:" + cdpPort;
const STEP_T = 8000;
const wto = (p, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("stall: " + what + " >" + STEP_T + "ms")), STEP_T))]);
let version;
try { version = await wto((await fetch(base + "/json/version")).json(), "CDP " + base + " /json/version"); }
catch (e) { console.error("CDP endpoint " + base + " not responsive: " + e.message); process.exit(2); }
const bws = new WebSocket(version.webSocketDebuggerUrl);
let idc = 0; const pend = new Map();
const bmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++idc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); });
const bmsgT = (m, p) => wto(bmsg(m, p), "cmd " + m);
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await wto(new Promise((r, j) => { bws.onopen = r; bws.onerror = j; }), "browser ws open");

const SCRIPT = `JSON.stringify((() => {
  const canvasInfo = [...document.querySelectorAll("canvas")].map(c => {
    const ctx = c.getContext("2d");
    let painted = 0, sample = 0, nonZero = 0;
    try {
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      for (let i = 0; i < d.length; i += 64) { sample++; const lum = d[i] + d[i+1] + d[i+2]; if (lum > 0) { nonZero++; painted += lum; } }
    } catch (e) { return { w: c.width, h: c.height, err: String(e).slice(0, 60) }; }
    return { w: c.width, h: c.height, paintPct: Math.round(nonZero / sample * 100), meanLum: sample ? Math.round(painted / nonZero / 3) : 0 };
  });
  const fonts = [...document.fonts].map(f => f.family + "|" + f.status);
  const imgs = [...document.querySelectorAll("img")].map(i => i.complete ? "ok:" + i.naturalWidth + "x" + i.naturalHeight + ":" + i.src.slice(-40) : "LOADING:" + i.src.slice(-40));
  const sheets = [...document.styleSheets].map(s => { try { return s.cssRules.length + " rules:" + s.href; } catch (e) { return "CROSS:" + s.href; } });
  return { fonts, canvasInfo, imgs, sheets, scripts: [...document.scripts].map(s => s.src.slice(-30)) };
})())`;

const created = await bmsgT("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 24 && !pick; i++) { await new Promise(r => setTimeout(r, 250));
  const list = await wto((await fetch(base + "/json/list")).json(), "json/list");
  pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl); }
if (!pick) throw new Error("page ws missing " + url);
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); pws.send(JSON.stringify({ id, method: m, params: p })); });
const pmsgT = (m, p) => wto(pmsg(m, p), "cmd " + m);
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const { res, rej } = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await wto(new Promise((r, j) => { pws.onopen = r; pws.onerror = j; }), "page ws open");
await pmsgT("Page.enable"); await pmsgT("Runtime.enable");
await pmsgT("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await new Promise(r => setTimeout(r, 5000));
const r = await pmsgT("Runtime.evaluate", { expression: SCRIPT, returnByValue: true });
console.log("=== " + url + "\n" + JSON.stringify(JSON.parse(r.result?.result?.value), null, 1));
pws.close();
try { await bmsgT("Target.closeTarget", { targetId: tid }); } catch {}
process.exit(0);
