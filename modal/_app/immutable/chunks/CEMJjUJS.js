(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`eae8acde-a718-4339-81bb-da6354c2fc91`,e._sentryDebugIdIdentifier=`sentry-dbid-eae8acde-a718-4339-81bb-da6354c2fc91`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./JPsrybyr.js";import{t as d}from"./BILrvr3I.js";import{t as f}from"./DeWGVqas2.js";import{t as p}from"./CdZDxCfO2.js";var m={title:`Launch a chatbot that runs inference on Modal using the Vercel AI SDK`,description:`How to build a chatbot running open source models on Modal with a Vercel AI SDK and AI Elements frontend.`,date:`2025-12-16T12:00:00.000Z`,length:`5 minute read`,category:`Article`,published:!0,layout:`blog`,toc:[{depth:1,value:`Setup`,id:`setup`},{depth:1,value:`1. Deploy the Qwen 3 8B model on Modal`,id:`1-deploy-the-qwen-3-8b-model-on-modal`},{depth:1,value:`2. Connect a Next.js app to Modal with the Vercel AI SDK`,id:`2-connect-a-nextjs-app-to-modal-with-the-vercel-ai-sdk`},{depth:1,value:`3. Add a chat UI with Vercel’s AI Elements`,id:`3-add-a-chat-ui-with-vercels-ai-elements`}],rawContent:`Building a full-stack chatbot powered by Qwen 3 8B, Modal, and Vercel’s [AI SDK](https://ai-sdk.dev) requires just three steps:

1. Deploy the Qwen 3 8B model on Modal

2. Connect a Next.js app to Modal with the AI SDK

3. Add a chat UI with Vercel's [AI Elements](https://ai-sdk.dev/elements)

In five minutes, this chatbot with its swanky UI will be running on the web:

<center>
  <video class="rounded-xl" controls autoplay loop muted playsinline>
    <source src="https://modal-cdn.com/blog/videos/deploy-qwen-chatbot-vercel-demo-video.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</center>

# Setup

Let's start with some project scaffolding:

\`\`\`bash
mkdir -p my-chatbot/backend
cd my-chatbot/backend
\`\`\`

# 1. Deploy the Qwen 3 8B model on Modal

In the Modal examples, there is a great tutorial for [deploying the Qwen 3 8B on Modal](https://modal.com/docs/examples/vllm_inference). I stole that exact code to write this backend, so I recommend taking a look at the [tutorial](https://modal.com/docs/examples/vllm_inference) for a technical explanation.

In short, this code runs a vLLM server in OpenAI-compatible mode so that downstream clients and tools that know how to use the OpenAI API can interact with the server.

Since we’re on a time crunch, paste the following code in a python file named \`vllm-inference.py\`.

\`\`\`python
import json
from typing import Any

import aiohttp
import modal

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.8.0-devel-ubuntu22.04", add_python="3.12")
    .entrypoint([])
    .uv_pip_install(
        "vllm==0.11.2",
        "huggingface-hub==0.36.0",
        "flashinfer-python==0.5.2",
    )
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})  # faster model transfers
)

MODEL_NAME = "Qwen/Qwen3-8B-FP8"
MODEL_REVISION = "220b46e3b2180893580a4454f21f22d3ebb187d3"  # avoid nasty surprises when repos update!

hf_cache_vol = modal.Volume.from_name("huggingface-cache", create_if_missing=True)

vllm_cache_vol = modal.Volume.from_name("vllm-cache", create_if_missing=True)

FAST_BOOT = True

app = modal.App("example-vllm-inference")

N_GPU = 1
MINUTES = 60  # seconds
VLLM_PORT = 8000

@app.function(
    image=vllm_image,
    gpu=f"H100:{N_GPU}",
    scaledown_window=15 * MINUTES,  # how long should we stay up with no requests?
    timeout=10 * MINUTES,  # how long should we wait for container start?
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
@modal.concurrent(  # how many requests can one replica handle? tune carefully!
    max_inputs=32
)
@modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
def serve():
    import subprocess

    cmd = [
        "vllm",
        "serve",
        "--uvicorn-log-level=info",
        MODEL_NAME,
        "--revision",
        MODEL_REVISION,
        "--served-model-name",
        MODEL_NAME,
        "llm",
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

    subprocess.Popen(" ".join(cmd), shell=True)
\`\`\`

Now to deploy the API on Modal, make sure \`uv\` and Modal are installed and set up before running the Modal deploy command.

To install \`uv\`, run:

\`\`\`bash
wget -qO- https://astral.sh/uv/install.sh | sh
\`\`\`

To install and setup Modal, run:

\`\`\`bash
uvx modal setup
\`\`\`

Now, to deploy the API on Modal, run:

\`\`\`bash
uvx modal deploy vllm-inference.py
\`\`\`

Once your code is deployed, you’ll see a URL appear in the command line, something like \`https://your-workspace-name--example-vllm-inference-serve.modal.run\`.

![Terminal Deploy Screen](https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-terminal-deploy.png)

You can also find the URL on your Modal dashboard:

<img
  src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-url-dashboard.png"
  alt="Modal Dashboard Function Calls"
  class="rounded-xl"
/>

In the next step, we’ll work on connecting a Next.js app to Modal using the [OpenAI Compatible Provider](https://ai-sdk.dev/providers/openai-compatible-providers#openai-compatible-providers) integration path in the AI SDK.

# 2. Connect a Next.js app to Modal with the Vercel AI SDK

Now on to the frontend! Start by creating a Next.js app using the defaults. If needed, [install node and npm first](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

\`\`\`bash
cd ..
npx create-next-app@latest frontend
cd ./frontend
\`\`\`

Then install the [OpenAI Compatible provider](https://ai-sdk.dev/providers/openai-compatible-providers#openai-compatible-providers) from the AI SDK, which we will use to connect to the Qwen 3 8B model running on Modal:

\`\`\`bash
npm install ai @ai-sdk/openai-compatible
\`\`\`

In the \`app\` folder, create a \`/chat\` route by creating an \`app/api/chat/route.ts\` file (note that \`route.ts\` lives in a few nested folders!). Then paste the following code:

\`\`\`jsx
import { NextRequest } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { wrapLanguageModel, extractReasoningMiddleware } from 'ai';

export const modalProvider = createOpenAICompatible({
    name: 'modal',
    baseURL: 'https://YOUR-MODAL-WORKSPACE--example-vllm-inference-serve.modal.run/v1',
  });

export const modalReasoningModel = wrapLanguageModel({
  model: modalProvider('Qwen/Qwen3-8B-FP8'),
  middleware: [
    extractReasoningMiddleware({
      tagName: 'think',
      separator: '\\n\\n',
    }),
  ],
});

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = await streamText({
    model: modalReasoningModel,
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
\`\`\`

Make sure to to change the parameters in the \`baseURL\` to match the URL output from the command line in the earlier step. It should look something like \`https://your-workspace-name--example-vllm-inference-serve.modal.run\`. We want to access the \`/v1\` endpoint.

# 3. Add a chat UI with Vercel's AI Elements

Then, using [AI Elements](https://vercel.com/changelog/introducing-ai-elements), we can use out-of-the-box UI elements to create a chat interface.

Start with installing AI Elements and the AI SDK Dependencies:

\`\`\`bash
npx ai-elements@latest
npm install @ai-sdk/react zod
\`\`\`

Replace the code in \`app/page.tsx\` with the code in [this Github Gist](https://gist.github.com/feliciachang/125d5b8e91c58f50e3770a63186d70b3). It's a long piece of code that provides a complete chat UI using AI Elements and sends user messages to the \`/api/chat\` endpoint. Most of it comes directly from the Next.js [chatbot tutorial](https://ai-sdk.dev/elements/examples/chatbot).

Now, you can play with a fully-fledged chatbot running the Qwen 3 8B model by running the following command:

\`\`\`bash
npm run dev
\`\`\`

<img
  src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-chat-ui.png"
  alt="Chat UI"
  class="rounded-xl"
/>

In the [Modal dashboard](/apps), you can see that your queries trigger function calls:

<img
  src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-function-calls.png"
  alt="Modal Dashboard Function Calls"
  class="rounded-xl"
/>

For next steps, check out [snapshotting GPU memory to speed up cold starts](https://modal.com/docs/examples/ministral3_inference) on Modal. For questions, join our [Slack Community](/slack).
`,meta:{title:`Setup`,description:`How to build a chatbot running open source models on Modal with a Vercel AI SDK and AI Elements frontend.`}},{title:h,description:g,date:_,length:v,category:y,published:b,layout:x,toc:S,rawContent:C,meta:w}=m,T=t(`<p>Building a full-stack chatbot powered by Qwen 3 8B, Modal, and Vercel’s <!> requires just three steps:</p> <ol><li><p>Deploy the Qwen 3 8B model on Modal</p></li> <li><p>Connect a Next.js app to Modal with the AI SDK</p></li> <li><p>Add a chat UI with Vercel’s <!></p></li></ol> <p>In five minutes, this chatbot with its swanky UI will be running on the web:</p> <center><video class="rounded-xl" controls autoplay loop playsinline=""><source src="https://modal-cdn.com/blog/videos/deploy-qwen-chatbot-vercel-demo-video.mp4" type="video/mp4"/> Your browser does not support the video tag.</video></center> <h1 id="setup">Setup</h1> <p>Let’s start with some project scaffolding:</p> <!> <h1 id="1-deploy-the-qwen-3-8b-model-on-modal">1. Deploy the Qwen 3 8B model on Modal</h1> <p>In the Modal examples, there is a great tutorial for <!>. I stole that exact code to write this backend, so I recommend taking a look at the <!> for a technical explanation.</p> <p>In short, this code runs a vLLM server in OpenAI-compatible mode so that downstream clients and tools that know how to use the OpenAI API can interact with the server.</p> <p>Since we’re on a time crunch, paste the following code in a python file named <code>vllm-inference.py</code>.</p> <!> <p>Now to deploy the API on Modal, make sure <code>uv</code> and Modal are installed and set up before running the Modal deploy command.</p> <p>To install <code>uv</code>, run:</p> <!> <p>To install and setup Modal, run:</p> <!> <p>Now, to deploy the API on Modal, run:</p> <!> <p>Once your code is deployed, you’ll see a URL appear in the command line, something like <code>https://your-workspace-name--example-vllm-inference-serve.modal.run</code>.</p> <p><!></p> <p>You can also find the URL on your Modal dashboard:</p> <img src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-url-dashboard.png" alt="Modal Dashboard Function Calls" class="rounded-xl"/> <p>In the next step, we’ll work on connecting a Next.js app to Modal using the <!> integration path in the AI SDK.</p> <h1 id="2-connect-a-nextjs-app-to-modal-with-the-vercel-ai-sdk">2. Connect a Next.js app to Modal with the Vercel AI SDK</h1> <p>Now on to the frontend! Start by creating a Next.js app using the defaults. If needed, <!>.</p> <!> <p>Then install the <!> from the AI SDK, which we will use to connect to the Qwen 3 8B model running on Modal:</p> <!> <p>In the <code>app</code> folder, create a <code>/chat</code> route by creating an <code>app/api/chat/route.ts</code> file (note that <code>route.ts</code> lives in a few nested folders!). Then paste the following code:</p> <!> <p>Make sure to to change the parameters in the <code>baseURL</code> to match the URL output from the command line in the earlier step. It should look something like <code>https://your-workspace-name--example-vllm-inference-serve.modal.run</code>. We want to access the <code>/v1</code> endpoint.</p> <h1 id="3-add-a-chat-ui-with-vercels-ai-elements">3. Add a chat UI with Vercel’s AI Elements</h1> <p>Then, using <!>, we can use out-of-the-box UI elements to create a chat interface.</p> <p>Start with installing AI Elements and the AI SDK Dependencies:</p> <!> <p>Replace the code in <code>app/page.tsx</code> with the code in <!>. It’s a long piece of code that provides a complete chat UI using AI Elements and sends user messages to the <code>/api/chat</code> endpoint. Most of it comes directly from the Next.js <!>.</p> <p>Now, you can play with a fully-fledged chatbot running the Qwen 3 8B model by running the following command:</p> <!> <img src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-chat-ui.png" alt="Chat UI" class="rounded-xl"/> <p>In the <!>, you can see that your queries trigger function calls:</p> <img src="https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-function-calls.png" alt="Modal Dashboard Function Calls" class="rounded-xl"/> <p>For next steps, check out <!> on Modal. For questions, join our <!>.</p>`,3);function E(t,h){let g=a(h,[`children`,`$$slots`,`$$events`,`$$legacy`]);p(t,o(()=>g,()=>m,{children:(t,a)=>{var o=T(),p=s(o);f(c(e(p)),{href:`https://ai-sdk.dev`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AI SDK`))},$$slots:{default:!0}}),l(),n(p);var m=c(p,2),h=c(e(m),4),g=e(h);f(c(e(g)),{href:`https://ai-sdk.dev/elements`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AI Elements`))},$$slots:{default:!0}}),n(g),n(h),n(m);var _=c(m,4),v=e(_);v.muted=!0,n(_);var y=c(_,6);d(y,{code:`mkdir%20-p%20my-chatbot%2Fbackend%0Acd%20my-chatbot%2Fbackend`,lang:`bash`});var b=c(y,4),x=c(e(b));f(x,{href:`https://modal.com/docs/examples/vllm_inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`deploying the Qwen 3 8B on Modal`))},$$slots:{default:!0}}),f(c(x,2),{href:`https://modal.com/docs/examples/vllm_inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`tutorial`))},$$slots:{default:!0}}),l(),n(b);var S=c(b,6);d(S,{code:`import%20json%0Afrom%20typing%20import%20Any%0A%0Aimport%20aiohttp%0Aimport%20modal%0A%0Avllm_image%20%3D%20(%0A%20%20%20%20modal.Image.from_registry(%22nvidia%2Fcuda%3A12.8.0-devel-ubuntu22.04%22%2C%20add_python%3D%223.12%22)%0A%20%20%20%20.entrypoint(%5B%5D)%0A%20%20%20%20.uv_pip_install(%0A%20%20%20%20%20%20%20%20%22vllm%3D%3D0.11.2%22%2C%0A%20%20%20%20%20%20%20%20%22huggingface-hub%3D%3D0.36.0%22%2C%0A%20%20%20%20%20%20%20%20%22flashinfer-python%3D%3D0.5.2%22%2C%0A%20%20%20%20)%0A%20%20%20%20.env(%7B%22HF_XET_HIGH_PERFORMANCE%22%3A%20%221%22%7D)%20%20%23%20faster%20model%20transfers%0A)%0A%0AMODEL_NAME%20%3D%20%22Qwen%2FQwen3-8B-FP8%22%0AMODEL_REVISION%20%3D%20%22220b46e3b2180893580a4454f21f22d3ebb187d3%22%20%20%23%20avoid%20nasty%20surprises%20when%20repos%20update!%0A%0Ahf_cache_vol%20%3D%20modal.Volume.from_name(%22huggingface-cache%22%2C%20create_if_missing%3DTrue)%0A%0Avllm_cache_vol%20%3D%20modal.Volume.from_name(%22vllm-cache%22%2C%20create_if_missing%3DTrue)%0A%0AFAST_BOOT%20%3D%20True%0A%0Aapp%20%3D%20modal.App(%22example-vllm-inference%22)%0A%0AN_GPU%20%3D%201%0AMINUTES%20%3D%2060%20%20%23%20seconds%0AVLLM_PORT%20%3D%208000%0A%0A%40app.function(%0A%20%20%20%20image%3Dvllm_image%2C%0A%20%20%20%20gpu%3Df%22H100%3A%7BN_GPU%7D%22%2C%0A%20%20%20%20scaledown_window%3D15%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20stay%20up%20with%20no%20requests%3F%0A%20%20%20%20timeout%3D10%20*%20MINUTES%2C%20%20%23%20how%20long%20should%20we%20wait%20for%20container%20start%3F%0A%20%20%20%20volumes%3D%7B%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fhuggingface%22%3A%20hf_cache_vol%2C%0A%20%20%20%20%20%20%20%20%22%2Froot%2F.cache%2Fvllm%22%3A%20vllm_cache_vol%2C%0A%20%20%20%20%7D%2C%0A)%0A%40modal.concurrent(%20%20%23%20how%20many%20requests%20can%20one%20replica%20handle%3F%20tune%20carefully!%0A%20%20%20%20max_inputs%3D32%0A)%0A%40modal.web_server(port%3DVLLM_PORT%2C%20startup_timeout%3D10%20*%20MINUTES)%0Adef%20serve()%3A%0A%20%20%20%20import%20subprocess%0A%0A%20%20%20%20cmd%20%3D%20%5B%0A%20%20%20%20%20%20%20%20%22vllm%22%2C%0A%20%20%20%20%20%20%20%20%22serve%22%2C%0A%20%20%20%20%20%20%20%20%22--uvicorn-log-level%3Dinfo%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22--revision%22%2C%0A%20%20%20%20%20%20%20%20MODEL_REVISION%2C%0A%20%20%20%20%20%20%20%20%22--served-model-name%22%2C%0A%20%20%20%20%20%20%20%20MODEL_NAME%2C%0A%20%20%20%20%20%20%20%20%22llm%22%2C%0A%20%20%20%20%20%20%20%20%22--host%22%2C%0A%20%20%20%20%20%20%20%20%220.0.0.0%22%2C%0A%20%20%20%20%20%20%20%20%22--port%22%2C%0A%20%20%20%20%20%20%20%20str(VLLM_PORT)%2C%0A%20%20%20%20%5D%0A%0A%20%20%20%20%23%20enforce-eager%20disables%20both%20Torch%20compilation%20and%20CUDA%20graph%20capture%0A%20%20%20%20%23%20default%20is%20no-enforce-eager.%20see%20the%20--compilation-config%20flag%20for%20tighter%20control%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--enforce-eager%22%20if%20FAST_BOOT%20else%20%22--no-enforce-eager%22%5D%0A%0A%20%20%20%20%23%20assume%20multiple%20GPUs%20are%20for%20splitting%20up%20large%20matrix%20multiplications%0A%20%20%20%20cmd%20%2B%3D%20%5B%22--tensor-parallel-size%22%2C%20str(N_GPU)%5D%0A%0A%20%20%20%20print(cmd)%0A%0A%20%20%20%20subprocess.Popen(%22%20%22.join(cmd)%2C%20shell%3DTrue)`,lang:`python`});var C=c(S,6);d(C,{code:`wget%20-qO-%20https%3A%2F%2Fastral.sh%2Fuv%2Finstall.sh%20%7C%20sh`,lang:`bash`});var w=c(C,4);d(w,{code:`uvx%20modal%20setup`,lang:`bash`});var E=c(w,4);d(E,{code:`uvx%20modal%20deploy%20vllm-inference.py`,lang:`bash`});var D=c(E,4);u(e(D),{src:`https://modal-cdn.com/blog/images/deploy-qwen-chatbot-vercel-terminal-deploy.png`,alt:`Terminal Deploy Screen`}),n(D);var O=c(D,6);f(c(e(O)),{href:`https://ai-sdk.dev/providers/openai-compatible-providers#openai-compatible-providers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenAI Compatible Provider`))},$$slots:{default:!0}}),l(),n(O);var k=c(O,4);f(c(e(k)),{href:`https://docs.npmjs.com/downloading-and-installing-node-js-and-npm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`install node and npm first`))},$$slots:{default:!0}}),l(),n(k);var A=c(k,2);d(A,{code:`cd%20..%0Anpx%20create-next-app%40latest%20frontend%0Acd%20.%2Ffrontend`,lang:`bash`});var j=c(A,2);f(c(e(j)),{href:`https://ai-sdk.dev/providers/openai-compatible-providers#openai-compatible-providers`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`OpenAI Compatible provider`))},$$slots:{default:!0}}),l(),n(j);var M=c(j,2);d(M,{code:`npm%20install%20ai%20%40ai-sdk%2Fopenai-compatible`,lang:`bash`});var N=c(M,4);d(N,{code:`import%20%7B%20NextRequest%20%7D%20from%20'next%2Fserver'%3B%0Aimport%20%7B%20streamText%2C%20convertToModelMessages%2C%20type%20UIMessage%20%7D%20from%20'ai'%3B%0Aimport%20%7B%20createOpenAICompatible%20%7D%20from%20'%40ai-sdk%2Fopenai-compatible'%3B%0Aimport%20%7B%20wrapLanguageModel%2C%20extractReasoningMiddleware%20%7D%20from%20'ai'%3B%0A%0Aexport%20const%20modalProvider%20%3D%20createOpenAICompatible(%7B%0A%20%20%20%20name%3A%20'modal'%2C%0A%20%20%20%20baseURL%3A%20'https%3A%2F%2FYOUR-MODAL-WORKSPACE--example-vllm-inference-serve.modal.run%2Fv1'%2C%0A%20%20%7D)%3B%0A%0Aexport%20const%20modalReasoningModel%20%3D%20wrapLanguageModel(%7B%0A%20%20model%3A%20modalProvider('Qwen%2FQwen3-8B-FP8')%2C%0A%20%20middleware%3A%20%5B%0A%20%20%20%20extractReasoningMiddleware(%7B%0A%20%20%20%20%20%20tagName%3A%20'think'%2C%0A%20%20%20%20%20%20separator%3A%20'%5Cn%5Cn'%2C%0A%20%20%20%20%7D)%2C%0A%20%20%5D%2C%0A%7D)%3B%0A%0Aexport%20async%20function%20POST(req%3A%20NextRequest)%20%7B%0A%20%20const%20%7B%20messages%20%7D%3A%20%7B%20messages%3A%20UIMessage%5B%5D%20%7D%20%3D%20await%20req.json()%3B%0A%0A%20%20const%20result%20%3D%20await%20streamText(%7B%0A%20%20%20%20model%3A%20modalReasoningModel%2C%0A%20%20%20%20messages%3A%20convertToModelMessages(messages)%2C%0A%20%20%7D)%3B%0A%0A%20%20return%20result.toUIMessageStreamResponse()%3B%0A%7D`,lang:`jsx`});var P=c(N,6);f(c(e(P)),{href:`https://vercel.com/changelog/introducing-ai-elements`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`AI Elements`))},$$slots:{default:!0}}),l(),n(P);var F=c(P,4);d(F,{code:`npx%20ai-elements%40latest%0Anpm%20install%20%40ai-sdk%2Freact%20zod`,lang:`bash`});var I=c(F,2),L=c(e(I),3);f(L,{href:`https://gist.github.com/feliciachang/125d5b8e91c58f50e3770a63186d70b3`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`this Github Gist`))},$$slots:{default:!0}}),f(c(L,4),{href:`https://ai-sdk.dev/elements/examples/chatbot`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`chatbot tutorial`))},$$slots:{default:!0}}),l(),n(I);var R=c(I,4);d(R,{code:`npm%20run%20dev`,lang:`bash`});var z=c(R,4);f(c(e(z)),{href:`/apps`,children:(e,t)=>{l(),i(e,r(`Modal dashboard`))},$$slots:{default:!0}}),l(),n(z);var B=c(z,4),V=c(e(B));f(V,{href:`https://modal.com/docs/examples/ministral3_inference`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`snapshotting GPU memory to speed up cold starts`))},$$slots:{default:!0}}),f(c(V,2),{href:`/slack`,children:(e,t)=>{l(),i(e,r(`Slack Community`))},$$slots:{default:!0}}),l(),n(B),i(t,o)},$$slots:{default:!0}}))}export{E as default,m as metadata};
//# sourceMappingURL=CEMJjUJS.js.map
