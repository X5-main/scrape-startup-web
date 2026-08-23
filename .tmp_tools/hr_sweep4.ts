const CDP = "ws://127.0.0.1:9340/devtools/browser/cf4517c1-747d-414f-9420-c0f5939c5b82";
const ws = new WebSocket(CDP);
let id = 0;
const pending = new Map<number, (m: any) => void>();
const errors: Array<[number, string]> = [];
const log = (...a: any[]) => console.log(new Date().toISOString().slice(11, 19), ...a);
const withTimeout = <T,>(p: Promise<T>, ms: number, what: string): Promise<T> =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("hang: " + what)), ms))]);
function send(method: string, params: any = {}, sessionId?: string, label = method) {
  return withTimeout(new Promise<any>((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, (m: any) => (m.error ? reject(new Error(method + ":" + JSON.stringify(m.error).slice(0,150))) : resolve(m)));
    ws.send(JSON.stringify({ id: mid, sessionId, method, params }));
  }), 8000, label);
}
const ws2: any = ws;
ws2.addEventListener("open", () => log("open"));
ws2.addEventListener("message", (ev: any) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)!(msg); pending.delete(msg.id); }
  else if (msg.method === "Network.responseReceived") {
    const p = msg.params;
    if (p.response.status >= 400) errors.push([p.response.status, p.response.url.slice(0, 150)]);
  }
});
await withTimeout(new Promise<void>((r) => ws2.addEventListener("open", () => r())), 8000, "open");
const { result } = await send("Target.getTargets", {});
const page = result.targetInfos.find((t: any) => t.type === "page");
const { result: att } = await send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
const sid = att.sessionId;
for (const url of ["http://127.0.0.1:8922/es/", "http://127.0.0.1:8922/pricing"]) {
  errors.length = 0;
  await send("Network.enable", {}, sid);
  await send("Page.enable", {}, sid);
  await send("Page.navigate", { url }, sid);
  await withTimeout(new Promise<void>((r) => setTimeout(r, 7000)), 10000, "wait");
  for (let k = 0; k < 4; k++) {
    await send("Runtime.evaluate", { expression: "window.scrollTo(0, document.body.scrollHeight);" }, sid, "scroll");
    await withTimeout(new Promise<void>((r) => setTimeout(r, 1200)), 4000, "w");
  }
  await withTimeout(new Promise<void>((r) => setTimeout(r, 3000)), 6000, "w2");
  const r = await send("Runtime.evaluate", {
    expression: "JSON.stringify(performance.getEntriesByType('resource').filter(r=>r.responseStatus>=400).map(r=>[r.responseStatus,r.name.slice(0,120)]))",
  }, sid, "perf");
  const perf = JSON.parse(r.result.result.value || "[]");
  log(url, "net-errors:", errors.length, "perf-errors:", perf.length);
  for (const e of errors) log("   net", e[0], e[1]);
  for (const e of perf) log("   perf", e[0], e[1]);
}
ws.close();
process.exit(0);
