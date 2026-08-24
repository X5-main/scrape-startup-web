(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c9a53891-37c2-43e6-a151-81e9c0e47c66`,e._sentryDebugIdIdentifier=`sentry-dbid-c9a53891-37c2-43e6-a151-81e9c0e47c66`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Limitations of AWS Lambda for AI Workloads`,description:`Learn about the features and limitations of AWS Lambda, the most popular serverless platform.`,date:`2025-09-25T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`Serverless`,published:!0,layout:`blog`,toc:[{depth:2,value:`AWS Lambda GPU Support—or Lack Thereof`,id:`aws-lambda-gpu-supportor-lack-thereof`,children:[{depth:3,value:`GPU Support With Modern Serverless Infrastructure`,id:`gpu-support-with-modern-serverless-infrastructure`}]},{depth:2,value:`The High Costs of AWS Lambda`,id:`the-high-costs-of-aws-lambda`,children:[{depth:3,value:`Costs on Modern Serverless Infrastructure`,id:`costs-on-modern-serverless-infrastructure`}]},{depth:2,value:`Why Developers Struggle with AWS Lambda’s Development Experience`,id:`why-developers-struggle-with-aws-lambdas-development-experience`,children:[{depth:3,value:`The Better DX of Modern Serverless Infrastructure`,id:`the-better-dx-of-modern-serverless-infrastructure`}]},{depth:2,value:`AWS Lambda Max Timeout`,id:`aws-lambda-max-timeout`,children:[{depth:3,value:`Longer Timeouts With Modern Serverless Infrastructure`,id:`longer-timeouts-with-modern-serverless-infrastructure`}]},{depth:2,value:`Modern Serverless Platforms Solve AWS Lambda’s Fundamental Limitations`,id:`modern-serverless-platforms-solve-aws-lambdas-fundamental-limitations`}],rawContent:`AWS Lambda is the serverless platform that brought Functions-as-a-Service (FaaS) into the mainstream when it launched in 2014. While not quite the first (that honor goes to PiCloud in 2010), it has become the go-to platform for any developer looking to deploy event-driven functions, simple API endpoints, or lightweight microservices without managing infrastructure.

But try and add ML inference or fine-tuning to that list and you’ll start to see the limitations of the product. AWS Lambda was made for a different time, before GPUs became essential infrastructure for every application and before AI workloads moved from research labs to production APIs.

No GPU support, pricing that penalizes long-running computations, a cumbersome development experience, and execution timeouts that make it unsuitable for many compute-intensive workloads. These are all reasons developers turn away from a platform they have known for over a decade towards new serverless providers that are purpose-built for AI.

## AWS Lambda GPU Support—or Lack Thereof

You might immediately assume that this is due to organizational inertia. "A juggernaut like Amazon can’t innovate fast enough!"

But the reason is deeper than that, and a fundamental limitation within the Lambda architecture.

Lambda uses [Firecracker](https://firecracker-microvm.github.io/) for its virtualization layer. Firecracker was explicitly designed to be minimalist, stripping away everything not essential for running stateless, event-driven workloads. This means no hardware accelerators, no PCIe passthrough capabilities, and, crucially, [no GPU support](https://github.com/firecracker-microvm/firecracker/discussions/4845). And there are no plans to change this as adding GPU support would require fundamental changes to Firecracker's design philosophy.

This leaves Lambda users who need GPU acceleration in an awkward position. Developers must either architect complex workarounds using SageMaker endpoints or Batch jobs, accept the operational overhead of managing EC2 instances, or look beyond AWS entirely.

### GPU Support With Modern Serverless Infrastructure

Modern platforms like Modal solve this by offering [native GPU support](https://modal.com/pricing) across the entire NVIDIA lineup, from T4s for inference to B200s for training. You simply specify the GPU type in a function decorator and Modal handles the rest. No EC2 instances to manage, no complex orchestration. The same serverless experience you expect, now with the compute power AI workloads require.

## The High Costs of AWS Lambda

AWS Lambda's pricing model becomes prohibitive for sustained or compute-intensive workloads.

For every function execution, Lambda charges you:

- $0.0000166667 per GB-second of compute time
- $0.20 per million requests

CPU power is allocated proportionally to memory. A request of 1,769 MB is allocated the equivalent of 1 vCPU.

The first 400,000 GB-seconds and 1 million requests per month are free. Initially, this pay-per-use model looks attractive.

But production workloads blow past these limits quickly. Consider a typical data processing workload: 2 million JSON files per month, where each job needs 10GB of memory and runs for 1 second. On Lambda, this costs $326.87 monthly.

The billing model actively discourages good architectural patterns. Batching work into longer-running functions should reduce overhead, but can increase costs due to per-second billing. Running a function for 5 minutes costs the same whether it processes one item or thousands. Yet you still pay invocation costs for each trigger.

This creates situations where the most cost-effective approach conflicts with clean architecture. Developers find themselves splitting functions unnaturally or avoiding optimizations that would make sense anywhere else.

### Costs on Modern Serverless Infrastructure

If you run this on [Modal](/blog/aws-lambda-price-article), the same workload costs $87.76 after free credits. Modal's unit pricing is significantly cheaper than Lambda's:

- $0.00000222 per GB-second of compute time
- $0.0000131 per CPU-second of compute time (equivalent to 2 vCPU)
- no additional cost per request

The example earlier, which consumes 10GB memory and 2.8 physical cores (using the Lambda vCPU:memory allocation ratio above), costs only $117.76 on Modal before credits, with no per-request charges.

## Why Developers Struggle with AWS Lambda's Development Experience

Lambda's development workflow creates friction at every step.

**AWS Lambda Cold Start Delays Impact User Experience**

[Cold starts add unpredictable latency](https://lumigo.io/blog/this-is-all-you-need-to-know-about-lambda-cold-starts/), from hundreds of milliseconds to several seconds. Python functions with ML dependencies? Ten-second delays are common. The "solutions" aren’t ideal: provisioned concurrency defeats the purpose of serverless, and warming functions with scheduled pings wastes money without guaranteeing performance.

**AWS Lambda package Size Limits Restrict Library Usage**

[Lambda's 250MB deployment limit](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#function-configuration-deployment-and-execution) means popular libraries don't fit. PyTorch alone exceeds the limit (not that you can use CUDA without GPU support).

Container images allow 10GB but this can make cold starts even worse. The layer system caps you at five layers, each under 250MB. Update one shared layer? Redeploy every function that uses it.

![Lambda Layers](https://modal-cdn.com/blog/images/lambda-layers.webp)
<modal-img-caption>
Source: [AWS](https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html)
</modal-img-caption>

**Debugging AWS Lambda Functions Requires Multiple Tools and Deployments**

No SSH. No shell access. [Very limited live debugging](https://aws.amazon.com/blogs/compute/accelerating-local-serverless-development-with-console-to-ide-and-remote-debugging-for-aws-lambda/). Just CloudWatch logs. Local testing tools like [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) approximate Lambda's environment but miss edge cases. Most developers end up deploying to production just to debug basic issues.

**AWS Lambda's Stateless Design Increases Development Complexity**

Every function starts fresh. Models must reload from S3, potentially adding minutes to cold starts. [The \`/tmp\` directory gives you 10GB](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), but it vanishes between invocations. Want to share data between functions? That's another service, more latency, more complexity. Simple workflows become distributed systems problems.

### The Better DX of Modern Serverless Infrastructure

Modal is designed to eliminate these friction points with a developer-first approach. Write normal Python code, add a simple \`@app.function()\` decorator, and test it locally with \`modal run\`. When you're ready to deploy the function, simply use \`modal deploy\` in your CLI.

\`\`\`python
import modal

image = modal.Image.debian_slim().uv_pip_install("numpy")
app = modal.App("my-app")

@app.function(image=image)
def process_data(url):
    import numpy
    # Your normal Python code here
    return results

@app.local_entrypoint()
def main():
    # Run remotely with .remote()
    result = process_data.remote("https://example.com")
    print(result)
\`\`\`

Here's what makes Modal DX significantly better:

- No cloud consoles, config files, separate deployment packages, or layer management. Just \`pip install\` your dependencies in the image definition and attach it to your function—all in your application code.
- No image size limits.
- Under the hood, Modal's custom Rust-based filesystem lazy loads images to drastically reduce cold starts. Even containers with large ML packages boot in [seconds](/blog/speeding-up-container-launches).
- Native distributed file system ([Modal Volumes](/docs/guide/volumes)) that can be easily attached to functions across your environment.
- Native debugging and observability features. Debug with interactive shells using \`modal shell\`. The same code runs locally and in production, with logs streaming to your terminal in real-time. Modal's native dashboards make it much easier to monitor the health of deployed functions, too.

## AWS Lambda Max Timeout

[Lambda's hard 900-second execution limit](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) makes entire categories of workloads impossible.

Video transcoding, model training, large-scale data processing. These tasks need hours, not minutes. A 4K video transcode easily takes 30 minutes. Processing a few gigabytes of complex data hits the wall. [Any function that runs longer than 15 minutes is terminated](https://medium.com/@saurabh.garg013/aws-lambda-function-which-takes-more-than-15-minutes-to-complete-f0a7661ce56e), no exceptions.

If you need to process a million records, you can't iterate through them in one function. Instead, you must fan out to thousands of parallel invocations or chain functions via Step Functions, adding coordination overhead, error handling complexity, and significant cost from extra invocations. [AWS Lambda was designed for "milliseconds to a few minutes" of execution](https://5ly.co/blog/aws-lambda-in-machine-learning/), forcing you to reshape your problem to fit the constraint.

### Longer Timeouts With Modern Serverless Infrastructure

Modal functions can [run for up to 24 hours](https://modal.com/docs/guide/timeouts), with configurable timeouts from 1 second to 86,400 seconds. This removes the need for complex orchestration patterns:

\`\`\`python
import modal
import time

app = modal.App("long-running-tasks")

@app.function(timeout=3600)  # 1 hour timeout
def process_video(video_url):
    # This would fail on Lambda after 15 minutes
    time.sleep(1800)  # 30 minutes of processing
    return "processed_video.mp4"

@app.function(timeout=86400)  # 24 hour timeout
def train_model(dataset):
    # Run training for hours without orchestration
    for epoch in range(100):
        train_epoch(dataset)
    return model

\`\`\`

Your video transcoding, model training, or batch processing job can run as a single function. If you need even longer execution, Modal supports checkpointing for resumable jobs. The platform was built for AI workloads, not just simple webhook handlers.

## Modern Serverless Platforms Solve AWS Lambda's Fundamental Limitations

AWS Lambda revolutionized serverless computing, but it's stuck in 2014. No GPU support means no AI workloads. The pricing model punishes longer, compute-intensive tasks. The developer experience remains painful with cold starts, package limits, and debugging headaches. The 15-minute timeout makes real computing jobs impossible.

These aren't edge cases anymore. Modern applications involve GPU inference, large dataset processing, and complex workflows. Lambda forces you to architect around its limitations rather than solving your actual problems.

Platforms like Modal demonstrate what serverless should be: GPU-native, built for long-running tasks, with a developer experience that just works. Developers don’t want to cram workloads into Lambda's constraints anymore. They want platforms that adapt to the requirements of new technologies.

Try it out in our [Playground](/playground) or [sign up](/signup) to deploy your first function.
`,meta:{description:`Learn about the features and limitations of AWS Lambda, the most popular serverless platform.`}},{title:h,description:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=m,E=t(`The <code>/tmp</code> directory gives you 10GB`,1),D=t(`<p>AWS Lambda is the serverless platform that brought Functions-as-a-Service (FaaS) into the mainstream when it launched in 2014. While not quite the first (that honor goes to PiCloud in 2010), it has become the go-to platform for any developer looking to deploy event-driven functions, simple API endpoints, or lightweight microservices without managing infrastructure.</p> <p>But try and add ML inference or fine-tuning to that list and you’ll start to see the limitations of the product. AWS Lambda was made for a different time, before GPUs became essential infrastructure for every application and before AI workloads moved from research labs to production APIs.</p> <p>No GPU support, pricing that penalizes long-running computations, a cumbersome development experience, and execution timeouts that make it unsuitable for many compute-intensive workloads. These are all reasons developers turn away from a platform they have known for over a decade towards new serverless providers that are purpose-built for AI.</p> <h2 id="aws-lambda-gpu-supportor-lack-thereof">AWS Lambda GPU Support—or Lack Thereof</h2> <p>You might immediately assume that this is due to organizational inertia. “A juggernaut like Amazon can’t innovate fast enough!”</p> <p>But the reason is deeper than that, and a fundamental limitation within the Lambda architecture.</p> <p>Lambda uses <!> for its virtualization layer. Firecracker was explicitly designed to be minimalist, stripping away everything not essential for running stateless, event-driven workloads. This means no hardware accelerators, no PCIe passthrough capabilities, and, crucially, <!>. And there are no plans to change this as adding GPU support would require fundamental changes to Firecracker’s design philosophy.</p> <p>This leaves Lambda users who need GPU acceleration in an awkward position. Developers must either architect complex workarounds using SageMaker endpoints or Batch jobs, accept the operational overhead of managing EC2 instances, or look beyond AWS entirely.</p> <h3 id="gpu-support-with-modern-serverless-infrastructure">GPU Support With Modern Serverless Infrastructure</h3> <p>Modern platforms like Modal solve this by offering <!> across the entire NVIDIA lineup, from T4s for inference to B200s for training. You simply specify the GPU type in a function decorator and Modal handles the rest. No EC2 instances to manage, no complex orchestration. The same serverless experience you expect, now with the compute power AI workloads require.</p> <h2 id="the-high-costs-of-aws-lambda">The High Costs of AWS Lambda</h2> <p>AWS Lambda’s pricing model becomes prohibitive for sustained or compute-intensive workloads.</p> <p>For every function execution, Lambda charges you:</p> <ul><li>$0.0000166667 per GB-second of compute time</li> <li>$0.20 per million requests</li></ul> <p>CPU power is allocated proportionally to memory. A request of 1,769 MB is allocated the equivalent of 1 vCPU.</p> <p>The first 400,000 GB-seconds and 1 million requests per month are free. Initially, this pay-per-use model looks attractive.</p> <p>But production workloads blow past these limits quickly. Consider a typical data processing workload: 2 million JSON files per month, where each job needs 10GB of memory and runs for 1 second. On Lambda, this costs $326.87 monthly.</p> <p>The billing model actively discourages good architectural patterns. Batching work into longer-running functions should reduce overhead, but can increase costs due to per-second billing. Running a function for 5 minutes costs the same whether it processes one item or thousands. Yet you still pay invocation costs for each trigger.</p> <p>This creates situations where the most cost-effective approach conflicts with clean architecture. Developers find themselves splitting functions unnaturally or avoiding optimizations that would make sense anywhere else.</p> <h3 id="costs-on-modern-serverless-infrastructure">Costs on Modern Serverless Infrastructure</h3> <p>If you run this on <!>, the same workload costs $87.76 after free credits. Modal’s unit pricing is significantly cheaper than Lambda’s:</p> <ul><li>$0.00000222 per GB-second of compute time</li> <li>$0.0000131 per CPU-second of compute time (equivalent to 2 vCPU)</li> <li>no additional cost per request</li></ul> <p>The example earlier, which consumes 10GB memory and 2.8 physical cores (using the Lambda vCPU:memory allocation ratio above), costs only $117.76 on Modal before credits, with no per-request charges.</p> <h2 id="why-developers-struggle-with-aws-lambdas-development-experience">Why Developers Struggle with AWS Lambda’s Development Experience</h2> <p>Lambda’s development workflow creates friction at every step.</p> <p><strong>AWS Lambda Cold Start Delays Impact User Experience</strong></p> <p><!>, from hundreds of milliseconds to several seconds. Python functions with ML dependencies? Ten-second delays are common. The “solutions” aren’t ideal: provisioned concurrency defeats the purpose of serverless, and warming functions with scheduled pings wastes money without guaranteeing performance.</p> <p><strong>AWS Lambda package Size Limits Restrict Library Usage</strong></p> <p><!> means popular libraries don’t fit. PyTorch alone exceeds the limit (not that you can use CUDA without GPU support).</p> <p>Container images allow 10GB but this can make cold starts even worse. The layer system caps you at five layers, each under 250MB. Update one shared layer? Redeploy every function that uses it.</p> <p><!> <modal-img-caption>Source: <!></modal-img-caption></p> <p><strong>Debugging AWS Lambda Functions Requires Multiple Tools and Deployments</strong></p> <p>No SSH. No shell access. <!>. Just CloudWatch logs. Local testing tools like <!> approximate Lambda’s environment but miss edge cases. Most developers end up deploying to production just to debug basic issues.</p> <p><strong>AWS Lambda’s Stateless Design Increases Development Complexity</strong></p> <p>Every function starts fresh. Models must reload from S3, potentially adding minutes to cold starts. <!>, but it vanishes between invocations. Want to share data between functions? That’s another service, more latency, more complexity. Simple workflows become distributed systems problems.</p> <h3 id="the-better-dx-of-modern-serverless-infrastructure">The Better DX of Modern Serverless Infrastructure</h3> <p>Modal is designed to eliminate these friction points with a developer-first approach. Write normal Python code, add a simple <code>@app.function()</code> decorator, and test it locally with <code>modal run</code>. When you’re ready to deploy the function, simply use <code>modal deploy</code> in your CLI.</p> <!> <p>Here’s what makes Modal DX significantly better:</p> <ul><li>No cloud consoles, config files, separate deployment packages, or layer management. Just <code>pip install</code> your dependencies in the image definition and attach it to your function—all in your application code.</li> <li>No image size limits.</li> <li>Under the hood, Modal’s custom Rust-based filesystem lazy loads images to drastically reduce cold starts. Even containers with large ML packages boot in <!>.</li> <li>Native distributed file system (<!>) that can be easily attached to functions across your environment.</li> <li>Native debugging and observability features. Debug with interactive shells using <code>modal shell</code>. The same code runs locally and in production, with logs streaming to your terminal in real-time. Modal’s native dashboards make it much easier to monitor the health of deployed functions, too.</li></ul> <h2 id="aws-lambda-max-timeout">AWS Lambda Max Timeout</h2> <p><!> makes entire categories of workloads impossible.</p> <p>Video transcoding, model training, large-scale data processing. These tasks need hours, not minutes. A 4K video transcode easily takes 30 minutes. Processing a few gigabytes of complex data hits the wall. <!>, no exceptions.</p> <p>If you need to process a million records, you can’t iterate through them in one function. Instead, you must fan out to thousands of parallel invocations or chain functions via Step Functions, adding coordination overhead, error handling complexity, and significant cost from extra invocations. <!>, forcing you to reshape your problem to fit the constraint.</p> <h3 id="longer-timeouts-with-modern-serverless-infrastructure">Longer Timeouts With Modern Serverless Infrastructure</h3> <p>Modal functions can <!>, with configurable timeouts from 1 second to 86,400 seconds. This removes the need for complex orchestration patterns:</p> <!> <p>Your video transcoding, model training, or batch processing job can run as a single function. If you need even longer execution, Modal supports checkpointing for resumable jobs. The platform was built for AI workloads, not just simple webhook handlers.</p> <h2 id="modern-serverless-platforms-solve-aws-lambdas-fundamental-limitations">Modern Serverless Platforms Solve AWS Lambda’s Fundamental Limitations</h2> <p>AWS Lambda revolutionized serverless computing, but it’s stuck in 2014. No GPU support means no AI workloads. The pricing model punishes longer, compute-intensive tasks. The developer experience remains painful with cold starts, package limits, and debugging headaches. The 15-minute timeout makes real computing jobs impossible.</p> <p>These aren’t edge cases anymore. Modern applications involve GPU inference, large dataset processing, and complex workflows. Lambda forces you to architect around its limitations rather than solving your actual problems.</p> <p>Platforms like Modal demonstrate what serverless should be: GPU-native, built for long-running tasks, with a developer experience that just works. Developers don’t want to cram workloads into Lambda’s constraints anymore. They want platforms that adapt to the requirements of new technologies.</p> <p>Try it out in our <!> or <!> to deploy your first function.</p>`,3);function O(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=D(),p=c(s(o),12),m=c(e(p));f(m,{href:`https://firecracker-microvm.github.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Firecracker`))},$$slots:{default:!0}}),f(c(m,2),{href:`https://github.com/firecracker-microvm/firecracker/discussions/4845`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`no GPU support`))},$$slots:{default:!0}}),l(),n(p);var h=c(p,6);f(c(e(h)),{href:`https://modal.com/pricing`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`native GPU support`))},$$slots:{default:!0}}),l(),n(h);var g=c(h,22);f(c(e(g)),{href:`/blog/aws-lambda-price-article`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,12);f(e(_),{href:`https://lumigo.io/blog/this-is-all-you-need-to-know-about-lambda-cold-starts/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Cold starts add unpredictable latency`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,4);f(e(v),{href:`https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html#function-configuration-deployment-and-execution`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lambda’s 250MB deployment limit`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4),b=e(y);u(b,{src:`https://modal-cdn.com/blog/images/lambda-layers.webp`,alt:`Lambda Layers`});var x=c(b,2);f(c(e(x)),{href:`https://docs.aws.amazon.com/lambda/latest/dg/chapter-layers.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS`))},$$slots:{default:!0}}),n(x),n(y);var S=c(y,4),C=c(e(S));f(C,{href:`https://aws.amazon.com/blogs/compute/accelerating-local-serverless-development-with-console-to-ide-and-remote-debugging-for-aws-lambda/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Very limited live debugging`))},$$slots:{default:!0}}),f(c(C,2),{href:`https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`SAM CLI`))},$$slots:{default:!0}}),l(),n(S);var w=c(S,4);f(c(e(w)),{href:`https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html`,rel:`nofollow`,children:(e,t)=>{l();var n=E();l(2),i(e,n)},$$slots:{default:!0}}),l(),n(w);var T=c(w,6);d(T,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().uv_pip_install(%22numpy%22)%0Aapp%20%3D%20modal.App(%22my-app%22)%0A%0A%40app.function(image%3Dimage)%0Adef%20process_data(url)%3A%0A%20%20%20%20import%20numpy%0A%20%20%20%20%23%20Your%20normal%20Python%20code%20here%0A%20%20%20%20return%20results%0A%0A%40app.local_entrypoint()%0Adef%20main()%3A%0A%20%20%20%20%23%20Run%20remotely%20with%20.remote()%0A%20%20%20%20result%20%3D%20process_data.remote(%22https%3A%2F%2Fexample.com%22)%0A%20%20%20%20print(result)`,lang:`python`});var O=c(T,4),k=c(e(O),4);f(c(e(k)),{href:`/blog/speeding-up-container-launches`,children:(e,t)=>{l(),i(e,r(`seconds`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);f(c(e(A)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Modal Volumes`))},$$slots:{default:!0}}),l(),n(A),l(2),n(O);var j=c(O,4);f(e(j),{href:`https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Lambda’s hard 900-second execution limit`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);f(c(e(M)),{href:`https://medium.com/@saurabh.garg013/aws-lambda-function-which-takes-more-than-15-minutes-to-complete-f0a7661ce56e`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Any function that runs longer than 15 minutes is terminated`))},$$slots:{default:!0}}),l(),n(M);var N=c(M,2);f(c(e(N)),{href:`https://5ly.co/blog/aws-lambda-in-machine-learning/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AWS Lambda was designed for “milliseconds to a few minutes” of execution`))},$$slots:{default:!0}}),l(),n(N);var P=c(N,4);f(c(e(P)),{href:`https://modal.com/docs/guide/timeouts`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`run for up to 24 hours`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,2);d(F,{code:`import%20modal%0Aimport%20time%0A%0Aapp%20%3D%20modal.App(%22long-running-tasks%22)%0A%0A%40app.function(timeout%3D3600)%20%20%23%201%20hour%20timeout%0Adef%20process_video(video_url)%3A%0A%20%20%20%20%23%20This%20would%20fail%20on%20Lambda%20after%2015%20minutes%0A%20%20%20%20time.sleep(1800)%20%20%23%2030%20minutes%20of%20processing%0A%20%20%20%20return%20%22processed_video.mp4%22%0A%0A%40app.function(timeout%3D86400)%20%20%23%2024%20hour%20timeout%0Adef%20train_model(dataset)%3A%0A%20%20%20%20%23%20Run%20training%20for%20hours%20without%20orchestration%0A%20%20%20%20for%20epoch%20in%20range(100)%3A%0A%20%20%20%20%20%20%20%20train_epoch(dataset)%0A%20%20%20%20return%20model%0A`,lang:`python`});var I=c(F,12),L=c(e(I));f(L,{href:`/playground`,children:(e,t)=>{l(),i(e,r(`Playground`))},$$slots:{default:!0}}),f(c(L,2),{href:`/signup`,children:(e,t)=>{l(),i(e,r(`sign up`))},$$slots:{default:!0}}),l(),n(I),i(t,o)},$$slots:{default:!0}}))}export{O as default,m as metadata};
//# sourceMappingURL=CCvrne7B2.js.map
