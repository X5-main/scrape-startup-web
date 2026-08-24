(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`ca28f53c-3f2c-4f3f-bbaa-3643ef42ae2f`,e._sentryDebugIdIdentifier=`sentry-dbid-ca28f53c-3f2c-4f3f-bbaa-3643ef42ae2f`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,o as d}from"./CPby7b1n.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";var h={toc:[{depth:1,value:`Build a stateful, sandboxed code interpreter`,id:`build-a-stateful-sandboxed-code-interpreter`,children:[{depth:2,value:`Setting up a code interpreter in a Modal Sandbox`,id:`setting-up-a-code-interpreter-in-a-modal-sandbox`},{depth:2,value:`Running code in a Modal Sandbox`,id:`running-code-in-a-modal-sandbox`}]}],rawContent:`# Build a stateful, sandboxed code interpreter

This example demonstrates how to build a stateful code interpreter using a Modal
[Sandbox](https://modal.com/docs/guide/sandbox).

We'll create a Modal Sandbox that listens for code to execute and then
executes the code in a Python interpreter. Because we're running in a sandboxed
environment, we can safely use the "unsafe" \`exec()\` to execute the code.

## Setting up a code interpreter in a Modal Sandbox

Our code interpreter uses a Python "driver program" to listen for code
sent in JSON format to its standard input (\`stdin\`), execute the code,
and then return the results in JSON format on standard output (\`stdout\`).

\`\`\`python
import inspect
import json
import sys
from typing import Any, Iterator

import modal


def driver_program():
    import json
    import sys
    from contextlib import redirect_stderr, redirect_stdout
    from io import StringIO

    # When you \`exec\` code in Python, you can pass in a dictionary
    # that defines the global variables the code has access to.

    # We'll use that to store state.

    globals: dict[str, Any] = {}
    while True:
        command = json.loads(input())  # read a line of JSON from stdin
        if (code := command.get("code")) is None:
            print(json.dumps({"error": "No code to execute"}))
            continue

        # Capture the executed code's outputs
        stdout_io, stderr_io = StringIO(), StringIO()
        with redirect_stdout(stdout_io), redirect_stderr(stderr_io):
            try:
                exec(code, globals)
            except Exception as e:
                print(f"Execution Error: {e}", file=sys.stderr)

        print(
            json.dumps(
                {"stdout": stdout_io.getvalue(), "stderr": stderr_io.getvalue()}
            ),
            flush=True,
        )


\`\`\`

We run this driver program in a [Modal Sandbox](https://modal.com/docs/guide/sandboxes).

\`\`\`python
app = modal.App.lookup("example-simple-code-interpreter", create_if_missing=True)
sb = modal.Sandbox.create(app=app)

\`\`\`

We have to convert the driver program to a string to pass it to the Sandbox.
Here we use \`inspect.getsource\` to get the source code as a string,
but you could also keep the driver program in a separate file and read it in.

\`\`\`python
driver_program_text = inspect.getsource(driver_program)
driver_program_command = f"""{driver_program_text}\\n\\ndriver_program()"""

\`\`\`

We then kick off the program with [\`Sandbox.exec\`](https://modal.com/docs/reference/modal.Sandbox#exec),
which creates a process inside the Sandbox (see [\`modal.container_process\`](https://modal.com/docs/reference/modal.container_process)
for details).

\`\`\`python
p = sb.exec("python", "-c", driver_program_command, bufsize=1)

\`\`\`

## Running code in a Modal Sandbox

Now we need a way to run code inside that running driver process.
Our driver program already defined a JSON interface on its \`stdin\` and \`stdout\`,
so we just need to write a quick wrapper to write to the remote \`stdin\`
and read from the remote \`stdout\`.

\`\`\`python
reader, writer = p.stdin, iter(p.stdout)


def run_code(writer: modal.io_streams.StreamWriter, reader: Iterator[str], code: str):
    writer.write(json.dumps({"code": code}) + "\\n")
    writer.drain()
    result = json.loads(next(reader))
    print(result["stdout"], end="")
    if result["stderr"]:
        print("\\033[91m" + result["stderr"] + "\\033[0m", end="", file=sys.stderr)


\`\`\`

Now we can execute some code in the Sandbox!

\`\`\`python
run_code(reader, writer, "print('hello, world!')")  # hello, world!

\`\`\`

The Sandbox and our code interpreter are stateful,
so we can define variables and use them in subsequent code.

\`\`\`python
run_code(reader, writer, "x = 10")
run_code(reader, writer, "y = 5")
run_code(reader, writer, "result = x + y")
run_code(reader, writer, "print(f'The result is: {result}')")  # The result is: 15

\`\`\`

We can also see errors when code fails.

\`\`\`python
run_code(reader, writer, "print('Attempting to divide by zero...')")
run_code(reader, writer, "1 / 0")  # Execution Error: division by zero

\`\`\`

Finally, let's clean up after ourselves and terminate the Sandbox.

\`\`\`python
sb.terminate()

\`\`\`
`,meta:{title:`Build a stateful, sandboxed code interpreter`,description:`This example demonstrates how to build a stateful code interpreter using a Modal Sandbox.`}},{toc:g,rawContent:_,meta:v}=h,y=t(`<code>Sandbox.exec</code>`),b=t(`<code>modal.container_process</code>`),x=t(`<!> <p>This example demonstrates how to build a stateful code interpreter using a Modal <!>.</p> <p>We’ll create a Modal Sandbox that listens for code to execute and then
executes the code in a Python interpreter. Because we’re running in a sandboxed
environment, we can safely use the “unsafe” <code>exec()</code> to execute the code.</p> <!> <p>Our code interpreter uses a Python “driver program” to listen for code
sent in JSON format to its standard input (<code>stdin</code>), execute the code,
and then return the results in JSON format on standard output (<code>stdout</code>).</p> <!> <p>We run this driver program in a <!>.</p> <!> <p>We have to convert the driver program to a string to pass it to the Sandbox.
Here we use <code>inspect.getsource</code> to get the source code as a string,
but you could also keep the driver program in a separate file and read it in.</p> <!> <p>We then kick off the program with <!>,
which creates a process inside the Sandbox (see <!> for details).</p> <!> <!> <p>Now we need a way to run code inside that running driver process.
Our driver program already defined a JSON interface on its <code>stdin</code> and <code>stdout</code>,
so we just need to write a quick wrapper to write to the remote <code>stdin</code> and read from the remote <code>stdout</code>.</p> <!> <p>Now we can execute some code in the Sandbox!</p> <!> <p>The Sandbox and our code interpreter are stateful,
so we can define variables and use them in subsequent code.</p> <!> <p>We can also see errors when code fails.</p> <!> <p>Finally, let’s clean up after ourselves and terminate the Sandbox.</p> <!>`,1);function S(t,g){let _=a(g,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>_,()=>h,{children:(t,a)=>{var o=x(),p=s(o);d(p,{id:`build-a-stateful-sandboxed-code-interpreter`,children:(e,t)=>{l(),i(e,r(`Build a stateful, sandboxed code interpreter`))},$$slots:{default:!0}});var h=c(p,2);m(c(e(h)),{href:`https://modal.com/docs/guide/sandbox`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,4);u(g,{id:`setting-up-a-code-interpreter-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Setting up a code interpreter in a Modal Sandbox`))},$$slots:{default:!0}});var _=c(g,4);f(_,{code:`import%20inspect%0Aimport%20json%0Aimport%20sys%0Afrom%20typing%20import%20Any%2C%20Iterator%0A%0Aimport%20modal%0A%0A%0Adef%20driver_program()%3A%0A%20%20%20%20import%20json%0A%20%20%20%20import%20sys%0A%20%20%20%20from%20contextlib%20import%20redirect_stderr%2C%20redirect_stdout%0A%20%20%20%20from%20io%20import%20StringIO%0A%0A%20%20%20%20%23%20When%20you%20%60exec%60%20code%20in%20Python%2C%20you%20can%20pass%20in%20a%20dictionary%0A%20%20%20%20%23%20that%20defines%20the%20global%20variables%20the%20code%20has%20access%20to.%0A%0A%20%20%20%20%23%20We'll%20use%20that%20to%20store%20state.%0A%0A%20%20%20%20globals%3A%20dict%5Bstr%2C%20Any%5D%20%3D%20%7B%7D%0A%20%20%20%20while%20True%3A%0A%20%20%20%20%20%20%20%20command%20%3D%20json.loads(input())%20%20%23%20read%20a%20line%20of%20JSON%20from%20stdin%0A%20%20%20%20%20%20%20%20if%20(code%20%3A%3D%20command.get(%22code%22))%20is%20None%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20print(json.dumps(%7B%22error%22%3A%20%22No%20code%20to%20execute%22%7D))%0A%20%20%20%20%20%20%20%20%20%20%20%20continue%0A%0A%20%20%20%20%20%20%20%20%23%20Capture%20the%20executed%20code's%20outputs%0A%20%20%20%20%20%20%20%20stdout_io%2C%20stderr_io%20%3D%20StringIO()%2C%20StringIO()%0A%20%20%20%20%20%20%20%20with%20redirect_stdout(stdout_io)%2C%20redirect_stderr(stderr_io)%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20try%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20exec(code%2C%20globals)%0A%20%20%20%20%20%20%20%20%20%20%20%20except%20Exception%20as%20e%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20print(f%22Execution%20Error%3A%20%7Be%7D%22%2C%20file%3Dsys.stderr)%0A%0A%20%20%20%20%20%20%20%20print(%0A%20%20%20%20%20%20%20%20%20%20%20%20json.dumps(%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%7B%22stdout%22%3A%20stdout_io.getvalue()%2C%20%22stderr%22%3A%20stderr_io.getvalue()%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20)%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20flush%3DTrue%2C%0A%20%20%20%20%20%20%20%20)%0A%0A`,lang:`python`});var v=c(_,2);m(c(e(v)),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal Sandbox`))},$$slots:{default:!0}}),l(),n(v);var S=c(v,2);f(S,{code:`app%20%3D%20modal.App.lookup(%22example-simple-code-interpreter%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A`,lang:`python`});var C=c(S,4);f(C,{code:`driver_program_text%20%3D%20inspect.getsource(driver_program)%0Adriver_program_command%20%3D%20f%22%22%22%7Bdriver_program_text%7D%5Cn%5Cndriver_program()%22%22%22%0A`,lang:`python`});var w=c(C,2),T=c(e(w));m(T,{href:`https://modal.com/docs/reference/modal.Sandbox#exec`,rel:`nofollow`,children:(e,t)=>{i(e,y())},$$slots:{default:!0}}),m(c(T,2),{href:`https://modal.com/docs/reference/modal.container_process`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(w);var E=c(w,2);f(E,{code:`p%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20driver_program_command%2C%20bufsize%3D1)%0A`,lang:`python`});var D=c(E,2);u(D,{id:`running-code-in-a-modal-sandbox`,children:(e,t)=>{l(),i(e,r(`Running code in a Modal Sandbox`))},$$slots:{default:!0}});var O=c(D,4);f(O,{code:`reader%2C%20writer%20%3D%20p.stdin%2C%20iter(p.stdout)%0A%0A%0Adef%20run_code(writer%3A%20modal.io_streams.StreamWriter%2C%20reader%3A%20Iterator%5Bstr%5D%2C%20code%3A%20str)%3A%0A%20%20%20%20writer.write(json.dumps(%7B%22code%22%3A%20code%7D)%20%2B%20%22%5Cn%22)%0A%20%20%20%20writer.drain()%0A%20%20%20%20result%20%3D%20json.loads(next(reader))%0A%20%20%20%20print(result%5B%22stdout%22%5D%2C%20end%3D%22%22)%0A%20%20%20%20if%20result%5B%22stderr%22%5D%3A%0A%20%20%20%20%20%20%20%20print(%22%5C033%5B91m%22%20%2B%20result%5B%22stderr%22%5D%20%2B%20%22%5C033%5B0m%22%2C%20end%3D%22%22%2C%20file%3Dsys.stderr)%0A%0A`,lang:`python`});var k=c(O,4);f(k,{code:`run_code(reader%2C%20writer%2C%20%22print('hello%2C%20world!')%22)%20%20%23%20hello%2C%20world!%0A`,lang:`python`});var A=c(k,4);f(A,{code:`run_code(reader%2C%20writer%2C%20%22x%20%3D%2010%22)%0Arun_code(reader%2C%20writer%2C%20%22y%20%3D%205%22)%0Arun_code(reader%2C%20writer%2C%20%22result%20%3D%20x%20%2B%20y%22)%0Arun_code(reader%2C%20writer%2C%20%22print(f'The%20result%20is%3A%20%7Bresult%7D')%22)%20%20%23%20The%20result%20is%3A%2015%0A`,lang:`python`});var j=c(A,4);f(j,{code:`run_code(reader%2C%20writer%2C%20%22print('Attempting%20to%20divide%20by%20zero...')%22)%0Arun_code(reader%2C%20writer%2C%20%221%20%2F%200%22)%20%20%23%20Execution%20Error%3A%20division%20by%20zero%0A`,lang:`python`}),f(c(j,4),{code:`sb.terminate()%0A`,lang:`python`}),i(t,o)},$$slots:{default:!0}}))}export{S as default,h as metadata};
//# sourceMappingURL=BOIQ-PTK2.js.map
