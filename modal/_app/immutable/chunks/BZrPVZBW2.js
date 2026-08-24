(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c18ef68b-a6ce-425f-96b7-d827a20b13de`,e._sentryDebugIdIdentifier=`sentry-dbid-c18ef68b-a6ce-425f-96b7-d827a20b13de`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h=`/_app/immutable/assets/ui.BaSTrcQW.png`,g={toc:[{depth:1,value:`Deploy 100,000 multiplayer checkboxes on Modal with FastHTML`,id:`deploy-100000-multiplayer-checkboxes-on-modal-with-fasthtml`}],rawContent:`# Deploy 100,000 multiplayer checkboxes on Modal with FastHTML

[![Screenshot of FastHTML Checkboxes UI](./ui.png)](https://modal-labs-examples--example-fasthtml-checkboxes-web.modal.run)

This example shows how you can deploy a multiplayer checkbox game with FastHTML on Modal.

[FastHTML](https://www.fastht.ml/) is a Python library built on top of [HTMX](https://htmx.org/)
which allows you to create entire web applications using only Python.
For a simpler template for using FastHTML with Modal, check out
[this example](https://modal.com/docs/examples/fasthtml_app).

Our example is inspired by [1 Million Checkboxes](https://onemillioncheckboxes.com/).

\`\`\`python
import time
from asyncio import Lock
from pathlib import Path
from uuid import uuid4

import modal

from .constants import N_CHECKBOXES

app = modal.App("example-fasthtml-checkboxes")
db = modal.Dict.from_name("example-fasthtml-checkboxes-db", create_if_missing=True)

css_path_local = Path(__file__).parent / "styles.css"
css_path_remote = "/assets/styles.css"


@app.function(
    image=modal.Image.debian_slim(python_version="3.12")
    .uv_pip_install("python-fasthtml==0.12.21", "inflect~=7.4.0")
    .add_local_file(css_path_local, remote_path=css_path_remote),
    max_containers=1,  # we currently maintain state in memory, so we restrict the server to one worker
)
@modal.concurrent(max_inputs=100)
@modal.asgi_app()
def web():
    import fasthtml.common as fh
    import inflect

    # Connected clients are tracked in-memory
    clients = {}
    clients_mutex = Lock()

    # We keep all checkbox fasthtml elements in memory during operation, and persist to modal dict across restarts
    checkboxes = db.get("checkboxes", [])
    checkbox_mutex = Lock()

    if len(checkboxes) == N_CHECKBOXES:
        print("Restored checkbox state from previous session.")
    else:
        print("Initializing checkbox state.")
        checkboxes = []
        for i in range(N_CHECKBOXES):
            checkboxes.append(
                fh.Input(
                    id=f"cb-{i}",
                    type="checkbox",
                    checked=False,
                    # when clicked, that checkbox will send a POST request to the server with its index
                    hx_post=f"/checkbox/toggle/{i}",
                    hx_swap_oob="true",  # allows us to later push diffs to arbitrary checkboxes by id
                )
            )

    async def on_shutdown():
        # Handle the shutdown event by persisting current state to modal dict
        async with checkbox_mutex:
            db["checkboxes"] = checkboxes
        print("Checkbox state persisted.")

    style = Path(css_path_remote).read_text()
    app, _ = fh.fast_app(
        # FastHTML uses the ASGI spec, which allows handling of shutdown events
        on_shutdown=[on_shutdown],
        hdrs=[fh.Style(style)],
    )

    # handler run on initial page load
    @app.get("/")
    async def get():
        # register a new client
        client = Client()
        async with clients_mutex:
            clients[client.id] = client

        return (
            fh.Title(f"{N_CHECKBOXES // 1000}k Checkboxes"),
            fh.Main(
                fh.H1(
                    f"{inflect.engine().number_to_words(N_CHECKBOXES).title()} Checkboxes"
                ),
                fh.Div(
                    *checkboxes,
                    id="checkbox-array",
                ),
                cls="container",
                # use HTMX to poll for diffs to apply
                hx_trigger="every 1s",  # poll every second
                hx_get=f"/diffs/{client.id}",  # call the diffs endpoint
                hx_swap="none",  # don't replace the entire page
            ),
        )

    # users submitting checkbox toggles
    @app.post("/checkbox/toggle/{i}")
    async def toggle(i: int):
        async with checkbox_mutex:
            cb = checkboxes[i]
            cb.checked = not cb.checked
            checkboxes[i] = cb

        async with clients_mutex:
            expired = []
            for client in clients.values():
                # clean up old clients
                if not client.is_active():
                    expired.append(client.id)

                # add diff to client for when they next poll
                client.add_diff(i)

            for client_id in expired:
                del clients[client_id]
        return

    # clients polling for any outstanding diffs
    @app.get("/diffs/{client_id}")
    async def diffs(client_id: str):
        # we use the \`hx_swap_oob='true'\` feature to
        # push updates only for the checkboxes that changed
        async with clients_mutex:
            client = clients.get(client_id, None)
            if client is None or len(client.diffs) == 0:
                return

            client.heartbeat()
            diffs = client.pull_diffs()

        async with checkbox_mutex:
            diff_array = [checkboxes[i] for i in diffs]

        return diff_array

    return app


\`\`\`

Class for tracking state to push out to connected clients

\`\`\`python
class Client:
    def __init__(self):
        self.id = str(uuid4())
        self.diffs = []
        self.inactive_deadline = time.time() + 30

    def is_active(self):
        return time.time() < self.inactive_deadline

    def heartbeat(self):
        self.inactive_deadline = time.time() + 30

    def add_diff(self, i):
        if i not in self.diffs:
            self.diffs.append(i)

    def pull_diffs(self):
        # return a copy of the diffs and clear them
        diffs = self.diffs
        self.diffs = []
        return diffs

\`\`\`
`,meta:{title:`Deploy 100,000 multiplayer checkboxes on Modal with FastHTML`,description:`This example shows how you can deploy a multiplayer checkbox game with FastHTML on Modal.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p><!></p> <p>This example shows how you can deploy a multiplayer checkbox game with FastHTML on Modal.</p> <p><!> is a Python library built on top of <!> which allows you to create entire web applications using only Python.
For a simpler template for using FastHTML with Modal, check out <!>.</p> <p>Our example is inspired by <!>.</p> <!> <p>Class for tracking state to push out to connected clients</p> <!>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),p=s(o);u(p,{id:`deploy-100000-multiplayer-checkboxes-on-modal-with-fasthtml`,children:(e,t)=>{l(),i(e,r(`Deploy 100,000 multiplayer checkboxes on Modal with FastHTML`))},$$slots:{default:!0}});var g=c(p,2);m(e(g),{href:`https://modal-labs-examples--example-fasthtml-checkboxes-web.modal.run`,rel:`nofollow`,children:(e,t)=>{d(e,{get src(){return h},alt:`Screenshot of FastHTML Checkboxes UI`})},$$slots:{default:!0}}),n(g);var _=c(g,4),v=e(_);m(v,{href:`https://www.fastht.ml/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`FastHTML`))},$$slots:{default:!0}});var y=c(v,2);m(y,{href:`https://htmx.org/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`HTMX`))},$$slots:{default:!0}}),m(c(y,2),{href:`https://modal.com/docs/examples/fasthtml_app`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this example`))},$$slots:{default:!0}}),l(),n(_);var x=c(_,2);m(c(e(x)),{href:`https://onemillioncheckboxes.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`1 Million Checkboxes`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);f(S,{code:`import%20time%0Afrom%20asyncio%20import%20Lock%0Afrom%20pathlib%20import%20Path%0Afrom%20uuid%20import%20uuid4%0A%0Aimport%20modal%0A%0Afrom%20.constants%20import%20N_CHECKBOXES%0A%0Aapp%20%3D%20modal.App(%22example-fasthtml-checkboxes%22)%0Adb%20%3D%20modal.Dict.from_name(%22example-fasthtml-checkboxes-db%22%2C%20create_if_missing%3DTrue)%0A%0Acss_path_local%20%3D%20Path(__file__).parent%20%2F%20%22styles.css%22%0Acss_path_remote%20%3D%20%22%2Fassets%2Fstyles.css%22%0A%0A%0A%40app.function(%0A%20%20%20%20image%3Dmodal.Image.debian_slim(python_version%3D%223.12%22)%0A%20%20%20%20.uv_pip_install(%22python-fasthtml%3D%3D0.12.21%22%2C%20%22inflect~%3D7.4.0%22)%0A%20%20%20%20.add_local_file(css_path_local%2C%20remote_path%3Dcss_path_remote)%2C%0A%20%20%20%20max_containers%3D1%2C%20%20%23%20we%20currently%20maintain%20state%20in%20memory%2C%20so%20we%20restrict%20the%20server%20to%20one%20worker%0A)%0A%40modal.concurrent(max_inputs%3D100)%0A%40modal.asgi_app()%0Adef%20web()%3A%0A%20%20%20%20import%20fasthtml.common%20as%20fh%0A%20%20%20%20import%20inflect%0A%0A%20%20%20%20%23%20Connected%20clients%20are%20tracked%20in-memory%0A%20%20%20%20clients%20%3D%20%7B%7D%0A%20%20%20%20clients_mutex%20%3D%20Lock()%0A%0A%20%20%20%20%23%20We%20keep%20all%20checkbox%20fasthtml%20elements%20in%20memory%20during%20operation%2C%20and%20persist%20to%20modal%20dict%20across%20restarts%0A%20%20%20%20checkboxes%20%3D%20db.get(%22checkboxes%22%2C%20%5B%5D)%0A%20%20%20%20checkbox_mutex%20%3D%20Lock()%0A%0A%20%20%20%20if%20len(checkboxes)%20%3D%3D%20N_CHECKBOXES%3A%0A%20%20%20%20%20%20%20%20print(%22Restored%20checkbox%20state%20from%20previous%20session.%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22Initializing%20checkbox%20state.%22)%0A%20%20%20%20%20%20%20%20checkboxes%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20for%20i%20in%20range(N_CHECKBOXES)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20checkboxes.append(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Input(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3Df%22cb-%7Bi%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20type%3D%22checkbox%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20checked%3DFalse%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20when%20clicked%2C%20that%20checkbox%20will%20send%20a%20POST%20request%20to%20the%20server%20with%20its%20index%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hx_post%3Df%22%2Fcheckbox%2Ftoggle%2F%7Bi%7D%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hx_swap_oob%3D%22true%22%2C%20%20%23%20allows%20us%20to%20later%20push%20diffs%20to%20arbitrary%20checkboxes%20by%20id%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%0A%20%20%20%20%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20async%20def%20on_shutdown()%3A%0A%20%20%20%20%20%20%20%20%23%20Handle%20the%20shutdown%20event%20by%20persisting%20current%20state%20to%20modal%20dict%0A%20%20%20%20%20%20%20%20async%20with%20checkbox_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20db%5B%22checkboxes%22%5D%20%3D%20checkboxes%0A%20%20%20%20%20%20%20%20print(%22Checkbox%20state%20persisted.%22)%0A%0A%20%20%20%20style%20%3D%20Path(css_path_remote).read_text()%0A%20%20%20%20app%2C%20_%20%3D%20fh.fast_app(%0A%20%20%20%20%20%20%20%20%23%20FastHTML%20uses%20the%20ASGI%20spec%2C%20which%20allows%20handling%20of%20shutdown%20events%0A%20%20%20%20%20%20%20%20on_shutdown%3D%5Bon_shutdown%5D%2C%0A%20%20%20%20%20%20%20%20hdrs%3D%5Bfh.Style(style)%5D%2C%0A%20%20%20%20)%0A%0A%20%20%20%20%23%20handler%20run%20on%20initial%20page%20load%0A%20%20%20%20%40app.get(%22%2F%22)%0A%20%20%20%20async%20def%20get()%3A%0A%20%20%20%20%20%20%20%20%23%20register%20a%20new%20client%0A%20%20%20%20%20%20%20%20client%20%3D%20Client()%0A%20%20%20%20%20%20%20%20async%20with%20clients_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20clients%5Bclient.id%5D%20%3D%20client%0A%0A%20%20%20%20%20%20%20%20return%20(%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Title(f%22%7BN_CHECKBOXES%20%2F%2F%201000%7Dk%20Checkboxes%22)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20fh.Main(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.H1(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20f%22%7Binflect.engine().number_to_words(N_CHECKBOXES).title()%7D%20Checkboxes%22%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20fh.Div(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20*checkboxes%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20id%3D%22checkbox-array%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20cls%3D%22container%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20use%20HTMX%20to%20poll%20for%20diffs%20to%20apply%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hx_trigger%3D%22every%201s%22%2C%20%20%23%20poll%20every%20second%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hx_get%3Df%22%2Fdiffs%2F%7Bclient.id%7D%22%2C%20%20%23%20call%20the%20diffs%20endpoint%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20hx_swap%3D%22none%22%2C%20%20%23%20don't%20replace%20the%20entire%20page%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20)%0A%0A%20%20%20%20%23%20users%20submitting%20checkbox%20toggles%0A%20%20%20%20%40app.post(%22%2Fcheckbox%2Ftoggle%2F%7Bi%7D%22)%0A%20%20%20%20async%20def%20toggle(i%3A%20int)%3A%0A%20%20%20%20%20%20%20%20async%20with%20checkbox_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20cb%20%3D%20checkboxes%5Bi%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20cb.checked%20%3D%20not%20cb.checked%0A%20%20%20%20%20%20%20%20%20%20%20%20checkboxes%5Bi%5D%20%3D%20cb%0A%0A%20%20%20%20%20%20%20%20async%20with%20clients_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20expired%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20client%20in%20clients.values()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20clean%20up%20old%20clients%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20client.is_active()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20expired.append(client.id)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%23%20add%20diff%20to%20client%20for%20when%20they%20next%20poll%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20client.add_diff(i)%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20for%20client_id%20in%20expired%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20del%20clients%5Bclient_id%5D%0A%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%23%20clients%20polling%20for%20any%20outstanding%20diffs%0A%20%20%20%20%40app.get(%22%2Fdiffs%2F%7Bclient_id%7D%22)%0A%20%20%20%20async%20def%20diffs(client_id%3A%20str)%3A%0A%20%20%20%20%20%20%20%20%23%20we%20use%20the%20%60hx_swap_oob%3D'true'%60%20feature%20to%0A%20%20%20%20%20%20%20%20%23%20push%20updates%20only%20for%20the%20checkboxes%20that%20changed%0A%20%20%20%20%20%20%20%20async%20with%20clients_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20client%20%3D%20clients.get(client_id%2C%20None)%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20client%20is%20None%20or%20len(client.diffs)%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20return%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20client.heartbeat()%0A%20%20%20%20%20%20%20%20%20%20%20%20diffs%20%3D%20client.pull_diffs()%0A%0A%20%20%20%20%20%20%20%20async%20with%20checkbox_mutex%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20diff_array%20%3D%20%5Bcheckboxes%5Bi%5D%20for%20i%20in%20diffs%5D%0A%0A%20%20%20%20%20%20%20%20return%20diff_array%0A%0A%20%20%20%20return%20app%0A%0A`,lang:`python`}),f(c(S,4),{code:`class%20Client%3A%0A%20%20%20%20def%20__init__(self)%3A%0A%20%20%20%20%20%20%20%20self.id%20%3D%20str(uuid4())%0A%20%20%20%20%20%20%20%20self.diffs%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20self.inactive_deadline%20%3D%20time.time()%20%2B%2030%0A%0A%20%20%20%20def%20is_active(self)%3A%0A%20%20%20%20%20%20%20%20return%20time.time()%20%3C%20self.inactive_deadline%0A%0A%20%20%20%20def%20heartbeat(self)%3A%0A%20%20%20%20%20%20%20%20self.inactive_deadline%20%3D%20time.time()%20%2B%2030%0A%0A%20%20%20%20def%20add_diff(self%2C%20i)%3A%0A%20%20%20%20%20%20%20%20if%20i%20not%20in%20self.diffs%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20self.diffs.append(i)%0A%0A%20%20%20%20def%20pull_diffs(self)%3A%0A%20%20%20%20%20%20%20%20%23%20return%20a%20copy%20of%20the%20diffs%20and%20clear%20them%0A%20%20%20%20%20%20%20%20diffs%20%3D%20self.diffs%0A%20%20%20%20%20%20%20%20self.diffs%20%3D%20%5B%5D%0A%20%20%20%20%20%20%20%20return%20diffs%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=BZrPVZBW2.js.map
