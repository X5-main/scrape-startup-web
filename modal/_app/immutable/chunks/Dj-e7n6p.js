(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`baeaaa02-7849-4d4b-9057-b4e9b47b3d5c`,e._sentryDebugIdIdentifier=`sentry-dbid-baeaaa02-7849-4d4b-9057-b4e9b47b3d5c`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as u}from"./CPby7b1n.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./B4L_if842.js";import{t as p}from"./DeWGVqas2.js";var m={toc:[{depth:1,value:`Add Modal Apps to Tailscale`,id:`add-modal-apps-to-tailscale`}],rawContent:`# Add Modal Apps to Tailscale

This example demonstrates how to integrate Modal with Tailscale (https://tailscale.com).
It outlines the steps to configure Modal containers so that they join the Tailscale network.

We use a custom entrypoint to automatically add containers to a Tailscale network (tailnet).
This configuration enables the containers to interact with one another and with
additional applications within the same tailnet.

\`\`\`python
import modal

\`\`\`

Install Tailscale and copy custom entrypoint script ([entrypoint.sh](https://github.com/modal-labs/modal-examples/blob/main/10_integrations/tailscale/entrypoint.sh)). The script must be
executable.

\`\`\`python
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("curl")
    .run_commands("curl -fsSL https://tailscale.com/install.sh | sh")
    .uv_pip_install("requests==2.32.3", "PySocks==1.7.1")
    .add_local_file("./entrypoint.sh", "/root/entrypoint.sh", copy=True)
    .run_commands("chmod a+x /root/entrypoint.sh")
    .entrypoint(["/root/entrypoint.sh"])
)
app = modal.App("example-modal-tailscale", image=image)

\`\`\`

Packages might not be installed locally. This catches import errors and
only attempts imports in the container.

\`\`\`python
with image.imports():
    import socket

    import socks

\`\`\`

Configure Python to use the SOCKS5 proxy globally.

\`\`\`python
if not modal.is_local():
    socks.set_default_proxy(socks.SOCKS5, "0.0.0.0", 1080)
    socket.socket = socks.socksocket


\`\`\`

Run your function adding a Tailscale secret. We suggest creating a [reusable and ephemeral key](https://tailscale.com/kb/1111/ephemeral-nodes).

\`\`\`python
@app.function(
    secrets=[
        modal.Secret.from_name("tailscale-auth", required_keys=["TAILSCALE_AUTHKEY"]),
        modal.Secret.from_dict(
            {
                "ALL_PROXY": "socks5://localhost:1080/",
                "HTTP_PROXY": "http://localhost:1080/",
                "http_proxy": "http://localhost:1080/",
            }
        ),
    ],
)
def connect_to_machine():
    import requests

    # Connect to other machines in your tailnet.
    resp = requests.get("http://my-tailscale-machine:5000")
    print(resp.content)


\`\`\`

Run this script with \`modal run modal_tailscale.py\`. You will see Tailscale logs
when the container start indicating that you were able to login successfully and
that the proxies (SOCKS5 and HTTP) have created been successfully. You will also
be able to see Modal containers in your Tailscale dashboard in the "Machines" tab.
Every new container launched will show up as a new "machine". Containers are
individually addressable using their Tailscale name or IP address.
`,meta:{title:`Add Modal Apps to Tailscale`,description:`This example demonstrates how to integrate Modal with Tailscale (https://tailscale.com). It outlines the steps to configure Modal containers so that they join the Tailscale network.`}},{toc:h,rawContent:g,meta:_}=m,v=t(`<!> <p>This example demonstrates how to integrate Modal with Tailscale (<!>).
It outlines the steps to configure Modal containers so that they join the Tailscale network.</p> <p>We use a custom entrypoint to automatically add containers to a Tailscale network (tailnet).
This configuration enables the containers to interact with one another and with
additional applications within the same tailnet.</p> <!> <p>Install Tailscale and copy custom entrypoint script (<!>). The script must be
executable.</p> <!> <p>Packages might not be installed locally. This catches import errors and
only attempts imports in the container.</p> <!> <p>Configure Python to use the SOCKS5 proxy globally.</p> <!> <p>Run your function adding a Tailscale secret. We suggest creating a <!>.</p> <!> <p>Run this script with <code>modal run modal_tailscale.py</code>. You will see Tailscale logs
when the container start indicating that you were able to login successfully and
that the proxies (SOCKS5 and HTTP) have created been successfully. You will also
be able to see Modal containers in your Tailscale dashboard in the “Machines” tab.
Every new container launched will show up as a new “machine”. Containers are
individually addressable using their Tailscale name or IP address.</p>`,1);function y(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>g,()=>m,{children:(t,a)=>{var o=v(),f=s(o);u(f,{id:`add-modal-apps-to-tailscale`,children:(e,t)=>{l(),i(e,r(`Add Modal Apps to Tailscale`))},$$slots:{default:!0}});var m=c(f,2);p(c(e(m)),{href:`https://tailscale.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`https://tailscale.com`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,4);d(h,{code:`import%20modal%0A`,lang:`python`});var g=c(h,2);p(c(e(g)),{href:`https://github.com/modal-labs/modal-examples/blob/main/10_integrations/tailscale/entrypoint.sh`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`entrypoint.sh`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);d(_,{code:`image%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim(python_version%3D%223.11%22)%0A%20%20%20%20.apt_install(%22curl%22)%0A%20%20%20%20.run_commands(%22curl%20-fsSL%20https%3A%2F%2Ftailscale.com%2Finstall.sh%20%7C%20sh%22)%0A%20%20%20%20.uv_pip_install(%22requests%3D%3D2.32.3%22%2C%20%22PySocks%3D%3D1.7.1%22)%0A%20%20%20%20.add_local_file(%22.%2Fentrypoint.sh%22%2C%20%22%2Froot%2Fentrypoint.sh%22%2C%20copy%3DTrue)%0A%20%20%20%20.run_commands(%22chmod%20a%2Bx%20%2Froot%2Fentrypoint.sh%22)%0A%20%20%20%20.entrypoint(%5B%22%2Froot%2Fentrypoint.sh%22%5D)%0A)%0Aapp%20%3D%20modal.App(%22example-modal-tailscale%22%2C%20image%3Dimage)%0A`,lang:`python`});var y=c(_,4);d(y,{code:`with%20image.imports()%3A%0A%20%20%20%20import%20socket%0A%0A%20%20%20%20import%20socks%0A`,lang:`python`});var b=c(y,4);d(b,{code:`if%20not%20modal.is_local()%3A%0A%20%20%20%20socks.set_default_proxy(socks.SOCKS5%2C%20%220.0.0.0%22%2C%201080)%0A%20%20%20%20socket.socket%20%3D%20socks.socksocket%0A%0A`,lang:`python`});var x=c(b,2);p(c(e(x)),{href:`https://tailscale.com/kb/1111/ephemeral-nodes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`reusable and ephemeral key`))},$$slots:{default:!0}}),l(),n(x),d(c(x,2),{code:`%40app.function(%0A%20%20%20%20secrets%3D%5B%0A%20%20%20%20%20%20%20%20modal.Secret.from_name(%22tailscale-auth%22%2C%20required_keys%3D%5B%22TAILSCALE_AUTHKEY%22%5D)%2C%0A%20%20%20%20%20%20%20%20modal.Secret.from_dict(%0A%20%20%20%20%20%20%20%20%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22ALL_PROXY%22%3A%20%22socks5%3A%2F%2Flocalhost%3A1080%2F%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22HTTP_PROXY%22%3A%20%22http%3A%2F%2Flocalhost%3A1080%2F%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22http_proxy%22%3A%20%22http%3A%2F%2Flocalhost%3A1080%2F%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%5D%2C%0A)%0Adef%20connect_to_machine()%3A%0A%20%20%20%20import%20requests%0A%0A%20%20%20%20%23%20Connect%20to%20other%20machines%20in%20your%20tailnet.%0A%20%20%20%20resp%20%3D%20requests.get(%22http%3A%2F%2Fmy-tailscale-machine%3A5000%22)%0A%20%20%20%20print(resp.content)%0A%0A`,lang:`python`}),l(2),i(t,o)},$$slots:{default:!0}}))}export{y as default,m as metadata};
//# sourceMappingURL=Dj-e7n6p.js.map
