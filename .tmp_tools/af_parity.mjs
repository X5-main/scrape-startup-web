// DOM text/structural parity: live vs replica, via isolated headless Chrome (port arg).
// Usage: bun .tmp_tools/veria_parity.mjs <port> <liveBase> <replicaBase> <paths...>
const [, , portArg, liveBase, repBase, ...paths] = process.argv;
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, {res, rej}); bws.send(JSON.stringify({id, method, params})); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const {res, rej} = bpend.get(m.id); bpend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
await new Promise((r,j) => { bws.onopen = r; bws.onerror = j; });

const SCRIPT = `JSON.stringify((() => {
  const it = (document.body ? document.body.innerText : "").replace(/\\s+/g, " ").trim();
  return { t: document.title, h1: document.querySelector("h1")?.innerText.trim() ?? null,
           chars: it.length, lines: document.body ? document.body.innerText.split(/\\n+/).length : 0,
           h: document.body ? document.body.scrollHeight : 0, it };
})())`;

async function probe(ws, url) {
  const created = await bmsg("Target.createTarget", { url });
  const tid = created.result.targetId;
  let pick = null;
  for (let i = 0; i < 24 && !pick; i++) { await new Promise(r => setTimeout(r, 250));
    const list = await (await fetch(base + "/json/list")).json();
    pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl); }
  if (!pick) throw new Error("page ws missing " + url);
  const pws = new WebSocket(pick.webSocketDebuggerUrl);
  let pidc = 0; const ppend = new Map();
  const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, {res, rej}); pws.send(JSON.stringify({id, method, params})); });
  pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const {res, rej} = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
  await new Promise((r,j) => { pws.onopen = r; pws.onerror = j; });
  await pmsg("Page.enable"); await pmsg("Runtime.enable");
  await pmsg("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 9000));
  const r = await pmsg("Runtime.evaluate", { expression: SCRIPT, returnByValue: true });
  const val = r.result?.result?.value;
  pws.close();
  try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
  return JSON.parse(val);
}

for (const p of paths) {
  try {
    const lv = await probe(bws, liveBase + p);
    await new Promise(r => setTimeout(r, 750));
    const rp = await probe(bws, repBase + p);
    const same = lv.t === rp.t && lv.h1 === rp.h1 && lv.chars === rp.chars && lv.it === rp.it;
    console.log(`${p}: title ${lv.t === rp.t ? "==" : "!="} | h1 ${lv.h1 === rp.h1 ? "==" : lv.h1 + " vs " + rp.h1} | innerText ${lv.chars}->${rp.chars} ${lv.chars === rp.chars ? "==" : "!!"} | lines ${lv.lines}->${rp.lines} | height ${lv.h}->${rp.h} | ${same ? "MATCH" : "DIFF"}`);
  } catch (e) {
    console.log(`${p}: probe error ${e.message}`);
  }
}
bws.close(); process.exit(0);
