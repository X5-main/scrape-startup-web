// Probe a URL in headless 9344: capture console, exceptions, failed requests, final innerText.
// Usage: bun d48_errprobe.mjs <url> [settleMs]
const [, , url, ms] = process.argv;
const settle = ms ? parseInt(ms) : 6000;
const base = "http://127.0.0.1:9344";
const version = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(version.webSocketDebuggerUrl);
let bidc = 0; const bpend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++bidc; bpend.set(id, {res, rej}); bws.send(JSON.stringify({id, method, params})); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && bpend.has(m.id)) { const {res, rej} = bpend.get(m.id); bpend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 24 && !pick; i++) { await new Promise(r => setTimeout(r, 250));
  const list = await (await fetch(base + "/json/list")).json();
  pick = list.find(t => t.id === tid && t.webSocketDebuggerUrl); }
if (!pick) throw new Error("page ws missing");
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, {res, rej}); pws.send(JSON.stringify({id, method, params})); });
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const {res, rej} = ppend.get(m.id); ppend.delete(m.id); m.error ? rej(new Error(m.method+": "+m.error.message)) : res(m); } };
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });

await pmsg("Page.enable"); await pmsg("Runtime.enable"); await pmsg("Network.enable"); await pmsg("Log.enable");
const events = [];
pws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) {
    const text = m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 300);
    events.push("CONSOLE " + m.params.type + ": " + text);
  } else if (m.method === "Runtime.exceptionThrown") {
    const d = m.params.exceptionDetails;
    events.push("EXCEPTION: " + (d.exception?.description ?? d.text ?? "").split("\n").slice(0, 6).join("\n").slice(0, 500));
  } else if (m.method === "Network.loadingFailed") {
    events.push("NETFAIL: " + m.params.errorText + " " + (m.params.requestId ?? ""));
  } else if (m.method === "Log.entryAdded" && m.params.entry.level === "error") {
    events.push("LOGERR: " + m.params.entry.text.slice(0, 300));
  } else if (m.method === "Network.responseReceived" && m.params.response.status >= 400) {
    events.push("HTTP" + m.params.response.status + ": " + (m.params.response.url || "").slice(0, 200));
  }
});
await new Promise(r => setTimeout(r, settle));
const r = await pmsg("Runtime.evaluate", { expression: `JSON.stringify({t: document.title, h1: document.querySelector("h1")?.innerText ?? null, it: (document.body?.innerText ?? "").replace(/\\s+/g," ").trim().slice(0,300), links: [...document.querySelectorAll("a")].length, scripts: document.scripts.length})`, returnByValue: true });
console.log("PAGE:", r.result?.result?.value);
for (const ev of events) console.log(ev);
pws.close();
try { await bmsg("Target.closeTarget", { targetId: tid }); } catch {}
bws.close();
process.exit(0);
