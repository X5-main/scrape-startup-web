(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`3b31ee7e-5b91-4647-ac40-8e365d1e7082`,e._sentryDebugIdIdentifier=`sentry-dbid-3b31ee7e-5b91-4647-ac40-8e365d1e7082`)}catch{}})();import{St as e,Tt as t,bt as n,c as r,d as i,en as a,tn as o,wn as s}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{o as c}from"./CPby7b1n.js";import{t as l}from"./BILrvr3I.js";import{t as u}from"./B4L_if842.js";import"./B6UiYoTw.js";var d={toc:[{depth:1,value:`forward`,id:`forward`}],rawContent:`# forward

\`\`\`python
forward(port, *, unencrypted=False, h2_enabled=False, client=None)
\`\`\`
Expose a port publicly from inside a running Modal container, with TLS.

If \`unencrypted\` is set, this also exposes the TCP socket without encryption on a random port
number. This can be used to SSH into a container (see example below). Note that it is on the public Internet, so
make sure you are using a secure protocol over TCP.

If \`h2_enabled\` is set, the TLS server will advertise support for HTTP/2.

**Important:** This is an experimental API which may change in the future.

**Usage**

\`\`\`python notest
import modal
from flask import Flask

app = modal.App(image=modal.Image.debian_slim().pip_install("Flask"))
flask_app = Flask(__name__)


@flask_app.route("/")
def hello_world():
    return "Hello, World!"


@app.function()
def run_app():
    # Start a web server inside the container at port 8000. \`modal.forward(8000)\` lets us
    # expose that port to the world at a random HTTPS URL.
    with modal.forward(8000) as tunnel:
        print("Server listening at", tunnel.url)
        flask_app.run("0.0.0.0", 8000)

    # When the context manager exits, the port is no longer exposed.
\`\`\`

**Raw TCP usage:**

\`\`\`python
import socket
import threading

import modal


def run_echo_server(port: int):
    """Run a TCP echo server listening on the given port."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(("0.0.0.0", port))
    sock.listen(1)

    while True:
        conn, addr = sock.accept()
        print("Connection from:", addr)

        # Start a new thread to handle the connection
        def handle(conn):
            with conn:
                while True:
                    data = conn.recv(1024)
                    if not data:
                        break
                    conn.sendall(data)

        threading.Thread(target=handle, args=(conn,)).start()


app = modal.App()


@app.function()
def tcp_tunnel():
    # This exposes port 8000 to public Internet traffic over TCP.
    with modal.forward(8000, unencrypted=True) as tunnel:
        # You can connect to this TCP socket from outside the container, for example, using \`nc\`:
        #  nc <HOST> <PORT>
        print("TCP tunnel listening at:", tunnel.tcp_socket)
        run_echo_server(8000)
\`\`\`

**SSH example:**
This assumes you have a rsa keypair in \`~/.ssh/id_rsa{.pub}\`, this is a bare-bones example
letting you SSH into a Modal container.

\`\`\`python
import subprocess
import time

import modal

app = modal.App()
image = (
    modal.Image.debian_slim()
    .apt_install("openssh-server")
    .run_commands("mkdir /run/sshd")
    .add_local_file("~/.ssh/id_rsa.pub", "/root/.ssh/authorized_keys", copy=True)
)


@app.function(image=image, timeout=3600)
def some_function():
    subprocess.Popen(["/usr/sbin/sshd", "-D", "-e"])
    with modal.forward(port=22, unencrypted=True) as tunnel:
        hostname, port = tunnel.tcp_socket
        connection_cmd = f'ssh -p {port} root@{hostname}'
        print(f"ssh into container using: {connection_cmd}")
        time.sleep(3600)  # keep alive for 1 hour or until killed
\`\`\`

If you intend to use this more generally, a suggestion is to put the subprocess and port
forwarding code in an \`@enter\` lifecycle method of an @app.cls, to only make a single
ssh server and port for each container (and not one for each input to the function).
`,meta:{title:`forward`,description:`Expose a port publicly from inside a running Modal container, with TLS.`}},{toc:f,rawContent:p,meta:m}=d,h=e(`<!> <!> <p>Expose a port publicly from inside a running Modal container, with TLS.</p> <p>If <code>unencrypted</code> is set, this also exposes the TCP socket without encryption on a random port
number. This can be used to SSH into a container (see example below). Note that it is on the public Internet, so
make sure you are using a secure protocol over TCP.</p> <p>If <code>h2_enabled</code> is set, the TLS server will advertise support for HTTP/2.</p> <p><strong>Important:</strong> This is an experimental API which may change in the future.</p> <p><strong>Usage</strong></p> <!> <p><strong>Raw TCP usage:</strong></p> <!> <p><strong>SSH example:</strong> This assumes you have a rsa keypair in <code>~/.ssh/id_rsa&#123;.pub&#125;</code>, this is a bare-bones example
letting you SSH into a Modal container.</p> <!> <p>If you intend to use this more generally, a suggestion is to put the subprocess and port
forwarding code in an <code>@enter</code> lifecycle method of an @app.cls, to only make a single
ssh server and port for each container (and not one for each input to the function).</p>`,1);function g(e,f){let p=r(f,[`children`,`$$slots`,`$$events`,`$$legacy`]);u(e,i(()=>p,()=>d,{children:(e,r)=>{var i=h(),u=a(i);c(u,{id:`forward`,children:(e,r)=>{s(),n(e,t(`forward`))},$$slots:{default:!0}});var d=o(u,2);l(d,{code:`forward(port%2C%20*%2C%20unencrypted%3DFalse%2C%20h2_enabled%3DFalse%2C%20client%3DNone)`,lang:`python`});var f=o(d,12);l(f,{code:`import%20modal%0Afrom%20flask%20import%20Flask%0A%0Aapp%20%3D%20modal.App(image%3Dmodal.Image.debian_slim().pip_install(%22Flask%22))%0Aflask_app%20%3D%20Flask(__name__)%0A%0A%0A%40flask_app.route(%22%2F%22)%0Adef%20hello_world()%3A%0A%20%20%20%20return%20%22Hello%2C%20World!%22%0A%0A%0A%40app.function()%0Adef%20run_app()%3A%0A%20%20%20%20%23%20Start%20a%20web%20server%20inside%20the%20container%20at%20port%208000.%20%60modal.forward(8000)%60%20lets%20us%0A%20%20%20%20%23%20expose%20that%20port%20to%20the%20world%20at%20a%20random%20HTTPS%20URL.%0A%20%20%20%20with%20modal.forward(8000)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20print(%22Server%20listening%20at%22%2C%20tunnel.url)%0A%20%20%20%20%20%20%20%20flask_app.run(%220.0.0.0%22%2C%208000)%0A%0A%20%20%20%20%23%20When%20the%20context%20manager%20exits%2C%20the%20port%20is%20no%20longer%20exposed.`,lang:`python`});var p=o(f,4);l(p,{code:`import%20socket%0Aimport%20threading%0A%0Aimport%20modal%0A%0A%0Adef%20run_echo_server(port%3A%20int)%3A%0A%20%20%20%20%22%22%22Run%20a%20TCP%20echo%20server%20listening%20on%20the%20given%20port.%22%22%22%0A%20%20%20%20sock%20%3D%20socket.socket(socket.AF_INET%2C%20socket.SOCK_STREAM)%0A%20%20%20%20sock.bind((%220.0.0.0%22%2C%20port))%0A%20%20%20%20sock.listen(1)%0A%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20conn%2C%20addr%20%3D%20sock.accept()%0A%20%20%20%20%20%20%20%20print(%22Connection%20from%3A%22%2C%20addr)%0A%0A%20%20%20%20%20%20%20%20%23%20Start%20a%20new%20thread%20to%20handle%20the%20connection%0A%20%20%20%20%20%20%20%20def%20handle(conn)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20with%20conn%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20data%20%3D%20conn.recv(1024)%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20if%20not%20data%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20break%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20conn.sendall(data)%0A%0A%20%20%20%20%20%20%20%20threading.Thread(target%3Dhandle%2C%20args%3D(conn%2C)).start()%0A%0A%0Aapp%20%3D%20modal.App()%0A%0A%0A%40app.function()%0Adef%20tcp_tunnel()%3A%0A%20%20%20%20%23%20This%20exposes%20port%208000%20to%20public%20Internet%20traffic%20over%20TCP.%0A%20%20%20%20with%20modal.forward(8000%2C%20unencrypted%3DTrue)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20%23%20You%20can%20connect%20to%20this%20TCP%20socket%20from%20outside%20the%20container%2C%20for%20example%2C%20using%20%60nc%60%3A%0A%20%20%20%20%20%20%20%20%23%20%20nc%20%3CHOST%3E%20%3CPORT%3E%0A%20%20%20%20%20%20%20%20print(%22TCP%20tunnel%20listening%20at%3A%22%2C%20tunnel.tcp_socket)%0A%20%20%20%20%20%20%20%20run_echo_server(8000)`,lang:`python`}),l(o(p,4),{code:`import%20subprocess%0Aimport%20time%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App()%0Aimage%20%3D%20(%0A%20%20%20%20modal.Image.debian_slim()%0A%20%20%20%20.apt_install(%22openssh-server%22)%0A%20%20%20%20.run_commands(%22mkdir%20%2Frun%2Fsshd%22)%0A%20%20%20%20.add_local_file(%22~%2F.ssh%2Fid_rsa.pub%22%2C%20%22%2Froot%2F.ssh%2Fauthorized_keys%22%2C%20copy%3DTrue)%0A)%0A%0A%0A%40app.function(image%3Dimage%2C%20timeout%3D3600)%0Adef%20some_function()%3A%0A%20%20%20%20subprocess.Popen(%5B%22%2Fusr%2Fsbin%2Fsshd%22%2C%20%22-D%22%2C%20%22-e%22%5D)%0A%20%20%20%20with%20modal.forward(port%3D22%2C%20unencrypted%3DTrue)%20as%20tunnel%3A%0A%20%20%20%20%20%20%20%20hostname%2C%20port%20%3D%20tunnel.tcp_socket%0A%20%20%20%20%20%20%20%20connection_cmd%20%3D%20f'ssh%20-p%20%7Bport%7D%20root%40%7Bhostname%7D'%0A%20%20%20%20%20%20%20%20print(f%22ssh%20into%20container%20using%3A%20%7Bconnection_cmd%7D%22)%0A%20%20%20%20%20%20%20%20time.sleep(3600)%20%20%23%20keep%20alive%20for%201%20hour%20or%20until%20killed`,lang:`python`}),s(2),n(e,i)},$$slots:{default:!0}}))}export{g as default,d as metadata};
//# sourceMappingURL=DGa7Kjm92.js.map
