(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`fdee897d-18fc-4899-a017-02b36670f75f`,e._sentryDebugIdIdentifier=`sentry-dbid-fdee897d-18fc-4899-a017-02b36670f75f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Tunnels`,id:`tunnels`,children:[{depth:2,value:`Build with tunnels`,id:`build-with-tunnels`,children:[{depth:3,value:`Programmable startup`,id:`programmable-startup`},{depth:3,value:`Advanced: Unencrypted TCP tunnels`,id:`advanced-unencrypted-tcp-tunnels`}]},{depth:2,value:`Pricing`,id:`pricing`},{depth:2,value:`Security`,id:`security`}]}],rawContent:`# Tunnels

Modal allows you to expose live TCP ports on a Modal container. This is done by
creating a _tunnel_ that forwards the port to the public Internet.

\`\`\`python
import modal

app = modal.App()


@app.function()
def start_app():
    # Inside this \`with\` block, port 8000 on the container can be accessed by
    # the address at \`tunnel.url\`, which is randomly assigned.
    with modal.forward(8000) as tunnel:
        print(f"tunnel.url        = {tunnel.url}")
        print(f"tunnel.tls_socket = {tunnel.tls_socket}")
        # ... start some web server at port 8000, using any framework
\`\`\`

Tunnels are direct connections and terminate TLS automatically. Within a few
milliseconds of container startup, this function prints a message such as:

\`\`\`
tunnel.url        = https://wtqcahqwhd4tu0.r5.modal.host
tunnel.tls_socket = ('wtqcahqwhd4tu0.r5.modal.host', 443)
\`\`\`

You can also create tunnels on a [Sandbox](/docs/guide/sandbox-networking#forwarding-ports)
to directly expose the container's ports.

## Build with tunnels

Tunnels are the fastest way to get a low-latency, direct connection to a running
container. You can use them to run live browser applications with **interactive
terminals**, **Jupyter notebooks**, **VS Code servers**, and more.

As a quick example, here is how you would expose a Jupyter notebook:

\`\`\`python
import os
import secrets
import subprocess

import modal


image = modal.Image.debian_slim().pip_install("jupyterlab")
app = modal.App(image=image)


@app.function()
def run_jupyter():
    token = secrets.token_urlsafe(13)
    with modal.forward(8888) as tunnel:
        url = tunnel.url + "/?token=" + token
        print(f"Starting Jupyter at {url}")
        subprocess.run(
            [
                "jupyter",
                "lab",
                "--no-browser",
                "--allow-root",
                "--ip=0.0.0.0",
                "--port=8888",
                "--LabApp.allow_origin='*'",
                "--LabApp.allow_remote_access=1",
            ],
            env={**os.environ, "JUPYTER_TOKEN": token, "SHELL": "/bin/bash"},
            stderr=subprocess.DEVNULL,
        )
\`\`\`

When you run the function, it starts Jupyter and gives you the public URL. It's
as simple as that.

All Modal features are supported. If you
[need GPUs](https://modal.com/docs/guide/gpu), pass \`gpu=\` to the
\`@app.function()\` decorator. If you
[need more CPUs, RAM](https://modal.com/docs/guide/resources), or to attach
[volumes](https://modal.com/docs/guide/volumes), those
also just work.

### Programmable startup

The tunnel API is completely on-demand, so you can start them as the result of a
web request.

For example, you could make something like Jupyter Hub without leaving Modal,
giving your users their own Jupyter notebooks when they visit a URL:

\`\`\`python
import modal


image = modal.Image.debian_slim().pip_install("fastapi[standard]")
app = modal.App(image=image)


@app.function(timeout=900)  # 15 minutes
def run_jupyter(q):
    ...  # as before, but return the URL on app.q


@app.function()
@modal.fastapi_endpoint(method="POST")
def jupyter_hub():
    from fastapi import HTTPException
    from fastapi.responses import RedirectResponse

    ...  # do some validation on the secret or bearer token

    if is_valid:
        with modal.Queue.ephemeral() as q:
            run_jupyter.spawn(q)
            url = q.get()
            return RedirectResponse(url, status_code=303)

    else:
        raise HTTPException(401, "Not authenticated")
\`\`\`

This gives every user who sends a POST request to the Web Function their own
Jupyter notebook server, on a fully isolated Modal container.

You could do the same with VS Code and get some basic version of an instant,
serverless IDE!

### Advanced: Unencrypted TCP tunnels

By default, tunnels are only exposed to the Internet at a secure random URL, and
connections have automatic TLS (the "S" in HTTPS). However, sometimes you might
need to expose a protocol like an SSH server that goes directly over TCP. In
this case, we have support for _unencrypted_ tunnels:

\`\`\`python notest
with modal.forward(8000, unencrypted=True) as tunnel:
    print(f"tunnel.tcp_socket = {tunnel.tcp_socket}")
\`\`\`

Might produce an output like:

\`\`\`
tunnel.tcp_socket = ('r3.modal.host', 23447)
\`\`\`

You can then connect over TCP, for example with \`nc r3.modal.host 23447\`. Unlike
encrypted TLS sockets, these cannot be given a non-guessable, cryptographically
random URL due to how the TCP protocol works, so they are assigned a random port
number instead.

## Pricing

Modal only charges for containers based on
[the resources you use](https://modal.com/pricing). There is no additional
charge for having an active tunnel.

For example, if you start a Jupyter notebook on port 8888 and access it via
tunnel, you can use it for an hour for development (with 0.01 CPUs) and then
actually run an intensive job with 16 CPUs for one minute. The amount you would
be billed for in that hour is 0.01 + 16 \\* (1/60) = **0.28 CPUs**, even though
you had access to 16 CPUs without needing to restart your notebook.

## Security

Tunnels are run on Modal's private global network of Internet relays. On
startup, your container will connect to the nearest tunnel so you get the
minimum latency, very similar in performance to a direct connection with the
machine.

This makes them ideal for live debugging sessions, using web-based terminals
like [ttyd](https://github.com/tsl0922/ttyd).

The generated URLs are cryptographically random, but they are also public on the
Internet, so anyone can access your application if they are given the URL.

We do not currently do any detection of requests above L4, so if you are running
a web server, we will not add special proxy HTTP headers or translate HTTP/2.
You're just getting the TLS-encrypted TCP stream directly!
`,meta:{title:`Tunnels`,description:`Modal allows you to expose live TCP ports on a Modal container. This is done by creating a tunnel that forwards the port to the public Internet.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<!> <p>Modal allows you to expose live TCP ports on a Modal container. This is done by
creating a <em>tunnel</em> that forwards the port to the public Internet.</p> <!> <p>Tunnels are direct connections and terminate TLS automatically. Within a few
milliseconds of container startup, this function prints a message such as:</p> <!> <p>You can also create tunnels on a <!> to directly expose the container’s ports.</p> <!> <p>Tunnels are the fastest way to get a low-latency, direct connection to a running
container. You can use them to run live browser applications with <strong>interactive
terminals</strong>, <strong>Jupyter notebooks</strong>, <strong>VS Code servers</strong>, and more.</p> <p>As a quick example, here is how you would expose a Jupyter notebook:</p> <!> <p>When you run the function, it starts Jupyter and gives you the public URL. It’s
as simple as that.</p> <p>All Modal features are supported. If you <!>, pass <code>gpu=</code> to the <code>@app.function()</code> decorator. If you <!>, or to attach <!>, those
also just work.</p> <!> <p>The tunnel API is completely on-demand, so you can start them as the result of a
web request.</p> <p>For example, you could make something like Jupyter Hub without leaving Modal,
giving your users their own Jupyter notebooks when they visit a URL:</p> <!> <p>This gives every user who sends a POST request to the Web Function their own
Jupyter notebook server, on a fully isolated Modal container.</p> <p>You could do the same with VS Code and get some basic version of an instant,
serverless IDE!</p> <!> <p>By default, tunnels are only exposed to the Internet at a secure random URL, and
connections have automatic TLS (the “S” in HTTPS). However, sometimes you might
need to expose a protocol like an SSH server that goes directly over TCP. In
this case, we have support for <em>unencrypted</em> tunnels:</p> <!> <p>Might produce an output like:</p> <!> <p>You can then connect over TCP, for example with <code>nc r3.modal.host 23447</code>. Unlike
encrypted TLS sockets, these cannot be given a non-guessable, cryptographically
random URL due to how the TCP protocol works, so they are assigned a random port
number instead.</p> <!> <p>Modal only charges for containers based on <!>. There is no additional
charge for having an active tunnel.</p> <p>For example, if you start a Jupyter notebook on port 8888 and access it via
tunnel, you can use it for an hour for development (with 0.01 CPUs) and then
actually run an intensive job with 16 CPUs for one minute. The amount you would
be billed for in that hour is 0.01 + 16 * (1/60) = <strong>0.28 CPUs</strong>, even though
you had access to 16 CPUs without needing to restart your notebook.</p> <!> <p>Tunnels are run on Modal’s private global network of Internet relays. On
startup, your container will connect to the nearest tunnel so you get the
minimum latency, very similar in performance to a direct connection with the
machine.</p> <p>This makes them ideal for live debugging sessions, using web-based terminals
like <!>.</p> <p>The generated URLs are cryptographically random, but they are also public on the
Internet, so anyone can access your application if they are given the URL.</p> <p>We do not currently do any detection of requests above L4, so if you are running
a web server, we will not add special proxy HTTP headers or translate HTTP/2.
You’re just getting the TLS-encrypted TCP stream directly!</p>`,1);function x(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=b(),m=s(o);f(m,{id:`tunnels`,children:(e,t)=>{l(),i(e,r(`Tunnels`))},$$slots:{default:!0}});var g=c(m,4);p(g,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function()%0Adef%20start_app()%3A%0A%20%20%20%20%23%20Inside%20this%20%60with%60%20block%2C%20port%208000%20on%20the%20container%20can%20be%20accessed%20by%0A%20%20%20%20%23%20the%20address%20at%20%60tunnel.url%60%2C%20which%20is%20randomly%20assigned.%0A%20%20%20%20with%20modal.forward(8000)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20print(f%22tunnel.url%20%20%20%20%20%20%20%20%3D%20%7Btunnel.url%7D%22)%0A%20%20%20%20%20%20%20%20print(f%22tunnel.tls_socket%20%3D%20%7Btunnel.tls_socket%7D%22)%0A%20%20%20%20%20%20%20%20%23%20...%20start%20some%20web%20server%20at%20port%208000%2C%20using%20any%20framework`,lang:`python`});var _=c(g,4);p(_,{code:`tunnel.url%20%20%20%20%20%20%20%20%3D%20https%3A%2F%2Fwtqcahqwhd4tu0.r5.modal.host%0Atunnel.tls_socket%20%3D%20('wtqcahqwhd4tu0.r5.modal.host'%2C%20443)`,lang:`text`});var v=c(_,2);h(c(e(v)),{href:`/docs/guide/sandbox-networking#forwarding-ports`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);u(y,{id:`build-with-tunnels`,children:(e,t)=>{l(),i(e,r(`Build with tunnels`))},$$slots:{default:!0}});var x=c(y,6);p(x,{code:`import%20os%0Aimport%20secrets%0Aimport%20subprocess%0A%0Aimport%20modal%0A%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22jupyterlab%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0A%0A%40app.function()%0Adef%20run_jupyter()%3A%0A%20%20%20%20token%20%3D%20secrets.token_urlsafe(13)%0A%20%20%20%20with%20modal.forward(8888)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20url%20%3D%20tunnel.url%20%2B%20%22%2F%3Ftoken%3D%22%20%2B%20token%0A%20%20%20%20%20%20%20%20print(f%22Starting%20Jupyter%20at%20%7Burl%7D%22)%0A%20%20%20%20%20%20%20%20subprocess.run(%0A%20%20%20%20%20%20%20%20%20%20%20%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22jupyter%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22lab%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--no-browser%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--allow-root%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--ip%3D0.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--port%3D8888%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--LabApp.allow_origin%3D'*'%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%22--LabApp.allow_remote_access%3D1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%5D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20env%3D%7B**os.environ%2C%20%22JUPYTER_TOKEN%22%3A%20token%2C%20%22SHELL%22%3A%20%22%2Fbin%2Fbash%22%7D%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20stderr%3Dsubprocess.DEVNULL%2C%0A%20%20%20%20%20%20%20%20)`,lang:`python`});var S=c(x,4),C=c(e(S));h(C,{href:`https://modal.com/docs/guide/gpu`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`need GPUs`))},$$slots:{default:!0}});var w=c(C,6);h(w,{href:`https://modal.com/docs/guide/resources`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`need more CPUs, RAM`))},$$slots:{default:!0}}),h(c(w,2),{href:`https://modal.com/docs/guide/volumes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`volumes`))},$$slots:{default:!0}}),l(),n(S);var T=c(S,2);d(T,{id:`programmable-startup`,children:(e,t)=>{l(),i(e,r(`Programmable startup`))},$$slots:{default:!0}});var E=c(T,6);p(E,{code:`import%20modal%0A%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22fastapi%5Bstandard%5D%22)%0Aapp%20%3D%20modal.App(image%3Dimage)%0A%0A%0A%40app.function(timeout%3D900)%20%20%23%2015%20minutes%0Adef%20run_jupyter(q)%3A%0A%20%20%20%20...%20%20%23%20as%20before%2C%20but%20return%20the%20URL%20on%20app.q%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint(method%3D%22POST%22)%0Adef%20jupyter_hub()%3A%0A%20%20%20%20from%20fastapi%20import%20HTTPException%0A%20%20%20%20from%20fastapi.responses%20import%20RedirectResponse%0A%0A%20%20%20%20...%20%20%23%20do%20some%20validation%20on%20the%20secret%20or%20bearer%20token%0A%0A%20%20%20%20if%20is_valid%3A%0A%20%20%20%20%20%20%20%20with%20modal.Queue.ephemeral()%20as%20q%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20run_jupyter.spawn(q)%0A%20%20%20%20%20%20%20%20%20%20%20%20url%20%3D%20q.get()%0A%20%20%20%20%20%20%20%20%20%20%20%20return%20RedirectResponse(url%2C%20status_code%3D303)%0A%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20raise%20HTTPException(401%2C%20%22Not%20authenticated%22)`,lang:`python`});var D=c(E,6);d(D,{id:`advanced-unencrypted-tcp-tunnels`,children:(e,t)=>{l(),i(e,r(`Advanced: Unencrypted TCP tunnels`))},$$slots:{default:!0}});var O=c(D,4);p(O,{code:`with%20modal.forward(8000%2C%20unencrypted%3DTrue)%20as%20tunnel%3A%0A%20%20%20%20print(f%22tunnel.tcp_socket%20%3D%20%7Btunnel.tcp_socket%7D%22)`,lang:`python`});var k=c(O,4);p(k,{code:`tunnel.tcp_socket%20%3D%20('r3.modal.host'%2C%2023447)`,lang:`text`});var A=c(k,4);u(A,{id:`pricing`,children:(e,t)=>{l(),i(e,r(`Pricing`))},$$slots:{default:!0}});var j=c(A,2);h(c(e(j)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`the resources you use`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);u(M,{id:`security`,children:(e,t)=>{l(),i(e,r(`Security`))},$$slots:{default:!0}});var N=c(M,4);h(c(e(N)),{href:`https://github.com/tsl0922/ttyd`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`ttyd`))},$$slots:{default:!0}}),l(),n(N),l(4),i(t,o)},$$slots:{default:!0}}))}export{x as default,g as metadata};
//# sourceMappingURL=_sbe5W3T.js.map
