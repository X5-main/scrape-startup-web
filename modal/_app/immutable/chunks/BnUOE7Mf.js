(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`86cb4fcb-ebf6-453d-b24d-dddd4a563e7d`,e._sentryDebugIdIdentifier=`sentry-dbid-86cb4fcb-ebf6-453d-b24d-dddd4a563e7d`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Modal Sandboxes are generally available`,description:`Sandboxes are a new way to run code in Modal, with a focus on security and isolation.`,date:`2025-01-21T12:00:00.000Z`,length:`5 minute read`,category:`News`,published:!0,layout:`blog`,toc:[{depth:2,value:`Why we built Sandboxes`,id:`why-we-built-sandboxes`},{depth:2,value:`Enough talk, let’s see the code`,id:`enough-talk-lets-see-the-code`},{depth:2,value:`Why use Modal Sandboxes`,id:`why-use-modal-sandboxes`},{depth:2,value:`Customer stories`,id:`customer-stories`,children:[{depth:3,value:`Accelerating agent benchmarks with SWE-bench`,id:`accelerating-agent-benchmarks-with-swe-bench`},{depth:3,value:`Secure code execution at Quora`,id:`secure-code-execution-at-quora`},{depth:3,value:`Large-scale refactors with Codegen`,id:`large-scale-refactors-with-codegen`},{depth:3,value:`AI workforce automation with Relevance AI`,id:`ai-workforce-automation-with-relevance-ai`}]},{depth:2,value:`Get started today`,id:`get-started-today`}],rawContent:`Sandboxes are the Modal primitive for safely running untrusted code, whether that code comes from LLMs, users, or other third-party sources. We've been honing Sandboxes in beta for the past year, and today we're excited to announce they're generally available!

## Why we built Sandboxes

We built Modal [Functions](https://modal.com/docs/reference/modal.Function) to run code written by you, the user. Your Functions can interact with your Modal workspace - they can mount Secrets, create Volumes, call other Functions, and more. This model works because you know you can trust the code you deploy directly.

But agentic systems need to execute code without human supervision. Your agent may make a destructive mistake, or a malicious user may prompt your agent in a dangerous direction! In either case, you can't trust an LLM with your resources the same way that you can trust yourself. LLM-generated code should run in an isolated environment where its blast radius is limited.

These concerns extend to your users as well. When executing user-written code, you need to ensure that an attacker can't damage your environment or extract sensitive data.

We built Sandboxes to solve for these concerns. Sandboxes give you a dynamic environment to run code in an arbitrary language, safely isolated from the rest of your Modal resources.

## Enough talk, let's see the code

[Sandboxes](https://modal.com/docs/guide/sandboxes) provide a simple \`exec\` API for executing code:

\`\`\`python
import modal
app = modal.App.lookup("sandbox-manager", create_if_missing=True)
sb = modal.Sandbox.create(app=app)

p = sb.exec("python", "-c", "print('hello')")
print(p.stdout.read())
sb.terminate()
\`\`\`

LLMs may specify dependencies or need to execute code in other languages. Sandboxes let you configure the execution environment at runtime, using the same [Image](https://modal.com/docs/guide/images) API and infrastructure as Functions:

\`\`\`python
# Get requested dependencies from LLM and use them to
# dynamically build the Sandbox image.
llm_output = '{ "requested_packages": ["nodejs", "php"] }'
packages = json.loads(llm_output)["requested_packages"]
image = modal.Image.debian_slim().apt_install(*packages)

# Test that our languages work!
sb = modal.Sandbox.create(image=image, app=app)
p = sb.exec("node", "-e", 'console.log("hello from nodejs")')
print(p.stdout.read())
p = sb.exec("php", "-r", "echo 'hello from php';")
print(p.stdout.read())
\`\`\`

You can even [snapshot your filesystem](https://modal.com/docs/guide/sandbox-snapshots#filesystem-snapshots) for persistence and to fan out search over many Sandboxes:

\`\`\`python
sb = modal.Sandbox.create(app=app)
sb.exec("bash", "-c", "echo 'data_file' > /data").wait()
snap = sb.snapshot_filesystem()

# These sandboxes will all have /data present and can fan out to
# run tests over many different states
sb2 = modal.Sandbox.create(image=snap, app=app)
sb3 = modal.Sandbox.create(image=snap, app=app)
p2 = sb2.exec("pytest", "tests/unit")
p3 = sb3.exec("pytest", "tests/integration")
print(p2.stdout.read())
print(p3.stdout.read())
\`\`\`

This is just a taste of the Sandbox feature set. Check out the [Sandbox docs](https://modal.com/docs/guide/sandboxes) for details on how to [forward ports](https://modal.com/docs/guide/sandbox-networking#forwarding-ports), [restrict network access](https://modal.com/docs/guide/sandbox-networking), [access files](https://modal.com/docs/guide/sandbox-files) and more.

## Why use Modal Sandboxes

Sandboxes run on the same underlying infrastructure as Functions, meaning you get all the benefits you're used to with Modal Functions. This means blazing fast cold starts, access to the latest GPUs, global region selection, and more are all available in Sandboxes. As we make our core platform more powerful and reliable, those improvements will play out in both Functions and Sandboxes.

The tight integration in our platform also means it's simple to quickly build features that use both Sandboxes and Functions!

## Customer stories

We're proud of the applications our customers are building across a variety of use cases that require secure and scalable code execution.

### Accelerating agent benchmarks with SWE-bench

[SWE-bench](https://github.com/swe-bench/SWE-bench) is the highest profile benchmark for testing coding agents. It runs LLM-generated code against actual GitHub pull requests to measure model performance at fixing bugs, implementing features, and more.

We've upstreamed Modal support into SWE-bench for blazing fast evaluations. By adding a simple \`--modal\` flag to their run command, researchers can now:

- Run evaluations entirely in the cloud without any infrastructure setup
- Execute tests in parallel across hundreds of containers
- **Run the [Verified benchmark](https://openai.com/index/introducing-swe-bench-verified/) (500 tasks) in only 7 minutes**

Modal's built-in image caching follows the same layered approach as SWE-bench's existing Docker images, allowing for a simple integration process. These evaluation runs could take hours previously; the Modal integration enables a much tighter feedback loop.

<center>
    <video controls autoplay loop muted playsinline>
        <source src="https://modal-cdn.com/swe_bench_vid.mp4" type="video/mp4">
    </video>
</center>

### Secure code execution at Quora

[Quora](https://www.quora.com/) uses Modal Sandboxes to power the code execution in Poe, their AI chat platform. When you ask Poe's AI-powered bots to write and run code, that code executes safely in Modal Sandboxes. They're completely isolated, meaning the code is kept separate from both the main Quora infrastructure and any other user's code.

This integration allows Poe to offer interactive coding features while still maintaining strict security. You can experiment with code that the AI suggests without worrying about damaging the platform or exposing any sensitive data.

![Screenshot of Poe executing code to run a Caesar cipher](https://modal-cdn.com/cdnbot/quora_poe_chatc16fpv5o_3be7782a.webp)

We've done extensive performance testing to make sure we're future-proofed at any scale that Quora may burst up to. **We've tested Sandbox creation throughput up to 1000 Sandboxes per second** - if you need to rapidly scale out code execution, let us know!

### Large-scale refactors with Codegen

[Codegen](https://codegen.com) is building an AI system for performing large-scale codebase refactors. Their approach involves building a massive in-memory index of the target codebase and giving AI models the ability to execute "codemods" - automated code transformations that implement the desired changes. For example, our own [modal-client](https://github.com/modal-labs/modal-client) repository looks like this in Codegen:

![Visualization of the modal-client repository using Codegen](https://modal-cdn.com/cdnbot/codegen_visualizationtb2yqp1y_d1a8c5bc.webp)

Modal Sandboxes provide Codegen with two critical capabilities:

1. A reliable environment for building and maintaining their in-memory codebase representations
2. A secure execution environment for running AI-generated codemods with strict isolation

This combination of performance and security enables Codegen to confidently apply AI-driven refactoring at scale.

### AI workforce automation with Relevance AI

[Relevance AI](https://relevanceai.com) is building an AI workforce platform that uses agents to automate complex tasks. They leverage Modal Sandboxes in two key ways:

1. Providing a secure environment for their AI agents to run dynamically generated code
2. Powering their notebook/builder feature where users can write and execute code in a serverless environment

![Screenshot of Relevance's notebook feature](https://modal-cdn.com/cdnbot/relevance_notebookejxosnq0_5458ea4b.webp)

Modal Sandboxes were a perfect fit for Relevance AI because they offer:

- Flexibility to install any package on demand
- Full customization of runtime commands
- Fast cold-boot times for responsive execution
- Support for any programming language their agents need

This combination lets Relevance AI's agents tackle a wide range of automation tasks while maintaining strict security boundaries between executions.

## Get started today

Modal Sandboxes are available to all users. Whether you're building an AI coding assistant, running untrusted user code, or just need a secure environment for code execution, Sandboxes provide the tools you need.

To get started:

1. Install Modal: \`pip install modal\`
2. Create an account: \`python -m modal setup\`
3. Check out our [Sandbox documentation](https://modal.com/docs/guide/sandboxes)

We can't wait to see what you build!
`,meta:{description:`Sandboxes are a new way to run code in Modal, with a focus on security and isolation.`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Sandboxes are the Modal primitive for safely running untrusted code, whether that code comes from LLMs, users, or other third-party sources. We’ve been honing Sandboxes in beta for the past year, and today we’re excited to announce they’re generally available!</p> <h2 id="why-we-built-sandboxes">Why we built Sandboxes</h2> <p>We built Modal <!> to run code written by you, the user. Your Functions can interact with your Modal workspace - they can mount Secrets, create Volumes, call other Functions, and more. This model works because you know you can trust the code you deploy directly.</p> <p>But agentic systems need to execute code without human supervision. Your agent may make a destructive mistake, or a malicious user may prompt your agent in a dangerous direction! In either case, you can’t trust an LLM with your resources the same way that you can trust yourself. LLM-generated code should run in an isolated environment where its blast radius is limited.</p> <p>These concerns extend to your users as well. When executing user-written code, you need to ensure that an attacker can’t damage your environment or extract sensitive data.</p> <p>We built Sandboxes to solve for these concerns. Sandboxes give you a dynamic environment to run code in an arbitrary language, safely isolated from the rest of your Modal resources.</p> <h2 id="enough-talk-lets-see-the-code">Enough talk, let’s see the code</h2> <p><!> provide a simple <code>exec</code> API for executing code:</p> <!> <p>LLMs may specify dependencies or need to execute code in other languages. Sandboxes let you configure the execution environment at runtime, using the same <!> API and infrastructure as Functions:</p> <!> <p>You can even <!> for persistence and to fan out search over many Sandboxes:</p> <!> <p>This is just a taste of the Sandbox feature set. Check out the <!> for details on how to <!>, <!>, <!> and more.</p> <h2 id="why-use-modal-sandboxes">Why use Modal Sandboxes</h2> <p>Sandboxes run on the same underlying infrastructure as Functions, meaning you get all the benefits you’re used to with Modal Functions. This means blazing fast cold starts, access to the latest GPUs, global region selection, and more are all available in Sandboxes. As we make our core platform more powerful and reliable, those improvements will play out in both Functions and Sandboxes.</p> <p>The tight integration in our platform also means it’s simple to quickly build features that use both Sandboxes and Functions!</p> <h2 id="customer-stories">Customer stories</h2> <p>We’re proud of the applications our customers are building across a variety of use cases that require secure and scalable code execution.</p> <h3 id="accelerating-agent-benchmarks-with-swe-bench">Accelerating agent benchmarks with SWE-bench</h3> <p><!> is the highest profile benchmark for testing coding agents. It runs LLM-generated code against actual GitHub pull requests to measure model performance at fixing bugs, implementing features, and more.</p> <p>We’ve upstreamed Modal support into SWE-bench for blazing fast evaluations. By adding a simple <code>--modal</code> flag to their run command, researchers can now:</p> <ul><li>Run evaluations entirely in the cloud without any infrastructure setup</li> <li>Execute tests in parallel across hundreds of containers</li> <li><strong>Run the <!> (500 tasks) in only 7 minutes</strong></li></ul> <p>Modal’s built-in image caching follows the same layered approach as SWE-bench’s existing Docker images, allowing for a simple integration process. These evaluation runs could take hours previously; the Modal integration enables a much tighter feedback loop.</p> <center><video controls autoplay loop playsinline=""><source src="https://modal-cdn.com/swe_bench_vid.mp4" type="video/mp4"/></video></center> <h3 id="secure-code-execution-at-quora">Secure code execution at Quora</h3> <p><!> uses Modal Sandboxes to power the code execution in Poe, their AI chat platform. When you ask Poe’s AI-powered bots to write and run code, that code executes safely in Modal Sandboxes. They’re completely isolated, meaning the code is kept separate from both the main Quora infrastructure and any other user’s code.</p> <p>This integration allows Poe to offer interactive coding features while still maintaining strict security. You can experiment with code that the AI suggests without worrying about damaging the platform or exposing any sensitive data.</p> <p><!></p> <p>We’ve done extensive performance testing to make sure we’re future-proofed at any scale that Quora may burst up to. <strong>We’ve tested Sandbox creation throughput up to 1000 Sandboxes per second</strong> - if you need to rapidly scale out code execution, let us know!</p> <h3 id="large-scale-refactors-with-codegen">Large-scale refactors with Codegen</h3> <p><!> is building an AI system for performing large-scale codebase refactors. Their approach involves building a massive in-memory index of the target codebase and giving AI models the ability to execute “codemods” - automated code transformations that implement the desired changes. For example, our own <!> repository looks like this in Codegen:</p> <p><!></p> <p>Modal Sandboxes provide Codegen with two critical capabilities:</p> <ol><li>A reliable environment for building and maintaining their in-memory codebase representations</li> <li>A secure execution environment for running AI-generated codemods with strict isolation</li></ol> <p>This combination of performance and security enables Codegen to confidently apply AI-driven refactoring at scale.</p> <h3 id="ai-workforce-automation-with-relevance-ai">AI workforce automation with Relevance AI</h3> <p><!> is building an AI workforce platform that uses agents to automate complex tasks. They leverage Modal Sandboxes in two key ways:</p> <ol><li>Providing a secure environment for their AI agents to run dynamically generated code</li> <li>Powering their notebook/builder feature where users can write and execute code in a serverless environment</li></ol> <p><!></p> <p>Modal Sandboxes were a perfect fit for Relevance AI because they offer:</p> <ul><li>Flexibility to install any package on demand</li> <li>Full customization of runtime commands</li> <li>Fast cold-boot times for responsive execution</li> <li>Support for any programming language their agents need</li></ul> <p>This combination lets Relevance AI’s agents tackle a wide range of automation tasks while maintaining strict security boundaries between executions.</p> <h2 id="get-started-today">Get started today</h2> <p>Modal Sandboxes are available to all users. Whether you’re building an AI coding assistant, running untrusted user code, or just need a secure environment for code execution, Sandboxes provide the tools you need.</p> <p>To get started:</p> <ol><li>Install Modal: <code>pip install modal</code></li> <li>Create an account: <code>python -m modal setup</code></li> <li>Check out our <!></li></ol> <p>We can’t wait to see what you build!</p>`,3);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=c(s(o),4);f(c(e(p)),{href:`https://modal.com/docs/reference/modal.Function`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Functions`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,10);f(e(m),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandboxes`))},$$slots:{default:!0}}),l(3),n(m);var h=c(m,2);d(h,{code:`import%20modal%0Aapp%20%3D%20modal.App.lookup(%22sandbox-manager%22%2C%20create_if_missing%3DTrue)%0Asb%20%3D%20modal.Sandbox.create(app%3Dapp)%0A%0Ap%20%3D%20sb.exec(%22python%22%2C%20%22-c%22%2C%20%22print('hello')%22)%0Aprint(p.stdout.read())%0Asb.terminate()`,lang:`python`});var g=c(h,2);f(c(e(g)),{href:`https://modal.com/docs/guide/images`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Image`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,2);d(_,{code:`%23%20Get%20requested%20dependencies%20from%20LLM%20and%20use%20them%20to%0A%23%20dynamically%20build%20the%20Sandbox%20image.%0Allm_output%20%3D%20'%7B%20%22requested_packages%22%3A%20%5B%22nodejs%22%2C%20%22php%22%5D%20%7D'%0Apackages%20%3D%20json.loads(llm_output)%5B%22requested_packages%22%5D%0Aimage%20%3D%20modal.Image.debian_slim().apt_install(*packages)%0A%0A%23%20Test%20that%20our%20languages%20work!%0Asb%20%3D%20modal.Sandbox.create(image%3Dimage%2C%20app%3Dapp)%0Ap%20%3D%20sb.exec(%22node%22%2C%20%22-e%22%2C%20'console.log(%22hello%20from%20nodejs%22)')%0Aprint(p.stdout.read())%0Ap%20%3D%20sb.exec(%22php%22%2C%20%22-r%22%2C%20%22echo%20'hello%20from%20php'%3B%22)%0Aprint(p.stdout.read())`,lang:`python`});var v=c(_,2);f(c(e(v)),{href:`https://modal.com/docs/guide/sandbox-snapshots#filesystem-snapshots`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`snapshot your filesystem`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,2);d(y,{code:`sb%20%3D%20modal.Sandbox.create(app%3Dapp)%0Asb.exec(%22bash%22%2C%20%22-c%22%2C%20%22echo%20'data_file'%20%3E%20%2Fdata%22).wait()%0Asnap%20%3D%20sb.snapshot_filesystem()%0A%0A%23%20These%20sandboxes%20will%20all%20have%20%2Fdata%20present%20and%20can%20fan%20out%20to%0A%23%20run%20tests%20over%20many%20different%20states%0Asb2%20%3D%20modal.Sandbox.create(image%3Dsnap%2C%20app%3Dapp)%0Asb3%20%3D%20modal.Sandbox.create(image%3Dsnap%2C%20app%3Dapp)%0Ap2%20%3D%20sb2.exec(%22pytest%22%2C%20%22tests%2Funit%22)%0Ap3%20%3D%20sb3.exec(%22pytest%22%2C%20%22tests%2Fintegration%22)%0Aprint(p2.stdout.read())%0Aprint(p3.stdout.read())`,lang:`python`});var b=c(y,2),x=c(e(b));f(x,{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox docs`))},$$slots:{default:!0}});var S=c(x,2);f(S,{href:`https://modal.com/docs/guide/sandbox-networking#forwarding-ports`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`forward ports`))},$$slots:{default:!0}});var C=c(S,2);f(C,{href:`https://modal.com/docs/guide/sandbox-networking`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`restrict network access`))},$$slots:{default:!0}}),f(c(C,2),{href:`https://modal.com/docs/guide/sandbox-files`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`access files`))},$$slots:{default:!0}}),l(),n(b);var w=c(b,14);f(e(w),{href:`https://github.com/swe-bench/SWE-bench`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SWE-bench`))},$$slots:{default:!0}}),l(),n(w);var E=c(w,4),D=c(e(E),4),O=e(D);f(c(e(O)),{href:`https://openai.com/index/introducing-swe-bench-verified/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Verified benchmark`))},$$slots:{default:!0}}),l(),n(O),n(D),n(E);var k=c(E,4),A=e(k);A.muted=!0,n(k);var j=c(k,4);f(e(j),{href:`https://www.quora.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Quora`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,4);u(e(M),{src:`https://modal-cdn.com/cdnbot/quora_poe_chatc16fpv5o_3be7782a.webp`,alt:`Screenshot of Poe executing code to run a Caesar cipher`}),n(M);var N=c(M,6),P=e(N);f(P,{href:`https://codegen.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Codegen`))},$$slots:{default:!0}}),f(c(P,2),{href:`https://github.com/modal-labs/modal-client`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal-client`))},$$slots:{default:!0}}),l(),n(N);var F=c(N,2);u(e(F),{src:`https://modal-cdn.com/cdnbot/codegen_visualizationtb2yqp1y_d1a8c5bc.webp`,alt:`Visualization of the modal-client repository using Codegen`}),n(F);var I=c(F,10);f(e(I),{href:`https://relevanceai.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Relevance AI`))},$$slots:{default:!0}}),l(),n(I);var L=c(I,4);u(e(L),{src:`https://modal-cdn.com/cdnbot/relevance_notebookejxosnq0_5458ea4b.webp`,alt:`Screenshot of Relevance's notebook feature`}),n(L);var R=c(L,14),z=c(e(R),4);f(c(e(z)),{href:`https://modal.com/docs/guide/sandboxes`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Sandbox documentation`))},$$slots:{default:!0}}),n(z),n(R),l(2),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=BnUOE7Mf.js.map
