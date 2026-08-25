// Replica runtime asset sweep for usenaive: walk sitemap routes on the REPLICA,
// collect HTTP>=400 fetch events + collapsed pages. No live probing.
// Usage: bun d48_routesweep.mjs <port> <repBase> <routesFile> [settleMs]
import { readFileSync } from "fs";
const [, , portArg, repBase, routesFile, settleArg] = process.argv;
const routes = readFileSync(routesFile, "utf-8").split("\n").map(s => s.trim()).filter(Boolean);
const settle = Number(settleArg ?? 7000);
const base = "http://127.0.0.1:" + portArg;
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, {res, rej}); bws.send(JSON.stringify({id, method, params})); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const {res, rej} = bpend.get(m.id); bpend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const SCRIPT = `JSON.stringify((() => {
  const it = (document.body ? document.body.innerText : "").replace(/\\s+/g, " ").trim();
  return { t: document.title, h1: document.querySelector("h1")?.innerText ?? "", it: it.slice(0, 6000) };
})())`;

const httpBad = new Set(), collapsedPages = [];
let routesDone = 0;

async function probe(url) {
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
  pws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const {res, rej} = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } });
  // capture network failures via Network.responseReceived (HTTP >= 400)
  pws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Network.responseReceived") {
      const rs = m.params.response; const st = rs.status;
      if (st >= 400 && !httpBad.has(rs.url)) { httpBad.add(rs.url); console.log(`HTTP${st}: ${rs.url}`); }
    }
  });
  await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });
  await pmsg("Network.enable").catch(() => {});
  await new Promise(r => setTimeout(r, settle));
  const r = await pmsg("Runtime.evaluate", { expression: SCRIPT, returnByValue: true }).catch(() => null);
  let val = null; try { val = r ? JSON.parse(r.result?.result?.value) : null; } catch {}
  pws.close();
  try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
  return val ?? { t: "", h1: "", it: "" };
}

for (const p of routes) {
  routesDone++;
  const v = await probe(repBase + (p === "/" ? "" : p));
  if ((v.it?.length ?? 0) < 150) collapsedPages.push(p + " | " + v.t + " | " + v.h1);
  console.log(`PAGE ${routesDone}/${routes.length} ${p} t=${v.t} h1=${v.h1} it=${(v.it ?? "").length}`);
}
console.log(`\nSUMMARY routes=${routes.length} http>=400 unique=${httpBad.size} collapsed=${collapsedPages.length}`);
for (const c of collapsedPages) console.log("  COLLAPSE: " + c);
process.exit(0);
