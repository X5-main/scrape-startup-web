// D55: navigate-based probe (address-bar semantics) for placeholder svg resolution.
// Usage: bun d55_probe_nav.mjs
const withT = (p, ms, what) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("TIMEOUT " + what)), ms))]);
const bws = new WebSocket("ws://127.0.0.1:9224/cdp");
let bidc = 0; const pend = new Map();
const bmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++bidc; pend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p })); }), 20000, m);
bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
await new Promise((r, j) => { bws.onopen = r; bws.onerror = j; });
let tid = null;
try {
  const created = await bmsg("Target.createTarget", { url: "about:blank" });
  tid = created.result.targetId;
  const attach = await bmsg("Target.attachToTarget", { targetId: tid, flatten: true });
  const sid = attach.result.sessionId;
  let pidc = 0; const ppend = new Map();
  const pmsg = (m, p = {}) => withT(new Promise((res, rej) => { const id = ++pidc; ppend.set(id, { res, rej }); bws.send(JSON.stringify({ id, method: m, params: p, sessionId: sid })); }), 60000, m);
  bws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && ppend.has(m.id)) { const p = ppend.get(m.id); ppend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m); } };
  await pmsg("Page.enable"); await pmsg("Runtime.enable");
  const evalJs = async (expr) => (await pmsg("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const nav = async (u) => {
    await pmsg("Page.navigate", { url: u });
    for (let i = 0; i < 60; i++) { await new Promise(r => setTimeout(r, 500)); const st = await evalJs("document.readyState"); if (st !== "loading") break; }
    await new Promise(r => setTimeout(r, 800));
    const r = await evalJs(`(() => { const t = document.title || ""; const dt = document.documentElement?.outerHTML || ""; const img = document.images && document.images[0]; return { url: location.href, finalHost: location.host, ready: document.readyState, title: t.slice(0, 80), head: dt.slice(0, 160), isXml: (dt.match(/^<\\?xml/i) || dt.match(/^<Error>/i)) ? dt.slice(0, 200) : null, imgW: img ? img.naturalWidth : null, ct: document.contentType }; })()`);
    console.log("NAV", u, "\n  ->", JSON.stringify(r));
  };
  await nav("https://www.micro1.ai/plugins/Basic/assets/placeholder.60f9b1840c.svg");
  await nav("https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg");
  await nav("http://127.0.0.1:8973/plugins/Basic/assets/placeholder.60f9b1840c.svg");
} catch (e) {
  console.log("ERR", e.message);
} finally {
  if (tid) { try { await bmsg("Target.closeTarget", { targetId: tid }); } catch (e) {} }
  bws.close(); process.exit(0);
}
