(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eb808c79-a152-4534-8e2c-92ab7b128986`,e._sentryDebugIdIdentifier=`sentry-dbid-eb808c79-a152-4534-8e2c-92ab7b128986`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Introducing: Modal 1.0`,description:`We've released v1.0 of the Modal client, marking a new milestone of maturity and stability for our platform.`,date:`2025-06-09T12:00:00.000Z`,published:!0,length:`5 minute read`,category:`News`,layout:`blog`,toc:[{depth:2,value:`Design principles for 1.0`,id:`design-principles-for-10`,children:[{depth:3,value:`1. Avoiding unpredictable magic`,id:`1-avoiding-unpredictable-magic`},{depth:3,value:`2. Separating core functionality from additional concepts`,id:`2-separating-core-functionality-from-additional-concepts`},{depth:3,value:`3. One canonical path`,id:`3-one-canonical-path`}]},{depth:2,value:`A more predictable client release cycle`,id:`a-more-predictable-client-release-cycle`},{depth:2,value:`What’s next?`,id:`whats-next`}],rawContent:`Last week, we launched [version 1.0 of the Modal client](https://pypi.org/project/modal/). This is a significant milestone for us because it marks a new level of maturity and stability for the Modal platform. We've worked to make the client API more robust and predictable, and we expect far fewer breaking changes moving forward.

So what do we mean by “Modal client”? If you're new to Modal, you can think of Modal in two parts: our client, which is a Python SDK, and our managed cloud platform, which we use to run user workloads around the world.

The client gives developers the ability to access serverless cloud compute from their application code via decorators. Here’s a basic example:

\`\`\`python
import modal

app = modal.App()

@app.function()
def cloud_function():
	...

@app.local_entrypoint()
def main():
	cloud_function.remote()  # This runs in the cloud!
\`\`\`

Developer ergonomics has been a core principle of Modal from the very beginning. Crafting a good developer experience requires making tricky tradeoffs along the way, however. Working towards 1.0 has given us a chance to reflect on our core design principles and some of the major decisions we’ve made along the way.

## Design principles for 1.0

### 1. Avoiding unpredictable magic

We want using Modal to feel a little magical, but "magic" behavior can be a double-edged sword. With 1.0, we've intentionally moved away from some of these "magic" behaviors.

One example is our old “automounting” feature. If your App had imports of local packages, we'd automatically find and include them in your Modal deployment. While helpful on the surface, this became unpredictable in many cases. Users could end up with more packages than needed, making deployments slower. Users could also start expecting every file they read to be automatically included, even when that wasn’t the case.

With 1.0, these behaviors are now explicit. You'll specify exactly what local files and packages are included in your container, apart from the Function’s own package. Your App definition might become more verbose, but the benefit is much more predictable and easy-to-debug behavior.

Before:

\`\`\`python
# Before: Modal will detect this local import and automount the package
from utils.llm import tokenize

app = modal.App()

@app.function()
def process():
    tokenize("some text")
\`\`\`

After:

\`\`\`python
from utils.llm import tokenize

app = modal.App()

# Now: You explicitly add the local utils package to your Image
image = modal.Image.debian_slim().add_local_python_source("utils")

@app.function(image=image)
def process():
    tokenize("some text")
\`\`\`

### 2. Separating core functionality from additional concepts

As the number of use cases powered by Modal grows, so does the number of concepts, and thus also the need for organizing them in a scalable way. We want to be able to add new features without making it harder to understand the basics.

After adding many new parameters to the \`@app.function\` decorator, we've recognized that trying to put every possible configuration into a single decorator quickly becomes unwieldy. Going forward, we’ll be clearly separating core functionality from additional concepts by splitting them up over separate decorators. An example of this is the new \`@modal.concurrent\` decorator, which lets you express concurrency patterns independently from the configuration in \`@app.function\`.

This pattern also allows us to add config options that are specific to each decorator, such as \`target_inputs\` in the code snippet below.

Before:

\`\`\`python
@app.function(allow_concurrent_inputs=1000)
def f(...):
    ...
\`\`\`

After:

\`\`\`python
@app.function()
@modal.concurrent(max_inputs=1200, target_inputs=1000)  # Let concurrency spike during scaleup
def f(...):
    ...
\`\`\`

### 3. One canonical path

We believe in providing clear paths for users to accomplish common tasks. This means reducing redundant methods for similar actions, simplifying the mental model for developers.

One example is how local files are brought into your Modal container. Previously, you could either specify them in your image setup or pass a \`modal.Mount\` directly in your Function configuration. This meant that two distinct object types were responsible for bringing local assets into the remote environment. We've now moved all of this functionality under the \`modal.Image\` class. This aligns with Modal's core promise of abstracting the container environment: everything related to the container _filesystem_ and its initial state is now managed explicitly and consistently within the \`Image\` definition. The \`Image\` class already had robust ways to bring over local data, so [consolidating](/docs/guide/modal-1-0-migration#deprecating-mount-as-part-of-the-public-api) here provides a more coherent experience.

\`\`\`python
# The below two Function definitions accomplished the same thing, so we're deprecating the former

mount = modal.Mount.from_local_dir("data").add_local_file("config.yaml")
@app.function(image=image, mount=mount)
def f():
    ...

image = image.add_local_dir("data").add_local_file("config.yaml")
@app.function(image=image)
def g():
    ...
\`\`\`

## A more predictable client release cycle

You'll also notice a shift in our client release cycle. We'll be batching updates together so it’s easier for you to quickly see what's new and decide when to upgrade. This gives you more predictability and control over your development environment. You’ll always be able to see what changes we’ve made in our [changelog](/docs/reference/changelog).

## What's next?

Modal 1.0 is a significant milestone, but it's just the beginning. There are a couple of particularly exciting directions we're taking the client SDK. One is creating SDKs for other languages, which we've made [good progress](/blog/sdk-javascript-go) on already. The other is exploring the distinction between Modal as a software tool for humans versus a tool for agents. What does it mean to have good ergonomics in a world where development is mediated by AI tools? How can we adapt the platform to better serve the unique needs of AI-driven workflows?

We think you'll appreciate the stability and clarity that Modal 1.0 brings, and we hope this release will make building with Modal even more productive. For detailed instructions on how to migrate to 1.0, check out the [1.0 release notes](/docs/reference/changelog#100-2025-05-16) and our [migration guide](/docs/guide/modal-1-0-migration).
`,meta:{description:`We've released v1.0 of the Modal client, marking a new milestone of maturity and stability for our platform.`}},{title:m,description:h,date:g,published:_,length:v,category:y,layout:b,toc:x,rawContent:S,meta:C}=p,w=t(`<p>Last week, we launched <!>. This is a significant milestone for us because it marks a new level of maturity and stability for the Modal platform. We’ve worked to make the client API more robust and predictable, and we expect far fewer breaking changes moving forward.</p> <p>So what do we mean by “Modal client”? If you’re new to Modal, you can think of Modal in two parts: our client, which is a Python SDK, and our managed cloud platform, which we use to run user workloads around the world.</p> <p>The client gives developers the ability to access serverless cloud compute from their application code via decorators. Here’s a basic example:</p> <!> <p>Developer ergonomics has been a core principle of Modal from the very beginning. Crafting a good developer experience requires making tricky tradeoffs along the way, however. Working towards 1.0 has given us a chance to reflect on our core design principles and some of the major decisions we’ve made along the way.</p> <h2 id="design-principles-for-10">Design principles for 1.0</h2> <h3 id="1-avoiding-unpredictable-magic">1. Avoiding unpredictable magic</h3> <p>We want using Modal to feel a little magical, but “magic” behavior can be a double-edged sword. With 1.0, we’ve intentionally moved away from some of these “magic” behaviors.</p> <p>One example is our old “automounting” feature. If your App had imports of local packages, we’d automatically find and include them in your Modal deployment. While helpful on the surface, this became unpredictable in many cases. Users could end up with more packages than needed, making deployments slower. Users could also start expecting every file they read to be automatically included, even when that wasn’t the case.</p> <p>With 1.0, these behaviors are now explicit. You’ll specify exactly what local files and packages are included in your container, apart from the Function’s own package. Your App definition might become more verbose, but the benefit is much more predictable and easy-to-debug behavior.</p> <p>Before:</p> <!> <p>After:</p> <!> <h3 id="2-separating-core-functionality-from-additional-concepts">2. Separating core functionality from additional concepts</h3> <p>As the number of use cases powered by Modal grows, so does the number of concepts, and thus also the need for organizing them in a scalable way. We want to be able to add new features without making it harder to understand the basics.</p> <p>After adding many new parameters to the <code>@app.function</code> decorator, we’ve recognized that trying to put every possible configuration into a single decorator quickly becomes unwieldy. Going forward, we’ll be clearly separating core functionality from additional concepts by splitting them up over separate decorators. An example of this is the new <code>@modal.concurrent</code> decorator, which lets you express concurrency patterns independently from the configuration in <code>@app.function</code>.</p> <p>This pattern also allows us to add config options that are specific to each decorator, such as <code>target_inputs</code> in the code snippet below.</p> <p>Before:</p> <!> <p>After:</p> <!> <h3 id="3-one-canonical-path">3. One canonical path</h3> <p>We believe in providing clear paths for users to accomplish common tasks. This means reducing redundant methods for similar actions, simplifying the mental model for developers.</p> <p>One example is how local files are brought into your Modal container. Previously, you could either specify them in your image setup or pass a <code>modal.Mount</code> directly in your Function configuration. This meant that two distinct object types were responsible for bringing local assets into the remote environment. We’ve now moved all of this functionality under the <code>modal.Image</code> class. This aligns with Modal’s core promise of abstracting the container environment: everything related to the container <em>filesystem</em> and its initial state is now managed explicitly and consistently within the <code>Image</code> definition. The <code>Image</code> class already had robust ways to bring over local data, so <!> here provides a more coherent experience.</p> <!> <h2 id="a-more-predictable-client-release-cycle">A more predictable client release cycle</h2> <p>You’ll also notice a shift in our client release cycle. We’ll be batching updates together so it’s easier for you to quickly see what’s new and decide when to upgrade. This gives you more predictability and control over your development environment. You’ll always be able to see what changes we’ve made in our <!>.</p> <h2 id="whats-next">What’s next?</h2> <p>Modal 1.0 is a significant milestone, but it’s just the beginning. There are a couple of particularly exciting directions we’re taking the client SDK. One is creating SDKs for other languages, which we’ve made <!> on already. The other is exploring the distinction between Modal as a software tool for humans versus a tool for agents. What does it mean to have good ergonomics in a world where development is mediated by AI tools? How can we adapt the platform to better serve the unique needs of AI-driven workflows?</p> <p>We think you’ll appreciate the stability and clarity that Modal 1.0 brings, and we hope this release will make building with Modal even more productive. For detailed instructions on how to migrate to 1.0, check out the <!> and our <!>.</p>`,1);function T(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=w(),f=s(o);d(c(e(f)),{href:`https://pypi.org/project/modal/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`version 1.0 of the Modal client`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,6);u(p,{code:`import%20modal%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function()%0Adef%20cloud_function()%3A%0A%09...%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%09cloud_function.remote()%20%20%23%20This%20runs%20in%20the%20cloud!`,lang:`python`});var m=c(p,16);u(m,{code:`%23%20Before%3A%20Modal%20will%20detect%20this%20local%20import%20and%20automount%20the%20package%0Afrom%20utils.llm%20import%20tokenize%0A%0Aapp%20%3D%20modal.App()%0A%0A%40app.function()%0Adef%20process()%3A%0A%20%20%20%20tokenize(%22some%20text%22)`,lang:`python`});var h=c(m,4);u(h,{code:`from%20utils.llm%20import%20tokenize%0A%0Aapp%20%3D%20modal.App()%0A%0A%23%20Now%3A%20You%20explicitly%20add%20the%20local%20utils%20package%20to%20your%20Image%0Aimage%20%3D%20modal.Image.debian_slim().add_local_python_source(%22utils%22)%0A%0A%40app.function(image%3Dimage)%0Adef%20process()%3A%0A%20%20%20%20tokenize(%22some%20text%22)`,lang:`python`});var g=c(h,12);u(g,{code:`%40app.function(allow_concurrent_inputs%3D1000)%0Adef%20f(...)%3A%0A%20%20%20%20...`,lang:`python`});var _=c(g,4);u(_,{code:`%40app.function()%0A%40modal.concurrent(max_inputs%3D1200%2C%20target_inputs%3D1000)%20%20%23%20Let%20concurrency%20spike%20during%20scaleup%0Adef%20f(...)%3A%0A%20%20%20%20...`,lang:`python`});var v=c(_,6);d(c(e(v),11),{href:`/docs/guide/modal-1-0-migration#deprecating-mount-as-part-of-the-public-api`,children:(e,t)=>{l(),i(e,r(`consolidating`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);u(y,{code:`%23%20The%20below%20two%20Function%20definitions%20accomplished%20the%20same%20thing%2C%20so%20we're%20deprecating%20the%20former%0A%0Amount%20%3D%20modal.Mount.from_local_dir(%22data%22).add_local_file(%22config.yaml%22)%0A%40app.function(image%3Dimage%2C%20mount%3Dmount)%0Adef%20f()%3A%0A%20%20%20%20...%0A%0Aimage%20%3D%20image.add_local_dir(%22data%22).add_local_file(%22config.yaml%22)%0A%40app.function(image%3Dimage)%0Adef%20g()%3A%0A%20%20%20%20...`,lang:`python`});var b=c(y,4);d(c(e(b)),{href:`/docs/reference/changelog`,children:(e,t)=>{l(),i(e,r(`changelog`))},$$slots:{default:!0}}),l(),n(b);var x=c(b,4);d(c(e(x)),{href:`/blog/sdk-javascript-go`,children:(e,t)=>{l(),i(e,r(`good progress`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2),C=c(e(S));d(C,{href:`/docs/reference/changelog#100-2025-05-16`,children:(e,t)=>{l(),i(e,r(`1.0 release notes`))},$$slots:{default:!0}}),d(c(C,2),{href:`/docs/guide/modal-1-0-migration`,children:(e,t)=>{l(),i(e,r(`migration guide`))},$$slots:{default:!0}}),l(),n(S),i(t,o)},$$slots:{default:!0}}))}export{T as default,p as metadata};
//# sourceMappingURL=Bb0brnaV2.js.map
