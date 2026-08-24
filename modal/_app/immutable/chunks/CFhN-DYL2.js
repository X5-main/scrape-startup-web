(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`90a418e9-ec65-4128-94d8-debc414fd3f8`,e._sentryDebugIdIdentifier=`sentry-dbid-90a418e9-ec65-4128-94d8-debc414fd3f8`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Apps, Functions, and entrypoints`,id:`apps-functions-and-entrypoints`,children:[{depth:2,value:`Ephemeral Apps`,id:`ephemeral-apps`},{depth:2,value:`Deployed Apps`,id:`deployed-apps`},{depth:2,value:`Entrypoints for ephemeral Apps`,id:`entrypoints-for-ephemeral-apps`,children:[{depth:3,value:`Argument parsing`,id:`argument-parsing`},{depth:3,value:`Manually specifying an entrypoint`,id:`manually-specifying-an-entrypoint`}]},{depth:2,value:`Apps were once Stubs`,id:`apps-were-once-stubs`}]}],rawContent:`# Apps, Functions, and entrypoints

An [\`App\`](/docs/sdk/py/latest/App) represents an application running on Modal. It groups one or more Functions for atomic deployment and acts as a shared namespace. All Functions and Clses are associated with an
App.

A [\`Function\`](/docs/sdk/py/latest/Function) acts as an independent unit once it is deployed, and [scales up and down](/docs/guide/scale) independently from other Functions. If there are no live inputs to the Function then by default, no containers will run and your account will not be charged for compute resources, even if the App it belongs to is deployed.

An App can be ephemeral or deployed. You can view a list of all currently running Apps on the [\`apps\`](/apps) page.

The code for a Modal App defining two separate Functions might look something like this:

\`\`\`python

import modal

app = modal.App(name="my-modal-app")


@app.function()
def f():
    print("Hello world!")


@app.function()
def g():
    print("Goodbye world!")

\`\`\`

## Ephemeral Apps

An ephemeral App is created when you use the
[\`modal run\`](/docs/cli/latest/run) CLI command, or the
[\`app.run\`](/docs/sdk/py/latest/App#run) method. This creates a temporary
App that only exists for the duration of your script.

Ephemeral Apps are stopped automatically when the calling program exits, or when
the server detects that the client is no longer connected.
You can use
[\`--detach\`](/docs/cli/latest/run) in order to keep an ephemeral App running even
after the client exits.

By using \`app.run\` you can run your Modal Apps from within your Python scripts:

\`\`\`python
def main():
    ...
    with app.run():
        some_modal_function.remote()
\`\`\`

By default, running your App in this way won't propagate Modal logs and progress bar messages. To enable output, use the [\`modal.enable_output\`](/docs/sdk/py/latest/enable_output) context manager:

\`\`\`python
def main():
    ...
    with modal.enable_output():
        with app.run():
            some_modal_function.remote()
\`\`\`

## Deployed Apps

A deployed App is created using the [\`modal deploy\`](/docs/cli/latest/deploy)
CLI command. The App is persisted indefinitely until you stop it via the
[web UI](/apps) or the [\`modal app stop\`](/docs/cli/latest/app#modal-app-stop) command. Functions in a deployed App that have an attached
[schedule](/docs/guide/cron) will be run on a schedule. Otherwise, you can
invoke them manually using
[Web Functions or Python](/docs/guide/trigger-deployed-functions).

Deployed Apps are named via the [\`App\`](/docs/sdk/py/latest/App)
constructor. Re-deploying an existing \`App\` (based on the name) will update it
in place.

## Entrypoints for ephemeral Apps

The code that runs first when you \`modal run\` an App is called the "entrypoint".

You can register a local entrypoint using the
[\`@app.local_entrypoint()\`](/docs/sdk/py/latest/App#local_entrypoint)
decorator. You can also use a regular Modal Function as an entrypoint, in which
case only the code in global scope is executed locally.

### Argument parsing

If your entrypoint function takes arguments with primitive types, \`modal run\`
automatically parses them as CLI options. For example, the following function
can be called with \`modal run script.py --foo 1 --bar "hello"\`:

\`\`\`python
# script.py

@app.local_entrypoint()
def main(foo: int, bar: str):
    some_modal_function.remote(foo, bar)
\`\`\`

If you wish to use your own argument parsing library, such as \`argparse\`, you can instead accept a variable-length argument list for your entrypoint or your function. In this case, Modal skips CLI parsing and forwards CLI arguments as a tuple of strings. For example, the following function can be invoked with \`modal run my_file.py --foo=42 --bar="baz"\`:

\`\`\`python
import argparse

@app.function()
def train(*arglist):
    parser = argparse.ArgumentParser()
    parser.add_argument("--foo", type=int)
    parser.add_argument("--bar", type=str)
    args = parser.parse_args(args = arglist)
\`\`\`

### Manually specifying an entrypoint

If there is only one \`local_entrypoint\` registered,
[\`modal run script.py\`](/docs/cli/latest/run) will automatically use it. If
you have no entrypoint specified, and just one decorated Modal Function, that
will be used as a remote entrypoint instead. Otherwise, you can direct
\`modal run\` to use a specific entrypoint.

For example, if you have a function decorated with
[\`@app.function()\`](/docs/sdk/py/latest/App#function) in your file:

\`\`\`python
# script.py

@app.function()
def f():
    print("Hello world!")


@app.function()
def g():
    print("Goodbye world!")


@app.local_entrypoint()
def main():
    f.remote()
\`\`\`

Running [\`modal run script.py\`](/docs/cli/latest/run) will execute the \`main\`
function locally, which would call the \`f\` function remotely. However you can
instead run \`modal run script.py::app.f\` or \`modal run script.py::app.g\` to
execute \`f\` or \`g\` directly.

## Apps were once Stubs

The \`modal.App\` class in the client was previously called \`modal.Stub\`. The
old name was kept as an alias for some time, but from Modal 1.0.0 onwards,
using \`modal.Stub\` will result in an error.
`,meta:{title:`Apps, Functions, and entrypoints`,description:`An App represents an application running on Modal. It groups one or more Functions for atomic deployment and acts as a shared namespace. All Functions and Clses are associated with an App.`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>App</code>`),ee=t(`<code>Function</code>`),te=t(`<code>apps</code>`),ne=t(`<code>modal run</code>`),re=t(`<code>app.run</code>`),ie=t(`<code>--detach</code>`),ae=t(`<code>modal.enable_output</code>`),x=t(`<code>modal deploy</code>`),S=t(`<code>modal app stop</code>`),C=t(`<code>App</code>`),w=t(`<code>@app.local_entrypoint()</code>`),T=t(`<code>modal run script.py</code>`),E=t(`<code>@app.function()</code>`),D=t(`<code>modal run script.py</code>`),O=t(`<!> <p>An <!> represents an application running on Modal. It groups one or more Functions for atomic deployment and acts as a shared namespace. All Functions and Clses are associated with an
App.</p> <p>A <!> acts as an independent unit once it is deployed, and <!> independently from other Functions. If there are no live inputs to the Function then by default, no containers will run and your account will not be charged for compute resources, even if the App it belongs to is deployed.</p> <p>An App can be ephemeral or deployed. You can view a list of all currently running Apps on the <!> page.</p> <p>The code for a Modal App defining two separate Functions might look something like this:</p> <!> <!> <p>An ephemeral App is created when you use the <!> CLI command, or the <!> method. This creates a temporary
App that only exists for the duration of your script.</p> <p>Ephemeral Apps are stopped automatically when the calling program exits, or when
the server detects that the client is no longer connected.
You can use <!> in order to keep an ephemeral App running even
after the client exits.</p> <p>By using <code>app.run</code> you can run your Modal Apps from within your Python scripts:</p> <!> <p>By default, running your App in this way won’t propagate Modal logs and progress bar messages. To enable output, use the <!> context manager:</p> <!> <!> <p>A deployed App is created using the <!> CLI command. The App is persisted indefinitely until you stop it via the <!> or the <!> command. Functions in a deployed App that have an attached <!> will be run on a schedule. Otherwise, you can
invoke them manually using <!>.</p> <p>Deployed Apps are named via the <!> constructor. Re-deploying an existing <code>App</code> (based on the name) will update it
in place.</p> <!> <p>The code that runs first when you <code>modal run</code> an App is called the “entrypoint”.</p> <p>You can register a local entrypoint using the <!> decorator. You can also use a regular Modal Function as an entrypoint, in which
case only the code in global scope is executed locally.</p> <!> <p>If your entrypoint function takes arguments with primitive types, <code>modal run</code> automatically parses them as CLI options. For example, the following function
can be called with <code>modal run script.py --foo 1 --bar "hello"</code>:</p> <!> <p>If you wish to use your own argument parsing library, such as <code>argparse</code>, you can instead accept a variable-length argument list for your entrypoint or your function. In this case, Modal skips CLI parsing and forwards CLI arguments as a tuple of strings. For example, the following function can be invoked with <code>modal run my_file.py --foo=42 --bar="baz"</code>:</p> <!> <!> <p>If there is only one <code>local_entrypoint</code> registered, <!> will automatically use it. If
you have no entrypoint specified, and just one decorated Modal Function, that
will be used as a remote entrypoint instead. Otherwise, you can direct <code>modal run</code> to use a specific entrypoint.</p> <p>For example, if you have a function decorated with <!> in your file:</p> <!> <p>Running <!> will execute the <code>main</code> function locally, which would call the <code>f</code> function remotely. However you can
instead run <code>modal run script.py::app.f</code> or <code>modal run script.py::app.g</code> to
execute <code>f</code> or <code>g</code> directly.</p> <!> <p>The <code>modal.App</code> class in the client was previously called <code>modal.Stub</code>. The
old name was kept as an alias for some time, but from Modal 1.0.0 onwards,
using <code>modal.Stub</code> will result in an error.</p>`,1);function k(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=O(),m=s(o);f(m,{id:`apps-functions-and-entrypoints`,children:(e,t)=>{l(),i(e,r(`Apps, Functions, and entrypoints`))},$$slots:{default:!0}});var g=c(m,2);h(c(e(g)),{href:`/docs/sdk/py/latest/App`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(g);var _=c(g,2),v=c(e(_));h(v,{href:`/docs/sdk/py/latest/Function`,children:(e,t)=>{i(e,ee())},$$slots:{default:!0}}),h(c(v,2),{href:`/docs/guide/scale`,children:(e,t)=>{l(),i(e,r(`scales up and down`))},$$slots:{default:!0}}),l(),n(_);var y=c(_,2);h(c(e(y)),{href:`/apps`,children:(e,t)=>{i(e,te())},$$slots:{default:!0}}),l(),n(y);var k=c(y,4);p(k,{code:`%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(name%3D%22my-modal-app%22)%0A%0A%0A%40app.function()%0Adef%20f()%3A%0A%20%20%20%20print(%22Hello%20world!%22)%0A%0A%0A%40app.function()%0Adef%20g()%3A%0A%20%20%20%20print(%22Goodbye%20world!%22)%0A`,lang:`python`});var A=c(k,2);u(A,{id:`ephemeral-apps`,children:(e,t)=>{l(),i(e,r(`Ephemeral Apps`))},$$slots:{default:!0}});var j=c(A,2),M=c(e(j));h(M,{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,ne())},$$slots:{default:!0}}),h(c(M,2),{href:`/docs/sdk/py/latest/App#run`,children:(e,t)=>{i(e,re())},$$slots:{default:!0}}),l(),n(j);var N=c(j,2);h(c(e(N)),{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,ie())},$$slots:{default:!0}}),l(),n(N);var P=c(N,4);p(P,{code:`def%20main()%3A%0A%20%20%20%20...%0A%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20some_modal_function.remote()`,lang:`python`});var F=c(P,2);h(c(e(F)),{href:`/docs/sdk/py/latest/enable_output`,children:(e,t)=>{i(e,ae())},$$slots:{default:!0}}),l(),n(F);var I=c(F,2);p(I,{code:`def%20main()%3A%0A%20%20%20%20...%0A%20%20%20%20with%20modal.enable_output()%3A%0A%20%20%20%20%20%20%20%20with%20app.run()%3A%0A%20%20%20%20%20%20%20%20%20%20%20%20some_modal_function.remote()`,lang:`python`});var L=c(I,2);u(L,{id:`deployed-apps`,children:(e,t)=>{l(),i(e,r(`Deployed Apps`))},$$slots:{default:!0}});var R=c(L,2),z=c(e(R));h(z,{href:`/docs/cli/latest/deploy`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}});var B=c(z,2);h(B,{href:`/apps`,children:(e,t)=>{l(),i(e,r(`web UI`))},$$slots:{default:!0}});var V=c(B,2);h(V,{href:`/docs/cli/latest/app#modal-app-stop`,children:(e,t)=>{i(e,S())},$$slots:{default:!0}});var H=c(V,2);h(H,{href:`/docs/guide/cron`,children:(e,t)=>{l(),i(e,r(`schedule`))},$$slots:{default:!0}}),h(c(H,2),{href:`/docs/guide/trigger-deployed-functions`,children:(e,t)=>{l(),i(e,r(`Web Functions or Python`))},$$slots:{default:!0}}),l(),n(R);var U=c(R,2);h(c(e(U)),{href:`/docs/sdk/py/latest/App`,children:(e,t)=>{i(e,C())},$$slots:{default:!0}}),l(3),n(U);var W=c(U,2);u(W,{id:`entrypoints-for-ephemeral-apps`,children:(e,t)=>{l(),i(e,r(`Entrypoints for ephemeral Apps`))},$$slots:{default:!0}});var G=c(W,4);h(c(e(G)),{href:`/docs/sdk/py/latest/App#local_entrypoint`,children:(e,t)=>{i(e,w())},$$slots:{default:!0}}),l(),n(G);var K=c(G,2);d(K,{id:`argument-parsing`,children:(e,t)=>{l(),i(e,r(`Argument parsing`))},$$slots:{default:!0}});var q=c(K,4);p(q,{code:`%23%20script.py%0A%0A%40app.local_entrypoint()%0Adef%20main(foo%3A%20int%2C%20bar%3A%20str)%3A%0A%20%20%20%20some_modal_function.remote(foo%2C%20bar)`,lang:`python`});var J=c(q,4);p(J,{code:`import%20argparse%0A%0A%40app.function()%0Adef%20train(*arglist)%3A%0A%20%20%20%20parser%20%3D%20argparse.ArgumentParser()%0A%20%20%20%20parser.add_argument(%22--foo%22%2C%20type%3Dint)%0A%20%20%20%20parser.add_argument(%22--bar%22%2C%20type%3Dstr)%0A%20%20%20%20args%20%3D%20parser.parse_args(args%20%3D%20arglist)`,lang:`python`});var Y=c(J,2);d(Y,{id:`manually-specifying-an-entrypoint`,children:(e,t)=>{l(),i(e,r(`Manually specifying an entrypoint`))},$$slots:{default:!0}});var X=c(Y,2);h(c(e(X),3),{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,T())},$$slots:{default:!0}}),l(3),n(X);var Z=c(X,2);h(c(e(Z)),{href:`/docs/sdk/py/latest/App#function`,children:(e,t)=>{i(e,E())},$$slots:{default:!0}}),l(),n(Z);var Q=c(Z,2);p(Q,{code:`%23%20script.py%0A%0A%40app.function()%0Adef%20f()%3A%0A%20%20%20%20print(%22Hello%20world!%22)%0A%0A%0A%40app.function()%0Adef%20g()%3A%0A%20%20%20%20print(%22Goodbye%20world!%22)%0A%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20f.remote()`,lang:`python`});var $=c(Q,2);h(c(e($)),{href:`/docs/cli/latest/run`,children:(e,t)=>{i(e,D())},$$slots:{default:!0}}),l(13),n($),u(c($,2),{id:`apps-were-once-stubs`,children:(e,t)=>{l(),i(e,r(`Apps were once Stubs`))},$$slots:{default:!0}}),l(2),i(t,o)},$$slots:{default:!0}}))}export{k as default,g as metadata};
//# sourceMappingURL=CFhN-DYL2.js.map
