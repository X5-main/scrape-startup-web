// Parity v2 for usenaive: live vs replica innerText with 8s settle + retry-on-mismatch.
// Usage: bun d48_parity2.mjs <port> <liveBase> <repBase> <routesFile>
import { readFileSync } from "fs";
const [, , portArg, liveBase, repBase, routesFile] = process.argv;
const routes = readFileSync(routesFile, "utf-8").split("\n").map(s => s.trim()).filter(Boolean);
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, {res, rej}); bws.send(JSON.stringify({id, method, params})); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const {res, rej} = bpend.get(m.id); bpend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const SCRIPT = `JSON.stringify((() => {
  const it = (document.body ? document.body.innerText : "").replace(/\\s+/g, " ").trim();
  return { t: document.title, h1: document.querySelector("h1")?.innerText ?? "", it: it.slice(0, 6000), lines: it ? it.split(" ").length : 0, h: document.body ? document.body.scrollHeight : 0 };
})())`;

async function probe(url, ms) {
  const created = await bmsg("Target.createTarget", { url });
  const tid = created.result.targetId;
  let pick = null;
  for (let i = 0; i < 24 && !pick; i++) { await new Promise(r => setTimeout(r, 250));
    const list = await (await fetch(base + "/json/list")).json();
    pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl); }
  if (!pick) throw new Error("no page ws for " + url);
  const pws = new WebSocket(pick.webSocketDebuggerUrl);
  let pidc = 0; const ppend = new Map();
  const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, {res, rej}); pws.send(JSON.stringify({id, method, params})); });
  pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const {res, rej} = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
  await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });
  await new Promise(r => setTimeout(r, ms));
  const r = await pmsg("Runtime.evaluate", { expression: SCRIPT, returnByValue: true }).catch(() => null);
  let val = null; try { val = r ? JSON.parse(r.result?.result?.value) : null; } catch {}
  pws.close();
  try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
  return val ?? { t: "", h1: "", it: "", lines: 0, h: 0 };
}

function collapsed(v) { return v && (v.it?.length ?? 0) < 150 && (v.t?.includes("couldn't load") || v.h1?.includes("couldn't load")); }

let match = 0, diff = 0, dead = [], err = 0;
for (const p of routes) {
  const url = p === "/" ? "" : p;
  let lv = await probe(liveBase + url, 8000);
  let rp = await probe(repBase + url, 8000);
  let retries = 0;
  while (retries < 2 && (collapsed(rp) || collapsed(lv))) {
    await new Promise(r => setTimeout(r, 2000));
    rp = await probe(repBase + url, 8000);
    if (collapsed(lv)) lv = await probe(liveBase + url, 8000);
    retries++;
  }
  const same = lv.t === rp.t && lv.h1 === rp.h1 && lv.chars === rp.chars && lv.it === rp.it;
  const ok = lv.t === rp.t && lv.h1 === rp.h1 && lv.it === rp.it && !collapsed(rp) && !collapsed(lv);
  if (ok) { match++; console.log(`MATCH ${p}`); }
  else { diff++; console.log(`DIFF ${p} | lv{${lv.t}|${lv.h1}|${lv.it.length}} rp{${rp.t}|${rp.h1}|${rp.it.length}} retries=${retries}`); }
}
console.log(`\nSUMMARY routes=${routes.length} match=${match} diff=${diff} dead-live=${dead.length} err=${err}`);
process.exit(0);
