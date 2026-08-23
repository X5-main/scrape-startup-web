const CDP = "ws://127.0.0.1:9340/devtools/browser/cf4517c1-747d-414f-9420-c0f5939c5b82";
const TARGET = "http://127.0.0.1:8922/";
let id = 0;
const pending = new Map<number, (m: any) => void>();
const errors: Array<[number, string, string]> = [];
const log = (...a: any[]) => console.log(new Date().toISOString().slice(11, 19), ...a);
const withTimeout = <T,>(p: Promise<T>, ms: number, what: string): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("hang: " + what)), ms))]);
function send(method: string, params: any = {}, sessionId?: string, label = method) {
  return withTimeout(new Promise<any>((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m: any) => (m.error ? reject(new Error(method + ": " + JSON.stringify(m.error).slice(0,200))) : resolve(m)));
    ws.send(JSON.stringify({ id: mid, sessionId, method, params }));
  }), 8000, label);
}
const ws = new WebSocket(CDP);
ws.addEventListener("open", () => log("open OK"));
ws.addEventListener("message", (ev: any) => {
  try {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)!(msg); pending.delete(msg.id); }
    else if (msg.method === "Network.responseReceived") {
      const p = msg.params;
      if (p.response.status >= 400) errors.push([p.response.status, p.response.mimeType || "", p.response.url.slice(0, 150)]);
    }
  } catch (e) { log("parse err", String(e)); }
});
ws.addEventListener("error", (e: any) => log("WS error", JSON.stringify(e)));
await withTimeout(new Promise<void>((r) => ws.addEventListener("open", () => r())), 8000, "open");
const { result } = await send("Target.getTargets", {}, undefined, "getTargets");
log("targets", result.targetInfos.length);
const page = result.targetInfos.find((t: any) => t.type === "page");
if (!page) throw new Error("no page target");
log("using page", page.url.slice(0, 90));
const { result: att } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true }, undefined, "attach");
const sid = att.sessionId;
log("sid", sid);
await send("Page.enable", {}, sid, "Page.enable");
await send("Network.enable", {}, sid, "Network.enable");
await send("Page.navigate", { url: TARGET }, sid, "navigate");
log("navigated");
await withTimeout(new Promise<void>((r) => setTimeout(r, 9000)), 11000, "wait9");
for (let k = 0; k < 7; k++) {
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, document.body.scrollHeight);" }, sid, "scroll");
  await withTimeout(new Promise<void>((r) => setTimeout(r, 1500)), 4000, "wait1.5");
}
await withTimeout(new Promise<void>((r) => setTimeout(r, 4000)), 6000, "wait4");
log("errors:", errors.length);
const uniq = new Map<string, [number, string, number]>();
for (const [st, mt, u] of errors) {
  const k = `${st}|${mt}|${u}`;
  const e = uniq.get(k) || [st, mt, 0];
  e[2] += 1; uniq.set(k, e);
}
for (const [st, mt, cnt] of uniq.values()) log("  " + st + " " + mt + " x" + cnt);
ws.close();
process.exit(0);
