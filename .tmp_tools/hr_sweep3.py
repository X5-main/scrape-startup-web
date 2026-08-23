import asyncio, json, websockets

CDP = "ws://127.0.0.1:9340"
TARGET = "http://127.0.0.1:8922/"

async def main():
    async with websockets.connect(CDP, max_size=64*1024*1024) as ws:
        n = 0
        async def send(method, params=None):
            nonlocal n
            n += 1
            await ws.send(json.dumps({"id": n, "method": method, "params": params or {}}))
        # find a page target
        await send("Target.getTargets")
        while True:
            msg = json.loads(await ws.recv())
            if msg.get("id") == n:
                targets = msg["result"]["targetInfos"]
                pages = [t for t in targets if t["type"] == "page"]
                page = pages[0]
                if not pages: raise SystemExit("no page target")
                break
        sid = None
        await send("Target.attachToTarget", {"targetId": page["targetId"], "flatten": True})
        while True:
            msg = json.loads(await ws.recv())
            if msg.get("id") == n:
                sid = msg["result"]["sessionId"]
                break
        bad = []
        def recv_loop():
            try:
                while True:
                    msg = json.loads(ws.recv())
                    m = msg.get("method")
                    if m == "Network.responseReceived":
                        p = msg["params"]
                        if p["response"]["status"] >= 400:
                            bad.append((p["response"]["status"], p["response"].get("mimeType",""), p["response"]["url"][:140]))
            except Exception:
                pass
        import threading
        t = threading.Thread(target=recv_loop, daemon=True)
        t.start()
        async def s(method, params=None):
            nonlocal n
            n += 1
            await ws.send(json.dumps({"id": n, "sessionId": sid, "method": method, "params": params or {}}))
            while True:
                msg = json.loads(await ws.recv())
                if msg.get("id") == n:
                    return msg
        await s("Page.enable"); await s("Network.enable")
        await s("Page.navigate", {"url": TARGET})
        await asyncio.sleep(9)
        # scroll to bottom in waves
        await s("Runtime.evaluate", {"expression": "var i=0;function f(){window.scrollTo(0,document.body.scrollHeight);i++;"})
        for _ in range(6):
            await s("Runtime.evaluate", {"expression": "window.scrollTo(0,document.body.scrollHeight);"})
            await asyncio.sleep(1.5)
        await asyncio.sleep(4)
        # classify
        from collections import Counter
        c = Counter((st, m.split(';')[0] if m else '') for st, m, u in bad)
        print("== 404s ==", len(bad))
        for (st, mt), cnt in c.most_common():
            print(f"  {st} {mt} x{cnt}")
        for st, mt, u in sorted(set(bad)):
            print("   ", st, mt, u)
        # also tally all 4xx
        fourxx = [b for b in bad if b[0] >= 400]
        print("TOTAL >=400:", len(fourxx))

asyncio.run(main())
