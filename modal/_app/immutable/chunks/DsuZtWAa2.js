(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`6c338be7-3b4b-4eb6-bd0b-248f6fea82e9`,e._sentryDebugIdIdentifier=`sentry-dbid-6c338be7-3b4b-4eb6-bd0b-248f6fea82e9`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as ee,d as a,en as o,tn as s,wn as c}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as l,i as u,o as te,r as d}from"./CPby7b1n.js";import{t as ne}from"./JPsrybyr.js";import{t as f}from"./BILrvr3I.js";import{t as p}from"./B4L_if842.js";import{t as m}from"./DeWGVqas2.js";import{t as h}from"./B2aB5zxC2.js";var g={toc:[{depth:1,value:`Developing and debugging`,id:`developing-and-debugging`,children:[{depth:2,value:`Interactivity`,id:`interactivity`,children:[{depth:3,value:`Interactive functions`,id:`interactive-functions`},{depth:3,value:`Debugging Running Containers`,id:`debugging-running-containers`,children:[{depth:4,value:`Debug Shells`,id:`debug-shells`},{depth:4,value:`modal container exec`,id:`modal-container-exec`},{depth:4,value:`Live container profiling`,id:`live-container-profiling`}]},{depth:3,value:`Debugging Container Images`,id:`debugging-container-images`}]},{depth:2,value:`Live updating`,id:`live-updating`,children:[{depth:3,value:`Hot reloading with modal serve`,id:`hot-reloading-with-modal-serve`},{depth:3,value:`Developing deployed Apps with --strategy=recreate`,id:`developing-deployed-apps-with---strategyrecreate`}]},{depth:2,value:`Observability`,id:`observability`,children:[{depth:3,value:`Debug logs`,id:`debug-logs`},{depth:3,value:`Client tracebacks`,id:`client-tracebacks`}]}]}],rawContent:`# Developing and debugging

Modal makes it easy to run apps in the cloud, try code changes in the cloud, and
debug remotely executing code as if it were right there on your laptop. To speed
boost your inner dev loop, this guide provides a rundown of tools and techniques
for developing and debugging software in Modal.

## Interactivity

You can launch a Modal App interactively and have it drop you right into the
middle of the action, at an interesting callsite or the site of a runtime
detonation.

### Interactive functions

It is possible to start the interactive Python debugger or start an \`IPython\`
REPL right in the middle of your Modal App.

To do so, you first need to run your App in "interactive" mode by using the
\`--interactive\` / \`-i\` flag. In interactive mode, you can establish a connection
to the calling terminal by calling \`interact()\` from within your function.

For a simple example, you can accept user input with the built-in Python \`input\`
function:

\`\`\`python
@app.function()
def my_fn(hidden):
    modal.interact()

    x = input("Enter a number: ")
    if hidden == x:
        print(f"Your number is {x}, which is the hidden value!")
    else:
        print(f"Your number is {x}, which is not the hidden value")
\`\`\`

Now when you run your app with the \`--interactive\` flag, you're able to send
inputs to your app, even though it's running in a remote container!

\`\`\`shell
modal run -i guess_number.py::my_fn --hidden 5
Enter a number: 5
Your number is 5, which is the hidden value!
\`\`\`

For a more interesting example, you can [\`pip_install("ipython")\`](/docs/sdk/py/latest/Image#pip_install)
and start an \`IPython\` REPL dynamically anywhere in your code:

\`\`\`python
@app.function()
def f():
    model = expensive_function()
    # play around with model
    modal.interact()
    import IPython
    IPython.embed()
\`\`\`

The built-in Python debugger can be initiated with the language's \`breakpoint()\`
function. For convenience, breakpoints call \`interact\` automatically.

\`\`\`python
@app.function()
def f():
    x = "10point3"
    breakpoint()
    answer = float(x)
\`\`\`

### Debugging Running Containers

#### Debug Shells

Modal also lets you run interactive commands on your running Containers from the
terminal -- much like \`ssh\`-ing into a traditional machine or cloud VM.

To run a command inside a running Container, you first need to get the Container
ID. You can view all running Containers and their Container IDs with
[\`modal container list\`](/docs/cli/latest/container).

After you obtain the Container ID, you can connect to the Container with \`modal shell [container-id]\`. This launches a "Debug Shell" that comes with some preinstalled tools:

- \`vim\`
- \`nano\`
- \`ps\`
- \`strace\`
- \`curl\`
- \`py-spy\`
- and more!

You can use a debug shell to examine or terminate running processes, modify the Container filesystem, run commands, and more. You can also install additional packages using your Container's package manager (ex. \`apt\`).

<Asciinema recordingId="KM0bfr08yZpbpCPx6KQJRWwh3" autoPlay={true} />

Note that debug shells will terminate immediately once your Container has finished running.

#### \`modal container exec\`

You can also execute a specific command in a running Container with \`modal container exec [container-id] [command...]\`. For example, to see what files are in \`/root\`, you can run \`modal container exec [container-id] ls /root\`.

\`\`\`
❯ modal container list
                         Active Containers in environment: nathan-dev
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━┓
┃ Container ID                  ┃ App ID                    ┃ App Name ┃ Start Time           ┃
┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━┩
│ ta-01JK47GVDMWMGPH8MQ0EW30Y25 │ ap-FSuhQ4LpvNAt5b6mKi1CDw │ my-app   │ 2025-02-02 16:02 EST │
└───────────────────────────────┴───────────────────────────┴──────────┴──────────────────────┘

❯ modal container exec ta-01JK47GVDMWMGPH8MQ0EW30Y25 ls /root
__pycache__  test00.py
\`\`\`

Note that your executed command will terminate immediately once your Container
has finished running.

By default, commands will be run within a
[pseudoterminal (PTY)](https://en.wikipedia.org/wiki/Pseudoterminal), but this
can be disabled with the \`--no-pty\` flag.

#### Live container profiling

When a container or input is seemingly stuck or not making progress,
you can use the Modal web dashboard to find out what code that's executing in the
container in real time. To do so, look for **Live Profiling** in the **Containers** tab in your
function dashboard.

![Live container profiling](https://modal-public-assets.s3.us-east-1.amazonaws.com/live-profiling-bigger.gif)

### Debugging Container Images

You can also launch an interactive shell in a new Container with the same
environment as your Function. This is handy for debugging issues with your
Image, interactively refining build commands, and exploring the contents of
[\`Volume\`](/docs/sdk/py/latest/Volume)s and
[\`NetworkFileSystem\`](/docs/sdk/py/latest/NetworkFileSystem)s.

The primary interface for accessing this feature is the
[\`modal shell\`](/docs/cli/latest/shell) CLI command, which accepts a Function
name in your App (or prompts you to select one, if none is provided), and runs
an interactive command on the same image as the Function, with the same
[\`Secret\`](/docs/sdk/py/latest/Secret)s and
[\`NetworkFileSystem\`](/docs/sdk/py/latest/NetworkFileSystem)s attached as the selected Function.

The default command is \`/bin/bash\`, but you can override this with any other
command of your choice using the \`--cmd\` flag.

<Asciinema recordingId="824SeTFiQmleEUF5JjOElofhG" autoPlay={true} />

Note that \`modal shell [filename].py\` does not attach a shell to a running Container of the
Function, but instead creates a fresh instance of the underlying Image. To attach a shell to a running Container, use \`modal shell [container-id]\` instead.

## Live updating

### Hot reloading with \`modal serve\`

Modal has the command \`modal serve <filename.py>\`, which creates a loop that
live updates an App when any of the supporting files change.

Live updating works with Web Functions, syncing your changes as you make them,
and it also works well with cron schedules and job queues.

\`\`\`python
import modal

app = modal.App(image=modal.Image.debian_slim().pip_install("fastapi"))


@app.function()
@modal.fastapi_endpoint()
def f():
    return "I update on file edit!"


@app.function(schedule=modal.Period(seconds=5))
def run_me():
    print("I also update on file edit!")
\`\`\`

If you edit this file, the \`modal serve\` command will detect the change and
update the code, without having to restart the command.

### Developing deployed Apps with \`--strategy=recreate\`

Generally, we recommend developing Apps with \`modal serve\`.
But if your development flow involves running \`modal deploy\`,
we recommend you use the flag \`--strategy=recreate\`.
This will terminate all running containers from previous deployments
so that all subsequent inputs will go to new containers.

## Observability

Each running Modal App, including all ephemeral Apps, streams logs and resource
metrics back to you for viewing.

On start, an App will log a dashboard link that will take you its App page.

\`\`\`shell
$ python3 main.py
✓ Initialized. View app page at https://modal.com/apps/ap-XYZ1234.
...
\`\`\`

From this page you can access the following:

- logs, both from your application and system-level logs from Modal
- compute resource metrics (CPU, RAM, GPU)
- function call history, including historical success/failure counts

### Debug logs

You can enable Modal's client debug logs by setting the \`MODAL_LOGLEVEL\` environment variable to \`DEBUG\`.
Running the following will show debug logging from the Modal client running locally.

\`\`\`bash
MODAL_LOGLEVEL=DEBUG modal run hello.py
\`\`\`

To enable debug logs in the Modal client running in the remote container, you can set \`MODAL_LOGLEVEL\` using
a Modal [\`Secret\`](/docs/sdk/py/latest/Secret).

\`\`\`python
@app.function(secrets=[modal.Secret.from_dict({"MODAL_LOGLEVEL": "DEBUG"})])
def f():
    print("Hello, world!")
\`\`\`

### Client tracebacks

To see a traceback (a.k.a [stack trace](https://en.wikipedia.org/wiki/Stack_trace)) for a client-side exception, you can set the \`MODAL_TRACEBACK\` environment variable to \`1\`.

\`\`\`bash
MODAL_TRACEBACK=1 modal run my_app.py
\`\`\`

We encourage you to report cases where you need to enable this functionality, as it's indication of an issue in Modal.
`,meta:{title:`Developing and debugging`,description:`Modal makes it easy to run apps in the cloud, try code changes in the cloud, and debug remotely executing code as if it were right there on your laptop. To speed boost your inner dev loop, this guide provides a rundown of tools and techniques for developing and debugging software in Modal.`}},{toc:_,rawContent:v,meta:y}=g,re=t(`<code>pip_install("ipython")</code>`),ie=t(`<code>modal container list</code>`),ae=t(`<code>modal container exec</code>`),oe=t(`<code>Volume</code>`),b=t(`<code>NetworkFileSystem</code>`),se=t(`<code>modal shell</code>`),ce=t(`<code>Secret</code>`),le=t(`<code>NetworkFileSystem</code>`),ue=t(`Hot reloading with <code>modal serve</code>`,1),de=t(`Developing deployed Apps with <code>--strategy=recreate</code>`,1),x=t(`<code>Secret</code>`),S=t(`<!> <p>Modal makes it easy to run apps in the cloud, try code changes in the cloud, and
debug remotely executing code as if it were right there on your laptop. To speed
boost your inner dev loop, this guide provides a rundown of tools and techniques
for developing and debugging software in Modal.</p> <!> <p>You can launch a Modal App interactively and have it drop you right into the
middle of the action, at an interesting callsite or the site of a runtime
detonation.</p> <!> <p>It is possible to start the interactive Python debugger or start an <code>IPython</code> REPL right in the middle of your Modal App.</p> <p>To do so, you first need to run your App in “interactive” mode by using the <code>--interactive</code> / <code>-i</code> flag. In interactive mode, you can establish a connection
to the calling terminal by calling <code>interact()</code> from within your function.</p> <p>For a simple example, you can accept user input with the built-in Python <code>input</code> function:</p> <!> <p>Now when you run your app with the <code>--interactive</code> flag, you’re able to send
inputs to your app, even though it’s running in a remote container!</p> <!> <p>For a more interesting example, you can <!> and start an <code>IPython</code> REPL dynamically anywhere in your code:</p> <!> <p>The built-in Python debugger can be initiated with the language’s <code>breakpoint()</code> function. For convenience, breakpoints call <code>interact</code> automatically.</p> <!> <!> <!> <p>Modal also lets you run interactive commands on your running Containers from the
terminal — much like <code>ssh</code>-ing into a traditional machine or cloud VM.</p> <p>To run a command inside a running Container, you first need to get the Container
ID. You can view all running Containers and their Container IDs with <!>.</p> <p>After you obtain the Container ID, you can connect to the Container with <code>modal shell [container-id]</code>. This launches a “Debug Shell” that comes with some preinstalled tools:</p> <ul><li><code>vim</code></li> <li><code>nano</code></li> <li><code>ps</code></li> <li><code>strace</code></li> <li><code>curl</code></li> <li><code>py-spy</code></li> <li>and more!</li></ul> <p>You can use a debug shell to examine or terminate running processes, modify the Container filesystem, run commands, and more. You can also install additional packages using your Container’s package manager (ex. <code>apt</code>).</p> <!> <p>Note that debug shells will terminate immediately once your Container has finished running.</p> <!> <p>You can also execute a specific command in a running Container with <code>modal container exec [container-id] [command...]</code>. For example, to see what files are in <code>/root</code>, you can run <code>modal container exec [container-id] ls /root</code>.</p> <!> <p>Note that your executed command will terminate immediately once your Container
has finished running.</p> <p>By default, commands will be run within a <!>, but this
can be disabled with the <code>--no-pty</code> flag.</p> <!> <p>When a container or input is seemingly stuck or not making progress,
you can use the Modal web dashboard to find out what code that’s executing in the
container in real time. To do so, look for <strong>Live Profiling</strong> in the <strong>Containers</strong> tab in your
function dashboard.</p> <p><!></p> <!> <p>You can also launch an interactive shell in a new Container with the same
environment as your Function. This is handy for debugging issues with your
Image, interactively refining build commands, and exploring the contents of <!>s and <!>s.</p> <p>The primary interface for accessing this feature is the <!> CLI command, which accepts a Function
name in your App (or prompts you to select one, if none is provided), and runs
an interactive command on the same image as the Function, with the same <!>s and <!>s attached as the selected Function.</p> <p>The default command is <code>/bin/bash</code>, but you can override this with any other
command of your choice using the <code>--cmd</code> flag.</p> <!> <p>Note that <code>modal shell [filename].py</code> does not attach a shell to a running Container of the
Function, but instead creates a fresh instance of the underlying Image. To attach a shell to a running Container, use <code>modal shell [container-id]</code> instead.</p> <!> <!> <p>Modal has the command <code>modal serve &lt;filename.py&gt;</code>, which creates a loop that
live updates an App when any of the supporting files change.</p> <p>Live updating works with Web Functions, syncing your changes as you make them,
and it also works well with cron schedules and job queues.</p> <!> <p>If you edit this file, the <code>modal serve</code> command will detect the change and
update the code, without having to restart the command.</p> <!> <p>Generally, we recommend developing Apps with <code>modal serve</code>.
But if your development flow involves running <code>modal deploy</code>,
we recommend you use the flag <code>--strategy=recreate</code>.
This will terminate all running containers from previous deployments
so that all subsequent inputs will go to new containers.</p> <!> <p>Each running Modal App, including all ephemeral Apps, streams logs and resource
metrics back to you for viewing.</p> <p>On start, an App will log a dashboard link that will take you its App page.</p> <!> <p>From this page you can access the following:</p> <ul><li>logs, both from your application and system-level logs from Modal</li> <li>compute resource metrics (CPU, RAM, GPU)</li> <li>function call history, including historical success/failure counts</li></ul> <!> <p>You can enable Modal’s client debug logs by setting the <code>MODAL_LOGLEVEL</code> environment variable to <code>DEBUG</code>.
Running the following will show debug logging from the Modal client running locally.</p> <!> <p>To enable debug logs in the Modal client running in the remote container, you can set <code>MODAL_LOGLEVEL</code> using
a Modal <!>.</p> <!> <!> <p>To see a traceback (a.k.a <!>) for a client-side exception, you can set the <code>MODAL_TRACEBACK</code> environment variable to <code>1</code>.</p> <!> <p>We encourage you to report cases where you need to enable this functionality, as it’s indication of an issue in Modal.</p>`,1);function C(t,_){let v=ee(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,a(()=>v,()=>g,{children:(t,ee)=>{var a=S(),p=o(a);te(p,{id:`developing-and-debugging`,children:(e,t)=>{c(),i(e,r(`Developing and debugging`))},$$slots:{default:!0}});var g=s(p,4);l(g,{id:`interactivity`,children:(e,t)=>{c(),i(e,r(`Interactivity`))},$$slots:{default:!0}});var _=s(g,4);u(_,{id:`interactive-functions`,children:(e,t)=>{c(),i(e,r(`Interactive functions`))},$$slots:{default:!0}});var v=s(_,8);f(v,{code:`%40app.function()%0Adef%20my_fn(hidden)%3A%0A%20%20%20%20modal.interact()%0A%0A%20%20%20%20x%20%3D%20input(%22Enter%20a%20number%3A%20%22)%0A%20%20%20%20if%20hidden%20%3D%3D%20x%3A%0A%20%20%20%20%20%20%20%20print(f%22Your%20number%20is%20%7Bx%7D%2C%20which%20is%20the%20hidden%20value!%22)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(f%22Your%20number%20is%20%7Bx%7D%2C%20which%20is%20not%20the%20hidden%20value%22)`,lang:`python`});var y=s(v,4);f(y,{code:`modal%20run%20-i%20guess_number.py%3A%3Amy_fn%20--hidden%205%0AEnter%20a%20number%3A%205%0AYour%20number%20is%205%2C%20which%20is%20the%20hidden%20value!`,lang:`shell`});var C=s(y,2);m(s(e(C)),{href:`/docs/sdk/py/latest/Image#pip_install`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),c(3),n(C);var w=s(C,2);f(w,{code:`%40app.function()%0Adef%20f()%3A%0A%20%20%20%20model%20%3D%20expensive_function()%0A%20%20%20%20%23%20play%20around%20with%20model%0A%20%20%20%20modal.interact()%0A%20%20%20%20import%20IPython%0A%20%20%20%20IPython.embed()`,lang:`python`});var T=s(w,4);f(T,{code:`%40app.function()%0Adef%20f()%3A%0A%20%20%20%20x%20%3D%20%2210point3%22%0A%20%20%20%20breakpoint()%0A%20%20%20%20answer%20%3D%20float(x)`,lang:`python`});var E=s(T,2);u(E,{id:`debugging-running-containers`,children:(e,t)=>{c(),i(e,r(`Debugging Running Containers`))},$$slots:{default:!0}});var D=s(E,2);d(D,{id:`debug-shells`,children:(e,t)=>{c(),i(e,r(`Debug Shells`))},$$slots:{default:!0}});var O=s(D,4);m(s(e(O)),{href:`/docs/cli/latest/container`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),c(),n(O);var k=s(O,8);h(k,{recordingId:`KM0bfr08yZpbpCPx6KQJRWwh3`,autoPlay:!0});var A=s(k,4);d(A,{id:`modal-container-exec`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}});var j=s(A,4);f(j,{code:`%E2%9D%AF%20modal%20container%20list%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Active%20Containers%20in%20environment%3A%20nathan-dev%0A%E2%94%8F%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%B3%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%B3%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%B3%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%93%0A%E2%94%83%20Container%20ID%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%83%20App%20ID%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E2%94%83%20App%20Name%20%E2%94%83%20Start%20Time%20%20%20%20%20%20%20%20%20%20%20%E2%94%83%0A%E2%94%A1%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%95%87%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%95%87%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%95%87%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%81%E2%94%A9%0A%E2%94%82%20ta-01JK47GVDMWMGPH8MQ0EW30Y25%20%E2%94%82%20ap-FSuhQ4LpvNAt5b6mKi1CDw%20%E2%94%82%20my-app%20%20%20%E2%94%82%202025-02-02%2016%3A02%20EST%20%E2%94%82%0A%E2%94%94%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%B4%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%98%0A%0A%E2%9D%AF%20modal%20container%20exec%20ta-01JK47GVDMWMGPH8MQ0EW30Y25%20ls%20%2Froot%0A__pycache__%20%20test00.py`,lang:`text`});var M=s(j,4);m(s(e(M)),{href:`https://en.wikipedia.org/wiki/Pseudoterminal`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`pseudoterminal (PTY)`))},$$slots:{default:!0}}),c(3),n(M);var N=s(M,2);d(N,{id:`live-container-profiling`,children:(e,t)=>{c(),i(e,r(`Live container profiling`))},$$slots:{default:!0}});var P=s(N,4);ne(e(P),{src:`https://modal-public-assets.s3.us-east-1.amazonaws.com/live-profiling-bigger.gif`,alt:`Live container profiling`}),n(P);var F=s(P,2);u(F,{id:`debugging-container-images`,children:(e,t)=>{c(),i(e,r(`Debugging Container Images`))},$$slots:{default:!0}});var I=s(F,2),L=s(e(I));m(L,{href:`/docs/sdk/py/latest/Volume`,children:(e,t)=>{i(e,oe())},$$slots:{default:!0}}),m(s(L,2),{href:`/docs/sdk/py/latest/NetworkFileSystem`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),c(),n(I);var R=s(I,2),z=s(e(R));m(z,{href:`/docs/cli/latest/shell`,children:(e,t)=>{i(e,se())},$$slots:{default:!0}});var B=s(z,2);m(B,{href:`/docs/sdk/py/latest/Secret`,children:(e,t)=>{i(e,ce())},$$slots:{default:!0}}),m(s(B,2),{href:`/docs/sdk/py/latest/NetworkFileSystem`,children:(e,t)=>{i(e,le())},$$slots:{default:!0}}),c(),n(R);var V=s(R,4);h(V,{recordingId:`824SeTFiQmleEUF5JjOElofhG`,autoPlay:!0});var H=s(V,4);l(H,{id:`live-updating`,children:(e,t)=>{c(),i(e,r(`Live updating`))},$$slots:{default:!0}});var U=s(H,2);u(U,{id:`hot-reloading-with-modal-serve`,children:(e,t)=>{c();var n=ue();c(),i(e,n)},$$slots:{default:!0}});var W=s(U,6);f(W,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App(image%3Dmodal.Image.debian_slim().pip_install(%22fastapi%22))%0A%0A%0A%40app.function()%0A%40modal.fastapi_endpoint()%0Adef%20f()%3A%0A%20%20%20%20return%20%22I%20update%20on%20file%20edit!%22%0A%0A%0A%40app.function(schedule%3Dmodal.Period(seconds%3D5))%0Adef%20run_me()%3A%0A%20%20%20%20print(%22I%20also%20update%20on%20file%20edit!%22)`,lang:`python`});var G=s(W,4);u(G,{id:`developing-deployed-apps-with---strategyrecreate`,children:(e,t)=>{c();var n=de();c(),i(e,n)},$$slots:{default:!0}});var K=s(G,4);l(K,{id:`observability`,children:(e,t)=>{c(),i(e,r(`Observability`))},$$slots:{default:!0}});var q=s(K,6);f(q,{code:`%24%20python3%20main.py%0A%E2%9C%93%20Initialized.%20View%20app%20page%20at%20https%3A%2F%2Fmodal.com%2Fapps%2Fap-XYZ1234.%0A...`,lang:`shell`});var J=s(q,6);u(J,{id:`debug-logs`,children:(e,t)=>{c(),i(e,r(`Debug logs`))},$$slots:{default:!0}});var Y=s(J,4);f(Y,{code:`MODAL_LOGLEVEL%3DDEBUG%20modal%20run%20hello.py`,lang:`bash`});var X=s(Y,2);m(s(e(X),3),{href:`/docs/sdk/py/latest/Secret`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),c(),n(X);var Z=s(X,2);f(Z,{code:`%40app.function(secrets%3D%5Bmodal.Secret.from_dict(%7B%22MODAL_LOGLEVEL%22%3A%20%22DEBUG%22%7D)%5D)%0Adef%20f()%3A%0A%20%20%20%20print(%22Hello%2C%20world!%22)`,lang:`python`});var Q=s(Z,2);u(Q,{id:`client-tracebacks`,children:(e,t)=>{c(),i(e,r(`Client tracebacks`))},$$slots:{default:!0}});var $=s(Q,2);m(s(e($)),{href:`https://en.wikipedia.org/wiki/Stack_trace`,rel:`nofollow`,children:(e,t)=>{c(),i(e,r(`stack trace`))},$$slots:{default:!0}}),c(5),n($),f(s($,2),{code:`MODAL_TRACEBACK%3D1%20modal%20run%20my_app.py`,lang:`bash`}),c(2),i(t,a)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=DsuZtWAa2.js.map
