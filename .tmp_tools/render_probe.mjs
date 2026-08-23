// Render-probe a URL in headless Chrome (port 9344): report hydration + iframe chart state + console errors.
// Usage: bun render_probe.mjs <url> <label>
const [, , url, label] = process.argv;
const base = "http://127.0.0.1:9344";
const v = await (await fetch(base + "/json/version")).json();
const bws = new WebSocket(v.webSocketDebuggerUrl);
let idc = 0; const pend = new Map();
const bmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++idc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method, params })); });
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });

const created = await bmsg("Target.createTarget", { url });
const tid = created.result.targetId;
let pick = null;
for (let i = 0; i < 20 && !pick; i++) { await new Promise(r => setTimeout(r, 250)); pick = (await (await fetch(base + "/json/list")).json()).find(t => t.id === tid); }
const pws = new WebSocket(pick.webSocketDebuggerUrl);
let pidc = 0; const ppend = new Map();
const pmsg = (method, params = {}) => new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); pws.send(JSON.stringify({ id, method, params })); });
pws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); ppend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } else if (m.method === "Runtime.consoleAPICalled") { console.log("CONSOLE[" + label + "]", m.params.type, (m.params.args || []).map(a => a.value ?? a.description ?? "").join(" ").slice(0, 200)); } };
await new Promise((r, j) => { pws.onopen = r; pws.onerror = j; });
await pmsg("Runtime.enable");
await new Promise(r => setTimeout(r, 16000));
const res = await pmsg("Runtime.evaluate", {
  expression: `(async () => {
    const out = { title: document.title, h1: document.querySelector('h1')?.innerText ?? null,
      textLen: document.body?.innerText?.length ?? -1,
      iframes: [] };
    for (const f of document.querySelectorAll('iframe')) {
      try {
        const w = f.contentWindow, d = f.contentDocument;
        out.iframes.push({ src: f.getAttribute('src'),
          hasChart: !!(w && w.Chart),
          canvases: d ? d.querySelectorAll('canvas').length : -1,
          h: d ? d.querySelectorAll('canvas')[0]?.height ?? 0 : -1,
          docTitle: d?.title ?? null });
      } catch (e) { out.iframes.push({ src: f.getAttribute('src'), err: String(e) }); }
    }
    return JSON.stringify(out);
  })()`,
  awaitPromise: true, returnByValue: true
});
console.log("PROBE[" + label + "]", res.result?.result?.value);
bws.close(); pws.close(); process.exit(0);
