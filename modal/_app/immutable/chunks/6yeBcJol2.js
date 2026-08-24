(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`715772da-d8ab-4778-94c4-3157a8d99338`,e._sentryDebugIdIdentifier=`sentry-dbid-715772da-d8ab-4778-94c4-3157a8d99338`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Llama3-405B: How to run an extra large open source LLM on Modal`,description:`Learn how to run Llama3-405B on Modal with this step-by-step guide.`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2024-09-15T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`LLMs`,published:!0,layout:`blog`,toc:[{depth:2,value:`Memory Requirements and Optimization`,id:`memory-requirements-and-optimization`},{depth:2,value:`Prerequisites`,id:`prerequisites`},{depth:2,value:`Running Llama3-405B`,id:`running-llama3-405b`,children:[{depth:3,value:`1. Downloading the Model (download.py)`,id:`1-downloading-the-model-downloadpy`},{depth:3,value:`2. Setting Up the vLLM Server (api.py)`,id:`2-setting-up-the-vllm-server-apipy`},{depth:3,value:`3. Interacting with the Model (client.py)`,id:`3-interacting-with-the-model-clientpy`}]},{depth:2,value:`Smaller versions of Llama3`,id:`smaller-versions-of-llama3`}],rawContent:`Meta's [Llama3-405B](https://huggingface.co/meta-llama/Meta-Llama-3.1-405B) represents a new frontier in open-source large language models, offering capabilities that rival top closed-source AI models. However, due to its size and computational requirements, it can be daunting to run.

This guide will walk you through the process of setting up and running Llama3-405B using [vLLM](https://github.com/vllm-project/vllm) on Modal, a serverless cloud computing platform. **For the full code, you can view the [gist](https://gist.github.com/charlesfrye/fd595d21e2d483cb71ace23bde6430c0)**.

## Memory Requirements and Optimization

Running Llama3-405B is resource-intensive, but there are some optimizations to make it more accessible:

**VRAM Requirements:** In the normal "half-precision" (FP16), the model would require over 800GB of VRAM just to load.

**8-bit Quantization:** In our code, we are using the 8-bit quantized model, which significantly reduces the VRAM footprint.

**Multi-GPU Setup:** In our example, we're distributing the model across 8 A100 GPUs with 80GB each, totaling 640GB of VRAM.

**System Memory:** The setup requires 336GB of system memory to handle data loading and processing.

## Prerequisites

Before we begin, ensure you have the following:

1. Create an account at [modal.com](https://modal.com)
2. Install the Modal Python package by running:
   \`\`\`
   pip install modal
   \`\`\`
3. Authenticate your Modal account by running:
   \`\`\`
   modal setup
   \`\`\`
   If this doesn't work, try:
   \`\`\`
   python -m modal setup
   \`\`\`

## Running Llama3-405B

To run Llama3-405B, you'll need to use three separate files from the [provided gist](https://gist.github.com/charlesfrye/fd595d21e2d483cb71ace23bde6430c0). Here's how to use each one:

### 1. Downloading the Model (download.py)

First, you need to download the model weights to a Modal volume:

1. Save the \`download.py\` script from the gist to your local directory.
2. Run the command: \`modal run download.py\`

This process may take about 30 minutes. It downloads the model weights and stores them in a Modal volume for faster access in subsequent runs.

### 2. Setting Up the vLLM Server (api.py)

Once the model is downloaded, you need to set up the vLLM server:

1. Save the \`api.py\` script from the gist to your local directory.
2. Run the command: \`modal deploy api.py\`

This command deploys an OpenAI-compatible API server on Modal's infrastructure. It sets up the necessary GPU resources and serves the model through an API.

### 3. Interacting with the Model (client.py)

Finally, you can interact with the model using the provided client script:

1. Save the \`client.py\` script from the gist to your local directory.
2. Run the script with: \`python client.py\`

This script allows you to send requests to the vLLM server and receive responses. It offers several options for customization:

- \`--model\`: Specify a model name (optional, defaults to the first available model)
- \`--api-key\`: Set the API key for authentication (default is "super-secret-token")
- \`--max-tokens\`, \`--temperature\`, \`--top-p\`, etc.: Adjust various generation parameters
- \`--prompt\`: Provide a custom prompt (default is a limerick about baboons and raccoons)
- \`--system-prompt\`: Set a custom system prompt
- \`--no-stream\`: Disable streaming of response chunks
- \`--chat\`: Enable interactive chat mode

For example, to start an interactive chat session with a custom system prompt, you could use:

\`\`\`
python client.py --chat --system-prompt "You are a helpful AI assistant."
\`\`\`

## Smaller versions of Llama3

If you want to run smaller versions of Llama3 on Modal, see:

- [How to run Llama3-8B on Modal](/blog/how-to-run-llama-3-1-8b-instruct-on-modal)
- [How to run Llama3-70B on Modal](/blog/how-to-run-llama-3-1-70b-instruct-on-modal)
`,meta:{description:`Learn how to run Llama3-405B on Modal with this step-by-step guide.`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p>Meta’s <!> represents a new frontier in open-source large language models, offering capabilities that rival top closed-source AI models. However, due to its size and computational requirements, it can be daunting to run.</p> <p>This guide will walk you through the process of setting up and running Llama3-405B using <!> on Modal, a serverless cloud computing platform. <strong>For the full code, you can view the <!></strong>.</p> <h2 id="memory-requirements-and-optimization">Memory Requirements and Optimization</h2> <p>Running Llama3-405B is resource-intensive, but there are some optimizations to make it more accessible:</p> <p><strong>VRAM Requirements:</strong> In the normal “half-precision” (FP16), the model would require over 800GB of VRAM just to load.</p> <p><strong>8-bit Quantization:</strong> In our code, we are using the 8-bit quantized model, which significantly reduces the VRAM footprint.</p> <p><strong>Multi-GPU Setup:</strong> In our example, we’re distributing the model across 8 A100 GPUs with 80GB each, totaling 640GB of VRAM.</p> <p><strong>System Memory:</strong> The setup requires 336GB of system memory to handle data loading and processing.</p> <h2 id="prerequisites">Prerequisites</h2> <p>Before we begin, ensure you have the following:</p> <ol><li>Create an account at <!></li> <li>Install the Modal Python package by running: <!></li> <li>Authenticate your Modal account by running: <!> If this doesn’t work, try: <!></li></ol> <h2 id="running-llama3-405b">Running Llama3-405B</h2> <p>To run Llama3-405B, you’ll need to use three separate files from the <!>. Here’s how to use each one:</p> <h3 id="1-downloading-the-model-downloadpy">1. Downloading the Model (download.py)</h3> <p>First, you need to download the model weights to a Modal volume:</p> <ol><li>Save the <code>download.py</code> script from the gist to your local directory.</li> <li>Run the command: <code>modal run download.py</code></li></ol> <p>This process may take about 30 minutes. It downloads the model weights and stores them in a Modal volume for faster access in subsequent runs.</p> <h3 id="2-setting-up-the-vllm-server-apipy">2. Setting Up the vLLM Server (api.py)</h3> <p>Once the model is downloaded, you need to set up the vLLM server:</p> <ol><li>Save the <code>api.py</code> script from the gist to your local directory.</li> <li>Run the command: <code>modal deploy api.py</code></li></ol> <p>This command deploys an OpenAI-compatible API server on Modal’s infrastructure. It sets up the necessary GPU resources and serves the model through an API.</p> <h3 id="3-interacting-with-the-model-clientpy">3. Interacting with the Model (client.py)</h3> <p>Finally, you can interact with the model using the provided client script:</p> <ol><li>Save the <code>client.py</code> script from the gist to your local directory.</li> <li>Run the script with: <code>python client.py</code></li></ol> <p>This script allows you to send requests to the vLLM server and receive responses. It offers several options for customization:</p> <ul><li><code>--model</code>: Specify a model name (optional, defaults to the first available model)</li> <li><code>--api-key</code>: Set the API key for authentication (default is “super-secret-token”)</li> <li><code>--max-tokens</code>, <code>--temperature</code>, <code>--top-p</code>, etc.: Adjust various generation parameters</li> <li><code>--prompt</code>: Provide a custom prompt (default is a limerick about baboons and raccoons)</li> <li><code>--system-prompt</code>: Set a custom system prompt</li> <li><code>--no-stream</code>: Disable streaming of response chunks</li> <li><code>--chat</code>: Enable interactive chat mode</li></ul> <p>For example, to start an interactive chat session with a custom system prompt, you could use:</p> <!> <h2 id="smaller-versions-of-llama3">Smaller versions of Llama3</h2> <p>If you want to run smaller versions of Llama3 on Modal, see:</p> <ul><li><!></li> <li><!></li></ul>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=s(o);d(c(e(f)),{href:`https://huggingface.co/meta-llama/Meta-Llama-3.1-405B`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Llama3-405B`))},$$slots:{default:!0}}),l(),n(f);var p=c(f,2),m=c(e(p));d(m,{href:`https://github.com/vllm-project/vllm`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`vLLM`))},$$slots:{default:!0}});var h=c(m,2);d(c(e(h)),{href:`https://gist.github.com/charlesfrye/fd595d21e2d483cb71ace23bde6430c0`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`gist`))},$$slots:{default:!0}}),n(h),l(),n(p);var g=c(p,18),_=e(g);d(c(e(_)),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`modal.com`))},$$slots:{default:!0}}),n(_);var v=c(_,2);u(c(e(v)),{code:`pip%20install%20modal`,lang:`text`}),n(v);var y=c(v,2),b=c(e(y));u(b,{code:`modal%20setup`,lang:`text`}),u(c(b,2),{code:`python%20-m%20modal%20setup`,lang:`text`}),n(y),n(g);var x=c(g,4);d(c(e(x)),{href:`https://gist.github.com/charlesfrye/fd595d21e2d483cb71ace23bde6430c0`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`provided gist`))},$$slots:{default:!0}}),l(),n(x);var S=c(x,30);u(S,{code:`python%20client.py%20--chat%20--system-prompt%20%22You%20are%20a%20helpful%20AI%20assistant.%22`,lang:`text`});var C=c(S,6),w=e(C);d(e(w),{href:`/blog/how-to-run-llama-3-1-8b-instruct-on-modal`,children:(e,t)=>{l(),i(e,r(`How to run Llama3-8B on Modal`))},$$slots:{default:!0}}),n(w);var T=c(w,2);d(e(T),{href:`/blog/how-to-run-llama-3-1-70b-instruct-on-modal`,children:(e,t)=>{l(),i(e,r(`How to run Llama3-70B on Modal`))},$$slots:{default:!0}}),n(T),n(C),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=6yeBcJol2.js.map
