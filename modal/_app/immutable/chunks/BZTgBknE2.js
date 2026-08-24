(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`0e44ca2c-c933-4e32-9d94-042a3d7bebdc`,e._sentryDebugIdIdentifier=`sentry-dbid-0e44ca2c-c933-4e32-9d94-042a3d7bebdc`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={crossLinks:[{text:`Building a coding agent with Sandboxes`,href:`/docs/examples/agent`},{text:`Building a code interpreter`,href:`/docs/examples/simple_code_interpreter`},{text:`Safe code execution`,href:`/docs/examples/safe_code_execution`}],toc:[{depth:1,value:`Running commands in Sandboxes`,id:`running-commands-in-sandboxes`,children:[{depth:2,value:`Input`,id:`input`},{depth:2,value:`Output`,id:`output`,children:[{depth:3,value:`Stream types`,id:`stream-types`}]}]}],rawContent:`# Running commands in Sandboxes

Once you have created a Sandbox, you can run commands inside it using the
[\`Sandbox.exec\`](/docs/sdk/py/latest/Sandbox#exec) method.

\`\`\`python notest
sb = modal.Sandbox.create(app=my_app)

process = sb.exec("echo", "hello", timeout=3)
print(process.stdout.read())

process = sb.exec("python", "-c", "print(1 + 1)", timeout=3)
print(process.stdout.read())

process = sb.exec(
    "bash",
    "-c",
    "for i in $(seq 1 10); do echo foo $i; sleep 0.1; done",
    timeout=5,
)
for line in process.stdout:
    print(line, end="")

sb.terminate()
sb.detach()
\`\`\`

\`Sandbox.exec\` returns a [\`ContainerProcess\`](/docs/sdk/py/latest/container_process#containerprocess)
object, which allows access to the process's \`stdout\`, \`stderr\`, and \`stdin\`.
The \`timeout\` parameter ensures that the \`exec\` command will run for at most
\`timeout\` seconds.

## Input

The Sandbox and ContainerProcess \`stdin\` handles are [\`StreamWriter\`](/docs/sdk/py/latest/io_streams#streamwriter)
objects. This object supports flushing writes with both synchronous and asynchronous APIs:

\`\`\`python notest
import asyncio

sb = modal.Sandbox.create(app=my_app)

p = sb.exec("bash", "-c", "while read line; do echo $line; done")
p.stdin.write(b"foo bar\\n")
p.stdin.write_eof()
p.stdin.drain()
p.wait()
sb.terminate()
sb.detach()

async def run_async():
    sb = await modal.Sandbox.create.aio(app=my_app)
    p = await sb.exec.aio("bash", "-c", "while read line; do echo $line; done")
    p.stdin.write(b"foo bar\\n")
    p.stdin.write_eof()
    await p.stdin.drain.aio()
    await p.wait.aio()
    await sb.terminate.aio()
    await sb.detach.aio()

asyncio.run(run_async())
\`\`\`

## Output

The Sandbox and ContainerProcess \`stdout\` and \`stderr\` handles are [\`StreamReader\`](/docs/sdk/py/latest/io_streams#streamreader)
objects. These objects support reading from the stream in both synchronous and asynchronous manners.
These handles also respect the timeout given to \`Sandbox.exec\`.

To read from a stream after the underlying process has finished, you can use the \`read\`
method, which blocks until the process finishes and returns the entire output stream.

\`\`\`python notest
sb = modal.Sandbox.create(app=my_app)
p = sb.exec("echo", "hello")
print(p.stdout.read())
sb.terminate()
sb.detach()
\`\`\`

To stream output, take advantage of the fact that \`stdout\` and \`stderr\` are
iterable:

\`\`\`python notest
import asyncio

sb = modal.Sandbox.create(app=my_app)

p = sb.exec("bash", "-c", "for i in $(seq 1 10); do echo foo $i; sleep 0.1; done")

for line in p.stdout:
    # Lines preserve the trailing newline character, so use end="" to avoid double newlines.
    print(line, end="")
p.wait()
sb.terminate()
sb.detach()

async def run_async():
    sb = await modal.Sandbox.create.aio(app=my_app)
    p = await sb.exec.aio("bash", "-c", "for i in $(seq 1 10); do echo foo $i; sleep 0.1; done")
    async for line in p.stdout:
        # Avoid double newlines by using end="".
        print(line, end="")
    await p.wait.aio()
    await sb.terminate.aio()
    await sb.detach.aio()

asyncio.run(run_async())
\`\`\`

### Stream types

By default, all streams are buffered in memory, waiting to be consumed by the
client. You can control this behavior with the \`stdout\` and \`stderr\` parameters.
These parameters are conceptually similar to the \`stdout\` and \`stderr\`
parameters of the [\`subprocess\`](https://docs.python.org/3/library/subprocess.html#subprocess.DEVNULL) module.

\`\`\`python notest
from modal.stream_type import StreamType

sb = modal.Sandbox.create(app=my_app)

# Default behavior: buffered in memory.
p = sb.exec(
    "bash",
    "-c",
    "echo foo; echo bar >&2",
    stdout=StreamType.PIPE,
    stderr=StreamType.PIPE,
)
print(p.stdout.read())
print(p.stderr.read())

# Print the stream to STDOUT as it comes in.
p = sb.exec(
    "bash",
    "-c",
    "echo foo; echo bar >&2",
    stdout=StreamType.STDOUT,
    stderr=StreamType.STDOUT,
)
p.wait()

# Discard all output.
p = sb.exec(
    "bash",
    "-c",
    "echo foo; echo bar >&2",
    stdout=StreamType.DEVNULL,
    stderr=StreamType.DEVNULL,
)
p.wait()

sb.terminate()
sb.detach()
\`\`\`
`,meta:{title:`Running commands in Sandboxes`,description:`Once you have created a Sandbox, you can run commands inside it using the Sandbox.exec method.`}},{crossLinks:_,toc:v,rawContent:y,meta:b}=g,x=t(`<code>Sandbox.exec</code>`),S=t(`<code>ContainerProcess</code>`),C=t(`<code>StreamWriter</code>`),w=t(`<code>StreamReader</code>`),T=t(`<code>subprocess</code>`),E=t(`<!> <p>Once you have created a Sandbox, you can run commands inside it using the <!> method.</p> <!> <p><code>Sandbox.exec</code> returns a <!> object, which allows access to the process’s <code>stdout</code>, <code>stderr</code>, and <code>stdin</code>.
The <code>timeout</code> parameter ensures that the <code>exec</code> command will run for at most <code>timeout</code> seconds.</p> <!> <p>The Sandbox and ContainerProcess <code>stdin</code> handles are <!> objects. This object supports flushing writes with both synchronous and asynchronous APIs:</p> <!> <!> <p>The Sandbox and ContainerProcess <code>stdout</code> and <code>stderr</code> handles are <!> objects. These objects support reading from the stream in both synchronous and asynchronous manners.
These handles also respect the timeout given to <code>Sandbox.exec</code>.</p> <p>To read from a stream after the underlying process has finished, you can use the <code>read</code> method, which blocks until the process finishes and returns the entire output stream.</p> <!> <p>To stream output, take advantage of the fact that <code>stdout</code> and <code>stderr</code> are
iterable:</p> <!> <!> <p>By default, all streams are buffered in memory, waiting to be consumed by the
client. You can control this behavior with the <code>stdout</code> and <code>stderr</code> parameters.
These parameters are conceptually similar to the <code>stdout</code> and <code>stderr</code> parameters of the <!> module.</p> <!>`,1);function D(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=E(),m=s(o);f(m,{id:`running-commands-in-sandboxes`,children:(e,t)=>{l(),i(e,r(`Running commands in Sandboxes`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`/docs/sdk/py/latest/Sandbox#exec`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);p(_,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dmy_app)%0A%0Aprocess%20%3D%20sb.exec(%22echo%22%2C%20%22hello%22%2C%20timeout%3D3)%0Aprint(process.stdout.read())%0A%0Aprocess%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20%22print(1%20%2B%201)%22%2C%20timeout%3D3)%0Aprint(process.stdout.read())%0A%0Aprocess%20%3D%20sb.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22for%20i%20in%20%24(seq%201%2010)%3B%20do%20echo%20foo%20%24i%3B%20sleep%200.1%3B%20done%22%2C%0A%20%20%20%20timeout%3D5%2C%0A)%0Afor%20line%20in%20process.stdout%3A%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0A%0Asb.terminate()%0Asb.detach()`,lang:`python`});var v=c(_,2);h(c(e(v),2),{href:`/docs/sdk/py/latest/container_process#containerprocess`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}}),l(13),n(v);var y=c(v,2);u(y,{id:`input`,children:(e,t)=>{l(),i(e,r(`Input`))},$$slots:{default:!0}});var b=c(y,2);h(c(e(b),3),{href:`/docs/sdk/py/latest/io_streams#streamwriter`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(),n(b);var D=c(b,2);p(D,{code:`import%20asyncio%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dmy_app)%0A%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22while%20read%20line%3B%20do%20echo%20%24line%3B%20done%22)%0Ap.stdin.write(b%22foo%20bar%5Cn%22)%0Ap.stdin.write_eof()%0Ap.stdin.drain()%0Ap.wait()%0Asb.terminate()%0Asb.detach()%0A%0Aasync%20def%20run_async()%3A%0A%20%20%20%20sb%20%3D%20await%20modal.Sandbox.create.aio(app%3Dmy_app)%0A%20%20%20%20p%20%3D%20await%20sb.exec.aio(%22bash%22%2C%20%22-c%22%2C%20%22while%20read%20line%3B%20do%20echo%20%24line%3B%20done%22)%0A%20%20%20%20p.stdin.write(b%22foo%20bar%5Cn%22)%0A%20%20%20%20p.stdin.write_eof()%0A%20%20%20%20await%20p.stdin.drain.aio()%0A%20%20%20%20await%20p.wait.aio()%0A%20%20%20%20await%20sb.terminate.aio()%0A%20%20%20%20await%20sb.detach.aio()%0A%0Aasyncio.run(run_async())`,lang:`python`});var O=c(D,2);u(O,{id:`output`,children:(e,t)=>{l(),i(e,r(`Output`))},$$slots:{default:!0}});var k=c(O,2);h(c(e(k),5),{href:`/docs/sdk/py/latest/io_streams#streamreader`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(3),n(k);var A=c(k,4);p(A,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dmy_app)%0Ap%20%3D%20sb.exec(%22echo%22%2C%20%22hello%22)%0Aprint(p.stdout.read())%0Asb.terminate()%0Asb.detach()`,lang:`python`});var j=c(A,4);p(j,{code:`import%20asyncio%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dmy_app)%0A%0Ap%20%3D%20sb.exec(%22bash%22%2C%20%22-c%22%2C%20%22for%20i%20in%20%24(seq%201%2010)%3B%20do%20echo%20foo%20%24i%3B%20sleep%200.1%3B%20done%22)%0A%0Afor%20line%20in%20p.stdout%3A%0A%20%20%20%20%23%20Lines%20preserve%20the%20trailing%20newline%20character%2C%20so%20use%20end%3D%22%22%20to%20avoid%20double%20newlines.%0A%20%20%20%20print(line%2C%20end%3D%22%22)%0Ap.wait()%0Asb.terminate()%0Asb.detach()%0A%0Aasync%20def%20run_async()%3A%0A%20%20%20%20sb%20%3D%20await%20modal.Sandbox.create.aio(app%3Dmy_app)%0A%20%20%20%20p%20%3D%20await%20sb.exec.aio(%22bash%22%2C%20%22-c%22%2C%20%22for%20i%20in%20%24(seq%201%2010)%3B%20do%20echo%20foo%20%24i%3B%20sleep%200.1%3B%20done%22)%0A%20%20%20%20async%20for%20line%20in%20p.stdout%3A%0A%20%20%20%20%20%20%20%20%23%20Avoid%20double%20newlines%20by%20using%20end%3D%22%22.%0A%20%20%20%20%20%20%20%20print(line%2C%20end%3D%22%22)%0A%20%20%20%20await%20p.wait.aio()%0A%20%20%20%20await%20sb.terminate.aio()%0A%20%20%20%20await%20sb.detach.aio()%0A%0Aasyncio.run(run_async())`,lang:`python`});var M=c(j,2);d(M,{id:`stream-types`,children:(e,t)=>{l(),i(e,r(`Stream types`))},$$slots:{default:!0}});var N=c(M,2);h(c(e(N),9),{href:`https://docs.python.org/3/library/subprocess.html#subprocess.DEVNULL`,rel:`nofollow`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(),n(N),p(c(N,2),{code:`from%20modal.stream_type%20import%20StreamType%0A%0Asb%20%3D%20modal.Sandbox.create(app%3Dmy_app)%0A%0A%23%20Default%20behavior%3A%20buffered%20in%20memory.%0Ap%20%3D%20sb.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22echo%20foo%3B%20echo%20bar%20%3E%262%22%2C%0A%20%20%20%20stdout%3DStreamType.PIPE%2C%0A%20%20%20%20stderr%3DStreamType.PIPE%2C%0A)%0Aprint(p.stdout.read())%0Aprint(p.stderr.read())%0A%0A%23%20Print%20the%20stream%20to%20STDOUT%20as%20it%20comes%20in.%0Ap%20%3D%20sb.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22echo%20foo%3B%20echo%20bar%20%3E%262%22%2C%0A%20%20%20%20stdout%3DStreamType.STDOUT%2C%0A%20%20%20%20stderr%3DStreamType.STDOUT%2C%0A)%0Ap.wait()%0A%0A%23%20Discard%20all%20output.%0Ap%20%3D%20sb.exec(%0A%20%20%20%20%22bash%22%2C%0A%20%20%20%20%22-c%22%2C%0A%20%20%20%20%22echo%20foo%3B%20echo%20bar%20%3E%262%22%2C%0A%20%20%20%20stdout%3DStreamType.DEVNULL%2C%0A%20%20%20%20stderr%3DStreamType.DEVNULL%2C%0A)%0Ap.wait()%0A%0Asb.terminate()%0Asb.detach()`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{D as default,g as metadata};
//# sourceMappingURL=BZTgBknE2.js.map
