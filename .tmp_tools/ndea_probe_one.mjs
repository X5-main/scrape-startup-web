// One-shot probe of a single URL: fonts, canvases (painted or blank), imgs.
// Usage: bun ndea_probe_one.mjs <cdpPort> <url>
const [, , cdpPort, url] = process.argv;
const base = "http://127.0.0.1:" + cdpPort;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let idc = 0; const pend = new Map();
const bmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++idc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

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

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 24 && !pick; i++) { await new Promise(r => setTimeout(r, 250));
  const list = await (await fetch(base + "/json/list")).json();
  pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl); }
if (!pick) throw new Error("page ws missing " + url);
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); pws.send(JSON.stringify({ id, method: m, params: p })); });
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const { res, rej } = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });
await pmsg("Page.enable"); await pmsg("Runtime.enable");
await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await new Promise(r => setTimeout(r, 5000));
const r = await pmsg("Runtime.evaluate", { expression: SCRIPT, returnByValue: true });
console.log("=== " + url + "\n" + JSON.stringify(JSON.parse(r.result?.result?.value), null, 1));
pws.close();
try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
process.exit(0);
