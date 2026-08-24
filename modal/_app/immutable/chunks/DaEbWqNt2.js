(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`f0d5eb55-7812-490d-9f6b-f2b090e86736`,e._sentryDebugIdIdentifier=`sentry-dbid-f0d5eb55-7812-490d-9f6b-f2b090e86736`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./DBIL8FrF.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`How to deploy vLLM`,description:`A step by step tutorial of deploying vLLM, a popular open-source LLM inference engine, on GPUs in the cloud.`,date:`2025-11-03T12:00:00.000Z`,length:`6 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`What is vLLM?`,id:`what-is-vllm`,children:[{depth:3,value:`What does the “v” in vLLM stand for?`,id:`what-does-the-v-in-vllm-stand-for`}]},{depth:2,value:`What do you need to deploy vLLM?`,id:`what-do-you-need-to-deploy-vllm`,children:[{depth:3,value:`Why use Modal for deployment?`,id:`why-use-modal-for-deployment`}]},{depth:2,value:`Quickstart`,id:`quickstart`},{depth:2,value:`How to deploy vLLM and Qwen3-8B in minutes`,id:`how-to-deploy-vllm-and-qwen3-8b-in-minutes`,children:[{depth:3,value:`Step 1: Create a Modal Image`,id:`step-1-create-a-modal-image`},{depth:3,value:`Step 2: Download and cache Qwen3-8B model weights`,id:`step-2-download-and-cache-qwen3-8b-model-weights`},{depth:3,value:`Step 3: Configuring vLLM`,id:`step-3-configuring-vllm`},{depth:3,value:`Step 4: Define the vLLM inference Server`,id:`step-4-define-the-vllm-inference-server`},{depth:3,value:`Step 5: Deploy it & invoke it`,id:`step-5-deploy-it--invoke-it`}]},{depth:2,value:`Get started today`,id:`get-started-today`}],rawContent:`Large models are increasingly used for modern applications, but serving them efficiently remains a challenge. **vLLM**, a high-performance open-source inference engine, was designed to solve this.

Whether you are building a chat interface, captioning system, or reasoning engine, vLLM gives you production-grade performance without closed-source dependencies. By the end of this tutorial, you will have a self-contained, serverless vLLM deployment ready to power your own AI applications.

For the easiest path to high-performance LLM inference serving, see [Modal Endpoints](/docs/guide/endpoints). Endpoints provide an easier on-ramp when you want managed serving without writing deployment code. This tutorial walks through deploying vLLM yourself when you need full control over the stack.

## What is vLLM?

[vLLM](https://github.com/vllm-project/vllm) is an open-source library for running large language models (LLMs) quickly and efficiently. This means it takes a trained model and makes it available to respond to requests. vLLM is one of three popular open-source LLM inference engines, the other two being SGLang and TensorRT-LLM. All are built on top of CUDA. If you want to learn more about how to choose an LLM inference engine for your use case, check out our [LLM Engineer’s Almanac](/llm-almanac/summary).

### What does the "v" in vLLM stand for?

Originally, the “v” stood for **virtual**, reflecting the project’s goal to make large models lightweight and deployable. Today, vLLM is increasingly associated with **Vision + Language** models — systems that can interpret both images and text (e.g., captioning tools or visual question-answering systems).

## What do you need to deploy vLLM?

Deploying vLLM requires careful orchestration. You need a GPU-enabled environment (hardware that can accelerate large matrix operations), a container with all the right dependencies preinstalled, and a way to manage massive model weights so you’re not redownloading them for every request. On top of that, you need an API layer to accept user input, return responses, and handle errors gracefully. Most importantly, you must ensure that the system scales seamlessly while keeping startup and inference latency low.

### Why use Modal for deployment?

Modal handles much of this heavy lifting for you. Modal consists of a Python SDK that wraps an ultra-fast container stack and multi-cloud GPU pool. It abstracts away container management, GPU scheduling, and autoscaling, letting you focus on customizing your model and serving logic.

In the next section, we will walk through how to deploy vLLM on Modal.

## Quickstart

If you haven’t set up Modal already:

\`\`\`
pip install modal
modal setup
\`\`\`

Then, clone and run our examples repo:

\`\`\`
git clone https://github.com/modal-labs/modal-examples
cd modal-examples
modal run 06_gpu_and_ml/llm-serving/vllm_inference.py
\`\`\`

For a step by step walkthrough of this example, keep reading.

## How to deploy vLLM and Qwen3-8B in minutes

Modal makes it easy to deploy open-source models on powerful GPUs. If you don’t have a Modal account, follow the two-line setup instructions in the Quickstart above. You get $30 of GPU credits every month, so following this tutorial will be entirely free.

### Step 1: Create a Modal Image

To serve vLLM, you need a [container image](/docs/guide/images)—a packaged environment that includes Python, CUDA (NVIDIA’s GPU acceleration toolkit), and all the model dependencies. Modal’s SDK makes image definition easy, since you can define all your requirements in-line with your application code.

This code pulls a base NVIDIA CUDA image and layers on the dependencies required for vLLM inference: PyTorch, FlashInfer, and Hugging Face Hub. The environment variable speeds up model downloads using Hugging Face’s optimized transfer utility.

\`\`\`python
import subprocess

import modal

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.8.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .uv_pip_install(
        "vllm==0.10.2",
        "huggingface_hub[hf_transfer]==0.35.0",
        "flashinfer-python==0.3.1",
        "torch==2.8.0",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})  # faster model transfers
)
\`\`\`

### Step 2: Download and cache Qwen3-8B model weights

Next, let’s grab the LLM we want to serve. In this tutorial, we’ll use **Qwen/Qwen3-8B-FP8**, a quantized eight-billion-parameter model trained for reasoning and general text understanding. The “FP8” variant uses 8-bit floating-point precision—a compact numerical format that saves GPU memory without major accuracy loss.

\`\`\`python
MODEL_NAME = "Qwen/Qwen3-8B-FP8"
MODEL_REVISION = "220b46e3b2180893580a4454f21f22d3ebb187d3"  # avoid nasty surprises when repos update!
\`\`\`

To reduce startup latency, we cache model weights and compiled artifacts. Modal provides [Volumes](/docs/guide/volumes), which are persistent network-attached filesystems. These caches prevent repeated downloads or recompilations whenever you start a new Server replica.

\`\`\`python
hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

\`\`\`

### Step 3: Configuring vLLM

vLLM supports JIT compilation (just-in-time kernel optimization) and CUDA graph capture, both of which speed up inference after startup. However, enabling them increases initialization time, otherwise known as a [cold start](/docs/guide/cold-start). The \`FAST_BOOT\` flag controls this trade-off.

\`\`\`
FAST_BOOT = True
\`\`\`

If your service frequently scales from zero, keep this set to \`True\` for faster launches. If you expect consistent traffic and replicas remain warm, set it to \`False\` to unlock full performance.

### Step 4: Define the vLLM inference Server

Now let’s declare a **Modal app** that runs vLLM as a [Modal Server](/docs/guide/servers). Note that Servers include [authentication](/docs/guide/webhook-proxy-auth) by default and may return [503 Service Unavailable](/docs/guide/servers) responses while the backing process is still becoming ready.

- In the Server decorator, we attach the image from step 1, an H100 GPU, and the Volumes with model weights and compiled artifacts.
- The \`target_concurrency\` argument configures how many requests one replica can handle at once before Modal scales up replicas.
- The \`routing_region\` argument selects the geographic proxy region.
- The \`unauthenticated=True\` argument makes the endpoint public.
- The lifecycle methods start the vLLM process when a container boots and terminate it when Modal shuts the container down.

Here, \`subprocess.Popen\` launches \`vllm serve\` as a background process inside your container. When the model finishes loading, it begins accepting requests.

\`\`\`python
app = modal.App("example-vllm-inference")

N_GPU = 1
MINUTES = 60  # seconds
VLLM_PORT = 8000
ROUTING_REGION = "us-east"

@app.server(
    image=vllm_image,
    gpu=f"H100:{N_GPU}",
    scaledown_window=900,  # how long should we stay up with no requests?
    startup_timeout=10 * MINUTES,  # how long should we wait for container start?
    target_concurrency=32,  # how many requests can one replica handle? tune carefully!
    port=VLLM_PORT,
    routing_region=ROUTING_REGION,
    unauthenticated=True,
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
class Server:
    @modal.enter()
    def startup(self) -> None:
        cmd = [
            "vllm",
            "serve",
            "--uvicorn-log-level=info",
            MODEL_NAME,
            "--revision",
            MODEL_REVISION,
            "--served-model-name",
            MODEL_NAME,
            "--host",
            "0.0.0.0",
            "--port",
            str(VLLM_PORT),
        ]

        # enforce-eager disables both Torch compilation and CUDA graph capture
        # default is no-enforce-eager. see the --compilation-config flag for tighter control
        cmd += ["--enforce-eager" if FAST_BOOT else "--no-enforce-eager"]

        # assume multiple GPUs are for splitting up large matrix multiplications
        cmd += ["--tensor-parallel-size", str(N_GPU)]

        print(cmd)

        self.process = subprocess.Popen(cmd)

    @modal.exit()
    def stop(self) -> None:
        self.process.terminate()
\`\`\`

### Step 5: Deploy it & invoke it

Finally, deploy your app with one line in your terminal:

\`\`\`bash
modal deploy vllm_inference.py
\`\`\`

Modal builds the image the first time you deploy, and this image is cached for future deployments. Once the deployment is complete, you’ll see a live URL printed out that looks like this: \`https://your-workspace-name--example-vllm-inference-server.us-east.modal.direct\`.

That’s it! You now have a fully functioning vLLM inference server. It's scalable, GPU-powered, and ready to integrate into any application.

## Get started today

For a more detailed walkthrough of this example, including some code to test the server programatically, check out the [full writeup](/docs/examples/vllm_inference) in our docs.

Ready to build with vLLM or deploy any AI model?\xA0[Sign up for Modal](/signup)\xA0and get $30 in free credits. Whether you’re running open-source models or your own custom models, Modal gives you instant access to thousands of GPUs, from T4s to B200s. No waiting for quota, configuring Kubernetes, or wasting money on idle costs—just fluid GPU compute you can attach to your inference code.

<Cta primary large href="/signup" target="_blank">
  Deploy vLLM
</Cta>
`,meta:{description:`A step by step tutorial of deploying vLLM, a popular open-source LLM inference engine, on GPUs in the cloud.`}},{title:h,description:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=m,E=t(`<p>Large models are increasingly used for modern applications, but serving them efficiently remains a challenge. <strong>vLLM</strong>, a high-performance open-source inference engine, was designed to solve this.</p> <p>Whether you are building a chat interface, captioning system, or reasoning engine, vLLM gives you production-grade performance without closed-source dependencies. By the end of this tutorial, you will have a self-contained, serverless vLLM deployment ready to power your own AI applications.</p> <p>For the easiest path to high-performance LLM inference serving, see <!>. Endpoints provide an easier on-ramp when you want managed serving without writing deployment code. This tutorial walks through deploying vLLM yourself when you need full control over the stack.</p> <h2 id="what-is-vllm">What is vLLM?</h2> <p><!> is an open-source library for running large language models (LLMs) quickly and efficiently. This means it takes a trained model and makes it available to respond to requests. vLLM is one of three popular open-source LLM inference engines, the other two being SGLang and TensorRT-LLM. All are built on top of CUDA. If you want to learn more about how to choose an LLM inference engine for your use case, check out our <!>.</p> <h3 id="what-does-the-v-in-vllm-stand-for">What does the “v” in vLLM stand for?</h3> <p>Originally, the “v” stood for <strong>virtual</strong>, reflecting the project’s goal to make large models lightweight and deployable. Today, vLLM is increasingly associated with <strong>Vision + Language</strong> models — systems that can interpret both images and text (e.g., captioning tools or visual question-answering systems).</p> <h2 id="what-do-you-need-to-deploy-vllm">What do you need to deploy vLLM?</h2> <p>Deploying vLLM requires careful orchestration. You need a GPU-enabled environment (hardware that can accelerate large matrix operations), a container with all the right dependencies preinstalled, and a way to manage massive model weights so you’re not redownloading them for every request. On top of that, you need an API layer to accept user input, return responses, and handle errors gracefully. Most importantly, you must ensure that the system scales seamlessly while keeping startup and inference latency low.</p> <h3 id="why-use-modal-for-deployment">Why use Modal for deployment?</h3> <p>Modal handles much of this heavy lifting for you. Modal consists of a Python SDK that wraps an ultra-fast container stack and multi-cloud GPU pool. It abstracts away container management, GPU scheduling, and autoscaling, letting you focus on customizing your model and serving logic.</p> <p>In the next section, we will walk through how to deploy vLLM on Modal.</p> <h2 id="quickstart">Quickstart</h2> <p>If you haven’t set up Modal already:</p> <!> <p>Then, clone and run our examples repo:</p> <!> <p>For a step by step walkthrough of this example, keep reading.</p> <h2 id="how-to-deploy-vllm-and-qwen3-8b-in-minutes">How to deploy vLLM and Qwen3-8B in minutes</h2> <p>Modal makes it easy to deploy open-source models on powerful GPUs. If you don’t have a Modal account, follow the two-line setup instructions in the Quickstart above. You get $30 of GPU credits every month, so following this tutorial will be entirely free.</p> <h3 id="step-1-create-a-modal-image">Step 1: Create a Modal Image</h3> <p>To serve vLLM, you need a <!>—a packaged environment that includes Python, CUDA (NVIDIA’s GPU acceleration toolkit), and all the model dependencies. Modal’s SDK makes image definition easy, since you can define all your requirements in-line with your application code.</p> <p>This code pulls a base NVIDIA CUDA image and layers on the dependencies required for vLLM inference: PyTorch, FlashInfer, and Hugging Face Hub. The environment variable speeds up model downloads using Hugging Face’s optimized transfer utility.</p> <!> <h3 id="step-2-download-and-cache-qwen3-8b-model-weights">Step 2: Download and cache Qwen3-8B model weights</h3> <p>Next, let’s grab the LLM we want to serve. In this tutorial, we’ll use <strong>Qwen/Qwen3-8B-FP8</strong>, a quantized eight-billion-parameter model trained for reasoning and general text understanding. The “FP8” variant uses 8-bit floating-point precision—a compact numerical format that saves GPU memory without major accuracy loss.</p> <!> <p>To reduce startup latency, we cache model weights and compiled artifacts. Modal provides <!>, which are persistent network-attached filesystems. These caches prevent repeated downloads or recompilations whenever you start a new Server replica.</p> <!> <h3 id="step-3-configuring-vllm">Step 3: Configuring vLLM</h3> <p>vLLM supports JIT compilation (just-in-time kernel optimization) and CUDA graph capture, both of which speed up inference after startup. However, enabling them increases initialization time, otherwise known as a <!>. The <code>FAST_BOOT</code> flag controls this trade-off.</p> <!> <p>If your service frequently scales from zero, keep this set to <code>True</code> for faster launches. If you expect consistent traffic and replicas remain warm, set it to <code>False</code> to unlock full performance.</p> <h3 id="step-4-define-the-vllm-inference-server">Step 4: Define the vLLM inference Server</h3> <p>Now let’s declare a <strong>Modal app</strong> that runs vLLM as a <!>. Note that Servers include <!> by default and may return <!> responses while the backing process is still becoming ready.</p> <ul><li>In the Server decorator, we attach the image from step 1, an H100 GPU, and the Volumes with model weights and compiled artifacts.</li> <li>The <code>target_concurrency</code> argument configures how many requests one replica can handle at once before Modal scales up replicas.</li> <li>The <code>routing_region</code> argument selects the geographic proxy region.</li> <li>The <code>unauthenticated=True</code> argument makes the endpoint public.</li> <li>The lifecycle methods start the vLLM process when a container boots and terminate it when Modal shuts the container down.</li></ul> <p>Here, <code>subprocess.Popen</code> launches <code>vllm serve</code> as a background process inside your container. When the model finishes loading, it begins accepting requests.</p> <!> <h3 id="step-5-deploy-it--invoke-it">Step 5: Deploy it & invoke it</h3> <p>Finally, deploy your app with one line in your terminal:</p> <!> <p>Modal builds the image the first time you deploy, and this image is cached for future deployments. Once the deployment is complete, you’ll see a live URL printed out that looks like this: <code>https://your-workspace-name--example-vllm-inference-server.us-east.modal.direct</code>.</p> <p>That’s it! You now have a fully functioning vLLM inference server. It’s scalable, GPU-powered, and ready to integrate into any application.</p> <h2 id="get-started-today">Get started today</h2> <p>For a more detailed walkthrough of this example, including some code to test the server programatically, check out the <!> in our docs.</p> <p>Ready to build with vLLM or deploy any AI model?\xA0<!>\xA0and get $30 in free credits. Whether you’re running open-source models or your own custom models, Modal gives you instant access to thousands of GPUs, from T4s to B200s. No waiting for quota, configuring Kubernetes, or wasting money on idle costs—just fluid GPU compute you can attach to your inference code.</p> <!>`,1);function D(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=E(),p=c(s(o),4);d(c(e(p)),{href:`/docs/guide/endpoints`,children:(e,t)=>{l(),i(e,r(`Modal Endpoints`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,4),h=e(m);d(h,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}}),d(c(h,2),{href:`/llm-almanac/summary`,children:(e,t)=>{l(),i(e,r(`LLM Engineer’s Almanac`))},$$slots:{default:!0}}),l(),n(m);var g=c(m,20);u(g,{code:`pip%20install%20modal%0Amodal%20setup`,lang:`text`});var _=c(g,4);u(_,{code:`git%20clone%20https%3A%2F%2Fgithub.com%2Fmodal-labs%2Fmodal-examples%0Acd%20modal-examples%0Amodal%20run%2006_gpu_and_ml%2Fllm-serving%2Fvllm_inference.py`,lang:`text`});var v=c(_,10);d(c(e(v)),{href:`/docs/guide/images`,children:(e,t)=>{l(),i(e,r(`container image`))},$$slots:{default:!0}}),l(),n(v);var y=c(v,4);u(y,{code:`import%20subprocess%0A%0Aimport%20modal%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.8.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22vllm%3D%3D0.10.2%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface_hub%5Bhf_transfer%5D%3D%3D0.35.0%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer-python%3D%3D0.3.1%22%2C%0A%20%20%20%20%20%20%20%20%22torch%3D%3D2.8.0%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_HUB_ENABLE_HF_TRANSFER%22%3A%20%221%22%7D)%20%20%23%20faster%20model%20transfers%0A)`,lang:`python`});var b=c(y,6);u(b,{code:`MODEL_NAME%20%3D%20%22Qwen%2FQwen3-8B-FP8%22%0AMODEL_REVISION%20%3D%20%22220b46e3b2180893580a4454f21f22d3ebb187d3%22%20%20%23%20avoid%20nasty%20surprises%20when%20repos%20update!`,lang:`python`});var x=c(b,2);d(c(e(x)),{href:`/docs/guide/volumes`,children:(e,t)=>{l(),i(e,r(`Volumes`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,2);u(S,{code:`hf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0Avllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A`,lang:`python`});var C=c(S,4);d(c(e(C)),{href:`/docs/guide/cold-start`,children:(e,t)=>{l(),i(e,r(`cold start`))},$$slots:{default:!0}}),l(3),n(C);var w=c(C,2);u(w,{code:`FAST_BOOT%20%3D%20True`,lang:`text`});var T=c(w,6),D=c(e(T),3);d(D,{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`Modal Server`))},$$slots:{default:!0}});var O=c(D,2);d(O,{href:`/docs/guide/webhook-proxy-auth`,children:(e,t)=>{l(),i(e,r(`authentication`))},$$slots:{default:!0}}),d(c(O,2),{href:`/docs/guide/servers`,children:(e,t)=>{l(),i(e,r(`503 Service Unavailable`))},$$slots:{default:!0}}),l(),n(T);var k=c(T,6);u(k,{code:`app%20%3D%20modal.App(%22example-vllm-inference%22)%0A%0AN_GPU%20%3D%201%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AVLLM_PORT%20%3D%208000%0AROUTING_REGION%20%3D%20%22us-east%22%0A%0A%40app.server(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3Df%22H100%3A%7BN_GPU%7D%22%2C%0A%20%20%20%20scaledown_window%3D900%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20startup_timeout%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20target_concurrency%3D32%2C%20%20%23%20how%20many%20requests%20can%20one%20replica%20handle%3F%20tune%20carefully!%0A%20%20%20%20port%3DVLLM_PORT%2C%0A%20%20%20%20routing_region%3DROUTING_REGION%2C%0A%20%20%20%20unauthenticated%3DTrue%2C%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A)%0Aclass%20Server%3A%0A%20%20%20%20%40modal.enter()%0A%20%20%20%20def%20startup(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--uvicorn-log-level%3Dinfo%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%20%20%20%20%5D%0A%0A%20%20%20%20%20%20%20%20%23%20enforce-eager%20disables%20both%20Torch%20compilation%20and%20CUDA%20graph%20capture%0A%20%20%20%20%20%20%20%20%23%20default%20is%20no-enforce-eager.%20see%20the%20--compilation-config%20flag%20for%20tighter%20control%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%22--enforce-eager%22%20if%20FAST_BOOT%20else%20%22--no-enforce-eager%22%5D%0A%0A%20%20%20%20%20%20%20%20%23%20assume%20multiple%20GPUs%20are%20for%20splitting%20up%20large%20matrix%20multiplications%0A%20%20%20%20%20%20%20%20cmd%20%2B%3D%20%5B%22--tensor-parallel-size%22%2C%20str(N_GPU)%5D%0A%0A%20%20%20%20%20%20%20%20print(cmd)%0A%0A%20%20%20%20%20%20%20%20self.process%20%3D%20subprocess.Popen(cmd)%0A%0A%20%20%20%20%40modal.exit()%0A%20%20%20%20def%20stop(self)%20-%3E%20None%3A%0A%20%20%20%20%20%20%20%20self.process.terminate()`,lang:`python`});var A=c(k,6);u(A,{code:`modal%20deploy%20vllm_inference.py`,lang:`bash`});var j=c(A,8);d(c(e(j)),{href:`/docs/examples/vllm_inference`,children:(e,t)=>{l(),i(e,r(`full writeup`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);d(c(e(M)),{href:`/signup`,children:(e,t)=>{l(),i(e,r(`Sign up for Modal`))},$$slots:{default:!0}}),l(),n(M),f(c(M,2),{primary:!0,large:!0,href:`/signup`,target:`_blank`,children:(e,t)=>{l(),i(e,r(`Deploy vLLM`))},$$slots:{default:!0}}),i(t,o)},$$slots:{default:!0}}))}export{D as default,m as metadata};
//# sourceMappingURL=DaEbWqNt2.js.map
