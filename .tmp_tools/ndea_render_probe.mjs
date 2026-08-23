// Probe live vs replica computed rendering state (fonts loaded, bg color, painted elements).
// Usage: bun probe_render.mjs <cdpPort> <urlA> <urlB>
const [, , cdpPort, urlA, urlB] = process.argv;
const base = "http://127.0.0.1:" + cdpPort;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let idc = 0; const pend = new Map();
const bmsg = (m, p = {}) => new Promise((res, rej) => { const id = ++idc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const { res, rej } = pend.get(m.id); pend.delete(m.id); m.error ? rej(new Error(m.method + ": " + m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const SCRIPT = `JSON.stringify((() => {
  const cs = (sel) => { const el = document.querySelector(sel); if (!el) return null; const s = getComputedStyle(el); return { bg: s.backgroundColor, color: s.color, font: s.fontFamily, size: s.fontSize, italic: s.fontStyle }; };
  const h1 = document.querySelector("h1");
  const fonts = [...document.fonts].map(f => f.family + "|" + f.status);
  const canvas = [...document.querySelectorAll("canvas")].map(c => c.width + "x" + c.height);
  const svg = [...document.querySelectorAll("svg")].map(s => s.getBoundingClientRect().width + "x" + s.getBoundingClientRect().height);
  const imgs = [...document.querySelectorAll("img")].map(i => (i.complete ? "ok" : "LOADING") + ":" + (i.naturalWidth) + "x" + (i.naturalHeight));
  const p1 = document.querySelector("p");
  return { title: document.title, bg: cs("body"), h1: h1 ? { text: h1.innerText.slice(0, 60), ...cs("h1") } : null,
           p: p1 ? { text: p1.innerText.slice(0, 60), ...cs("p") } : null,
           fonts: fonts.slice(0, 8), canvas, svg: svg.slice(0, 6), imgs, scriptCount: document.scripts.length, sheetCount: document.styleSheets.length };
})())`;

async function probe(url) {
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
  await new Promise(r => setTimeout(r, 4000));
  const r = await pmsg("Runtime.evaluate", { expression: SCRIPT, returnByValue: true });
  pws.close();
  try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
  return JSON.parse(r.result?.result?.value);
}

const [a, b] = await Promise.all([probe(urlA), probe(urlB)]);
console.log("=== A", urlA, "\n", JSON.stringify(a, null, 1));
console.log("=== B", urlB, "\n", JSON.stringify(b, null, 1));
