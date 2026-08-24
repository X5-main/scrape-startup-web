(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`635149a0-3617-48a0-9295-128e77dc3797`,e._sentryDebugIdIdentifier=`sentry-dbid-635149a0-3617-48a0-9295-128e77dc3797`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{a as u,i as d,o as f}from"./CPby7b1n.js";import{t as p}from"./BILrvr3I.js";import{t as m}from"./B4L_if842.js";import{t as h}from"./DeWGVqas2.js";var g={toc:[{depth:1,value:`Hello, world!`,id:`hello-world`,children:[{depth:2,value:`Importing Modal and setting up`,id:`importing-modal-and-setting-up`},{depth:2,value:`Defining a function`,id:`defining-a-function`},{depth:2,value:`Running our function locally, remotely, and in parallel`,id:`running-our-function-locally-remotely-and-in-parallel`},{depth:2,value:`What just happened?`,id:`what-just-happened`},{depth:2,value:`But why does this matter?`,id:`but-why-does-this-matter`,children:[{depth:3,value:`You can change the code and run it again`,id:`you-can-change-the-code-and-run-it-again`},{depth:3,value:`You can map over more data`,id:`you-can-map-over-more-data`},{depth:3,value:`You can run a more interesting function`,id:`you-can-run-a-more-interesting-function`}]}]}],rawContent:`# Hello, world!

This tutorial demonstrates some core features of Modal:

* You can run functions on Modal just as easily as you run them locally.
* Running functions in parallel on Modal is simple and fast.
* Logs and errors show up immediately, even for functions running on Modal.

## Importing Modal and setting up

We start by importing \`modal\` and creating a \`App\`.
We build up this \`App\` to [define our application](https://modal.com/docs/guide/apps).

\`\`\`python
import sys

import modal

app = modal.App("example-hello-world")

\`\`\`

## Defining a function

Modal takes code and runs it in the cloud.

So first we've got to write some code.

Let's write a simple function that takes in an input,
prints a log or an error to the console,
and then returns an output.

To make this function work with Modal, we just wrap it in a decorator,
[\`@app.function\`](https://modal.com/docs/reference/modal.App#function).

\`\`\`python
@app.function()
def f(i):
    if i % 2 == 0:
        print("hello", i)
    else:
        print("world", i, file=sys.stderr)

    return i * i


\`\`\`

## Running our function locally, remotely, and in parallel

Now let's see three different ways we can call that function:

1. As a regular call on your \`local\` machine, with \`f.local\`

2. As a \`remote\` call that runs in the cloud, with \`f.remote\`

3. By \`map\`ping many copies of \`f\` in the cloud over many inputs, with \`f.map\`

We call \`f\` in each of these ways inside the \`main\` function below.

\`\`\`python
@app.local_entrypoint()
def main():
    # run the function locally
    print(f.local(1000))

    # run the function remotely on Modal
    print(f.remote(1000))

    # run the function in parallel and remotely on Modal
    total = 0
    for ret in f.map(range(200)):
        total += ret

    print(total)


\`\`\`

Enter \`modal run hello_world.py\` in a shell, and you'll see a Modal app initialize.
You'll then see the \`print\`ed logs of
the \`main\` function and, mixed in with them, all the logs of \`f\` as it is run
locally, then remotely, and then remotely and in parallel.

That's all triggered by adding the
[\`@app.local_entrypoint\`](https://modal.com/docs/reference/modal.App#local_entrypoint)
decorator on \`main\`, which defines it as the function to start from locally when we invoke \`modal run\`.

## What just happened?

When we called \`.remote\` on \`f\`, the function was executed
_in the cloud_, on Modal's infrastructure, not on the local machine.

In short, we took the function \`f\`, put it inside a container,
sent it the inputs, and streamed back the logs and outputs.

## But why does this matter?

Try one of these things next to start seeing the full power of Modal!

### You can change the code and run it again

For instance, change the \`print\` statement in the function \`f\`
to print \`"spam"\` and \`"eggs"\` instead and run the app again.
You'll see that that your new code is run with no extra work from you --
and it should even run faster!

Modal's goal is to make running code in the cloud feel like you're
running code locally. That means no waiting for long image builds when you've just moved a comma,
no fiddling with container image pushes, and no context-switching to a web UI to inspect logs.

### You can map over more data

Change the \`map\` range from \`200\` to some large number, like \`1170\`. You'll see
Modal create and run even more containers in parallel this time.

And it'll happen lightning fast!

### You can run a more interesting function

The function \`f\` is a bit silly and doesn't do much, but in its place
imagine something that matters to you, like:

* Running [language model inference](https://modal.com/docs/examples/vllm_inference)
or [fine-tuning](https://modal.com/docs/examples/slack-finetune)
* Manipulating [audio](https://modal.com/docs/examples/musicgen)
or [images](https://modal.com/docs/examples/diffusers_lora_finetune)
* [Embedding huge text datasets](https://modal.com/docs/examples/amazon_embeddings) at lightning fast speeds

Modal lets you parallelize that operation effortlessly by running hundreds or
thousands of containers in the cloud.
`,meta:{title:`Hello, world!`,description:`This tutorial demonstrates some core features of Modal:`}},{toc:_,rawContent:v,meta:y}=g,b=t(`<code>@app.function</code>`),x=t(`<code>@app.local_entrypoint</code>`),S=t(`<!> <p>This tutorial demonstrates some core features of Modal:</p> <ul><li>You can run functions on Modal just as easily as you run them locally.</li> <li>Running functions in parallel on Modal is simple and fast.</li> <li>Logs and errors show up immediately, even for functions running on Modal.</li></ul> <!> <p>We start by importing <code>modal</code> and creating a <code>App</code>.
We build up this <code>App</code> to <!>.</p> <!> <!> <p>Modal takes code and runs it in the cloud.</p> <p>So first we’ve got to write some code.</p> <p>Let’s write a simple function that takes in an input,
prints a log or an error to the console,
and then returns an output.</p> <p>To make this function work with Modal, we just wrap it in a decorator, <!>.</p> <!> <!> <p>Now let’s see three different ways we can call that function:</p> <ol><li><p>As a regular call on your <code>local</code> machine, with <code>f.local</code></p></li> <li><p>As a <code>remote</code> call that runs in the cloud, with <code>f.remote</code></p></li> <li><p>By <code>map</code>ping many copies of <code>f</code> in the cloud over many inputs, with <code>f.map</code></p></li></ol> <p>We call <code>f</code> in each of these ways inside the <code>main</code> function below.</p> <!> <p>Enter <code>modal run hello_world.py</code> in a shell, and you’ll see a Modal app initialize.
You’ll then see the <code>print</code>ed logs of
the <code>main</code> function and, mixed in with them, all the logs of <code>f</code> as it is run
locally, then remotely, and then remotely and in parallel.</p> <p>That’s all triggered by adding the <!> decorator on <code>main</code>, which defines it as the function to start from locally when we invoke <code>modal run</code>.</p> <!> <p>When we called <code>.remote</code> on <code>f</code>, the function was executed <em>in the cloud</em>, on Modal’s infrastructure, not on the local machine.</p> <p>In short, we took the function <code>f</code>, put it inside a container,
sent it the inputs, and streamed back the logs and outputs.</p> <!> <p>Try one of these things next to start seeing the full power of Modal!</p> <!> <p>For instance, change the <code>print</code> statement in the function <code>f</code> to print <code>"spam"</code> and <code>"eggs"</code> instead and run the app again.
You’ll see that that your new code is run with no extra work from you —
and it should even run faster!</p> <p>Modal’s goal is to make running code in the cloud feel like you’re
running code locally. That means no waiting for long image builds when you’ve just moved a comma,
no fiddling with container image pushes, and no context-switching to a web UI to inspect logs.</p> <!> <p>Change the <code>map</code> range from <code>200</code> to some large number, like <code>1170</code>. You’ll see
Modal create and run even more containers in parallel this time.</p> <p>And it’ll happen lightning fast!</p> <!> <p>The function <code>f</code> is a bit silly and doesn’t do much, but in its place
imagine something that matters to you, like:</p> <ul><li>Running <!> or <!></li> <li>Manipulating <!> or <!></li> <li><!> at lightning fast speeds</li></ul> <p>Modal lets you parallelize that operation effortlessly by running hundreds or
thousands of containers in the cloud.</p>`,1);function C(t,_){let v=a(_,[`children`,`$$slots`,`$$events`,`$$legacy`]);m(t,o(()=>v,()=>g,{children:(t,a)=>{var o=S(),m=s(o);f(m,{id:`hello-world`,children:(e,t)=>{l(),i(e,r(`Hello, world!`))},$$slots:{default:!0}});var g=c(m,6);u(g,{id:`importing-modal-and-setting-up`,children:(e,t)=>{l(),i(e,r(`Importing Modal and setting up`))},$$slots:{default:!0}});var _=c(g,2);h(c(e(_),7),{href:`https://modal.com/docs/guide/apps`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`define our application`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);p(v,{code:`import%20sys%0A%0Aimport%20modal%0A%0Aapp%20%3D%20modal.App(%22example-hello-world%22)%0A`,lang:`python`});var y=c(v,2);u(y,{id:`defining-a-function`,children:(e,t)=>{l(),i(e,r(`Defining a function`))},$$slots:{default:!0}});var C=c(y,8);h(c(e(C)),{href:`https://modal.com/docs/reference/modal.App#function`,rel:`nofollow`,children:(e,t)=>{i(e,b())},$$slots:{default:!0}}),l(),n(C);var w=c(C,2);p(w,{code:`%40app.function()%0Adef%20f(i)%3A%0A%20%20%20%20if%20i%20%25%202%20%3D%3D%200%3A%0A%20%20%20%20%20%20%20%20print(%22hello%22%2C%20i)%0A%20%20%20%20else%3A%0A%20%20%20%20%20%20%20%20print(%22world%22%2C%20i%2C%20file%3Dsys.stderr)%0A%0A%20%20%20%20return%20i%20*%20i%0A%0A`,lang:`python`});var T=c(w,2);u(T,{id:`running-our-function-locally-remotely-and-in-parallel`,children:(e,t)=>{l(),i(e,r(`Running our function locally, remotely, and in parallel`))},$$slots:{default:!0}});var E=c(T,8);p(E,{code:`%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20run%20the%20function%20locally%0A%20%20%20%20print(f.local(1000))%0A%0A%20%20%20%20%23%20run%20the%20function%20remotely%20on%20Modal%0A%20%20%20%20print(f.remote(1000))%0A%0A%20%20%20%20%23%20run%20the%20function%20in%20parallel%20and%20remotely%20on%20Modal%0A%20%20%20%20total%20%3D%200%0A%20%20%20%20for%20ret%20in%20f.map(range(200))%3A%0A%20%20%20%20%20%20%20%20total%20%2B%3D%20ret%0A%0A%20%20%20%20print(total)%0A%0A`,lang:`python`});var D=c(E,4);h(c(e(D)),{href:`https://modal.com/docs/reference/modal.App#local_entrypoint`,rel:`nofollow`,children:(e,t)=>{i(e,x())},$$slots:{default:!0}}),l(5),n(D);var O=c(D,2);u(O,{id:`what-just-happened`,children:(e,t)=>{l(),i(e,r(`What just happened?`))},$$slots:{default:!0}});var k=c(O,6);u(k,{id:`but-why-does-this-matter`,children:(e,t)=>{l(),i(e,r(`But why does this matter?`))},$$slots:{default:!0}});var A=c(k,4);d(A,{id:`you-can-change-the-code-and-run-it-again`,children:(e,t)=>{l(),i(e,r(`You can change the code and run it again`))},$$slots:{default:!0}});var j=c(A,6);d(j,{id:`you-can-map-over-more-data`,children:(e,t)=>{l(),i(e,r(`You can map over more data`))},$$slots:{default:!0}});var M=c(j,6);d(M,{id:`you-can-run-a-more-interesting-function`,children:(e,t)=>{l(),i(e,r(`You can run a more interesting function`))},$$slots:{default:!0}});var N=c(M,4),P=e(N),F=c(e(P));h(F,{href:`https://modal.com/docs/examples/vllm_inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`language model inference`))},$$slots:{default:!0}}),h(c(F,2),{href:`https://modal.com/docs/examples/slack-finetune`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`fine-tuning`))},$$slots:{default:!0}}),n(P);var I=c(P,2),L=c(e(I));h(L,{href:`https://modal.com/docs/examples/musicgen`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`audio`))},$$slots:{default:!0}}),h(c(L,2),{href:`https://modal.com/docs/examples/diffusers_lora_finetune`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`images`))},$$slots:{default:!0}}),n(I);var R=c(I,2);h(e(R),{href:`https://modal.com/docs/examples/amazon_embeddings`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Embedding huge text datasets`))},$$slots:{default:!0}}),l(),n(R),n(N),l(2),i(t,o)},$$slots:{default:!0}}))}export{C as default,g as metadata};
//# sourceMappingURL=DTaOYOv52.js.map
