(function(){try{var e=typeof window<`u`?window:typeof global<`u`?global:typeof globalThis<`u`?globalThis:typeof self<`u`?self:{};e.SENTRY_RELEASE={id:`f99fcf9f0a844cc9bd13fdc8e5782b84`};var t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]=`c9fc69b6-ea52-41f9-bd3e-73fddacf8907`,e._sentryDebugIdIdentifier=`sentry-dbid-c9fc69b6-ea52-41f9-bd3e-73fddacf8907`)}catch{}})();import{$t as e,St as t,Tn as n,Tt as r,bt as i,c as a,d as o,en as s,tn as c,wn as l}from"./F_ixKBiO.js";import"./B1sc9Zdx.js";import"./Bb2deiU3.js";import{t as u}from"./BILrvr3I.js";import{t as d}from"./DeWGVqas2.js";import{t as f}from"./CdZDxCfO2.js";var p={title:`Top 5 serverless GPU providers`,description:`Learn about the most popular serverless GPU providers in 2025`,authors:[{name:`Yiren Lu`,avatarUrl:`https://modal-cdn.com/ren-lu.jpg`,jobTitle:`Solutions Engineer`,twitterHandle:`YirenLu`}],date:`2025-10-20T12:00:00.000Z`,length:`5 minute read`,category:`Article`,subcategory:`GPUs`,published:!0,layout:`blog`,toc:[{depth:2,value:`What are serverless GPUs good for?`,id:`what-are-serverless-gpus-good-for`},{depth:2,value:`Top serverless GPU providers`,id:`top-serverless-gpu-providers`},{depth:2,value:`Modal`,id:`modal`},{depth:2,value:`RunPod`,id:`runpod`},{depth:2,value:`Baseten`,id:`baseten`},{depth:2,value:`Fal`,id:`fal`},{depth:2,value:`Replicate`,id:`replicate`,children:[{depth:3,value:`Pre-trained Models`,id:`pre-trained-models`},{depth:3,value:`Custom Models`,id:`custom-models`}]}],rawContent:`Serverless GPUs refer to a type of cloud computing service that allows you to run GPU-accelerated workloads that automatically scale up and down from 0 based on demand. You pay only for the compute time you use, and offload the management of the underlying hardware or software. Serverless GPUs have grown in popularity in the last few years with the advent of generative AI. The expensive, complex, and compute-intensive nature of AI workloads has driven developers to search for new cloud computing paradigms that reduce cost and operational effort.

In the last few years, a number of new serverless GPU providers have emerged. This article will explain what differentiates them from one another.

## What are serverless GPUs good for?

Serverless GPUs are a good fit for:

1. **Model Serving**: Deploying and running AI models for inference.
2. **Model Fine-tuning**: Fine-tuning AI models on custom datasets.
3. **Video and image processing**: Speeding up video and image processing tasks.
4. **CI/CD**: Running GPU-accelerated CI/CD pipelines.

## Top serverless GPU providers

## [Modal](https://modal.com)

Modal is an AI infrastructure platform that offers serverless GPUs behind an ergonomic Python SDK.

For example, if you want to deploy a function for inference that requires \`torch\` and uses a GPU, you can define the following:

\`\`\`python
import modal

image = modal.Image.debian_slim().pip_install("torch")

app = modal.App("gpu-example")

@app.function(gpu="A100")
def inference_function():
    import torch
    return torch.cuda.get_device_name(0)
\`\`\`

Notice that GPU requirements for the function are defined right in line with application code. There's no need to manage complex configuration surface areas for your serverless deployments.

Once your function is deployed, Modal automatically spins up GPUs as needed (up to thousands) to serve requests. Modal provisions GPU containers in less than a second, ensuring that you don't waste money on excessive idle GPU capacity.

Modal is the most flexible of the new serverless GPU providers: it lets you run arbitrary Python code in the cloud, attaching GPUs if you want, making Modal suitable for a wide range of AI workloads. Modal is most commonly used to run and scale inference for custom models, since it balances flexibility with ease-of-use. It is also used by companies for fine-tuning, training, and other GPU-accelerated tasks.

For detailed examples and documentation, visit the [Modal docs](/docs/examples).

## [RunPod](https://www.runpod.io/)

Runpod's serverless GPU offering is called [RunPod Serverless](https://docs.runpod.io/serverless/overview).

RunPod Serverless lets you deploy custom endpoints with your choice of GPU via a couple different modalities:

1. Quick Deploy: Pre-built custom endpoints for popular AI models.
2. Handler Functions: Bring your own functions to run in the cloud.
3. vLLM Endpoint: Specify and run a Hugging Face model in the cloud.

RunPod Serverless allows you to deploy custom endpoints with GPU support through their web console. The process involves logging into the RunPod Serverless console, creating a new endpoint, and configuring various parameters such as the endpoint name, GPU specifications, worker count, and Docker image details. Optional features like FlashBoot can be enabled for faster startup times. Once configured, you can deploy your endpoint with a single click, making it ready for use in GPU-accelerated tasks.

Once deployed, you can interact with your RunPod Serverless endpoint using the provided Endpoint URL. This allows you to send requests to your deployed model or application for inference or other GPU-accelerated tasks.

Note that RunPod also has a non-serverless GPU offering, called [RunPod Pods](https://docs.runpod.io/pods/overview), which are virtual machines with GPUs.

## [Baseten](https://www.baseten.co/)

Baseten is a serverless inference platform.

They offer a unique framework called [Truss](https://docs.baseten.co/truss-reference/overview), with an associated CLI, for configuration and deployment of models. To deploy a model on Baseten backed by a GPU, you specify the resources you need in a \`config.yaml\` file.

Here's an example of how to ask for A10G GPUs in order to run Stable Diffusion XL.

\`\`\`yaml
resources:
  accelerator: A10G
  cpu: "4"
  memory: 16Gi
  use_gpu: true
\`\`\`

You can also configure other aspects of the deployment, such as the number of replicas (for scaling) and whether you want Baseten to auto-scale.

You can then deploy your model with a \`truss push\` command. This creates a Docker image and pushes it to Baseten, where it can be deployed and run. It also automatically creates an API that you can use to send requests to your deployed model.

## [Fal](https://www.fal.ai/)

Fal is a newer player in the serverless GPU space. It is focused on the out-of-the-box deployment and serving of media generation models like Flux and SDXL and offers ready-made endpoints for the most popular models that users can call via API.

Fal offers [private serverless models](https://fal.ai/docs/private-serverless-models) as an enterprise feature. To use Fal for private serverless models, similar to with Modal, you can:

1. Decorate your Python code with Fal-specific decorators.
2. Specify the GPU you want to use (e.g., "GPU-A100") as a parameter to the decorator.
3. Deploy your code using the Fal CLI.

## [Replicate](https://replicate.com/)

Replicate offers serverless GPU-powered inference for a wide range of pre-trained models, as well as the ability to deploy custom models on GPUs behind a serverless endpoint.

### Pre-trained Models

For most users, the main benefit of Replicate is the extensive library of pre-trained models that are ready to use. The details of which GPU resources are needed for each model are generally abstracted away from the user, who can simply specify the model name.

### Custom Models

Replicate also allows users to [deploy custom models](https://replicate.com/docs/guides/deploy-a-custom-model). In the context of Replicate, a "model" refers to a trained, packaged, and published software program that accepts inputs and returns outputs.

To create and deploy a custom model on Replicate, you create a model in the Replicate web UI and train the model using the Replicate training API. You can then create a deployment for your model, which will provide a private, fixed API endpoint, and configure it to use certain GPUs/hardware.
`,meta:{description:`Learn about the most popular serverless GPU providers in 2025`}},{title:m,description:h,authors:g,date:_,length:v,category:y,subcategory:b,published:x,layout:S,toc:C,rawContent:w,meta:T}=p,E=t(`<p>Serverless GPUs refer to a type of cloud computing service that allows you to run GPU-accelerated workloads that automatically scale up and down from 0 based on demand. You pay only for the compute time you use, and offload the management of the underlying hardware or software. Serverless GPUs have grown in popularity in the last few years with the advent of generative AI. The expensive, complex, and compute-intensive nature of AI workloads has driven developers to search for new cloud computing paradigms that reduce cost and operational effort.</p> <p>In the last few years, a number of new serverless GPU providers have emerged. This article will explain what differentiates them from one another.</p> <h2 id="what-are-serverless-gpus-good-for">What are serverless GPUs good for?</h2> <p>Serverless GPUs are a good fit for:</p> <ol><li><strong>Model Serving</strong>: Deploying and running AI models for inference.</li> <li><strong>Model Fine-tuning</strong>: Fine-tuning AI models on custom datasets.</li> <li><strong>Video and image processing</strong>: Speeding up video and image processing tasks.</li> <li><strong>CI/CD</strong>: Running GPU-accelerated CI/CD pipelines.</li></ol> <h2 id="top-serverless-gpu-providers">Top serverless GPU providers</h2> <h2 id="modal"><!></h2> <p>Modal is an AI infrastructure platform that offers serverless GPUs behind an ergonomic Python SDK.</p> <p>For example, if you want to deploy a function for inference that requires <code>torch</code> and uses a GPU, you can define the following:</p> <!> <p>Notice that GPU requirements for the function are defined right in line with application code. There’s no need to manage complex configuration surface areas for your serverless deployments.</p> <p>Once your function is deployed, Modal automatically spins up GPUs as needed (up to thousands) to serve requests. Modal provisions GPU containers in less than a second, ensuring that you don’t waste money on excessive idle GPU capacity.</p> <p>Modal is the most flexible of the new serverless GPU providers: it lets you run arbitrary Python code in the cloud, attaching GPUs if you want, making Modal suitable for a wide range of AI workloads. Modal is most commonly used to run and scale inference for custom models, since it balances flexibility with ease-of-use. It is also used by companies for fine-tuning, training, and other GPU-accelerated tasks.</p> <p>For detailed examples and documentation, visit the <!>.</p> <h2 id="runpod"><!></h2> <p>Runpod’s serverless GPU offering is called <!>.</p> <p>RunPod Serverless lets you deploy custom endpoints with your choice of GPU via a couple different modalities:</p> <ol><li>Quick Deploy: Pre-built custom endpoints for popular AI models.</li> <li>Handler Functions: Bring your own functions to run in the cloud.</li> <li>vLLM Endpoint: Specify and run a Hugging Face model in the cloud.</li></ol> <p>RunPod Serverless allows you to deploy custom endpoints with GPU support through their web console. The process involves logging into the RunPod Serverless console, creating a new endpoint, and configuring various parameters such as the endpoint name, GPU specifications, worker count, and Docker image details. Optional features like FlashBoot can be enabled for faster startup times. Once configured, you can deploy your endpoint with a single click, making it ready for use in GPU-accelerated tasks.</p> <p>Once deployed, you can interact with your RunPod Serverless endpoint using the provided Endpoint URL. This allows you to send requests to your deployed model or application for inference or other GPU-accelerated tasks.</p> <p>Note that RunPod also has a non-serverless GPU offering, called <!>, which are virtual machines with GPUs.</p> <h2 id="baseten"><!></h2> <p>Baseten is a serverless inference platform.</p> <p>They offer a unique framework called <!>, with an associated CLI, for configuration and deployment of models. To deploy a model on Baseten backed by a GPU, you specify the resources you need in a <code>config.yaml</code> file.</p> <p>Here’s an example of how to ask for A10G GPUs in order to run Stable Diffusion XL.</p> <!> <p>You can also configure other aspects of the deployment, such as the number of replicas (for scaling) and whether you want Baseten to auto-scale.</p> <p>You can then deploy your model with a <code>truss push</code> command. This creates a Docker image and pushes it to Baseten, where it can be deployed and run. It also automatically creates an API that you can use to send requests to your deployed model.</p> <h2 id="fal"><!></h2> <p>Fal is a newer player in the serverless GPU space. It is focused on the out-of-the-box deployment and serving of media generation models like Flux and SDXL and offers ready-made endpoints for the most popular models that users can call via API.</p> <p>Fal offers <!> as an enterprise feature. To use Fal for private serverless models, similar to with Modal, you can:</p> <ol><li>Decorate your Python code with Fal-specific decorators.</li> <li>Specify the GPU you want to use (e.g., “GPU-A100”) as a parameter to the decorator.</li> <li>Deploy your code using the Fal CLI.</li></ol> <h2 id="replicate"><!></h2> <p>Replicate offers serverless GPU-powered inference for a wide range of pre-trained models, as well as the ability to deploy custom models on GPUs behind a serverless endpoint.</p> <h3 id="pre-trained-models">Pre-trained Models</h3> <p>For most users, the main benefit of Replicate is the extensive library of pre-trained models that are ready to use. The details of which GPU resources are needed for each model are generally abstracted away from the user, who can simply specify the model name.</p> <h3 id="custom-models">Custom Models</h3> <p>Replicate also allows users to <!>. In the context of Replicate, a “model” refers to a trained, packaged, and published software program that accepts inputs and returns outputs.</p> <p>To create and deploy a custom model on Replicate, you create a model in the Replicate web UI and train the model using the Replicate training API. You can then create a deployment for your model, which will provide a private, fixed API endpoint, and configure it to use certain GPUs/hardware.</p>`,1);function D(t,m){let h=a(m,[`children`,`$$slots`,`$$events`,`$$legacy`]);f(t,o(()=>h,()=>p,{children:(t,a)=>{var o=E(),f=c(s(o),12);d(e(f),{href:`https://modal.com`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Modal`))},$$slots:{default:!0}}),n(f);var p=c(f,6);u(p,{code:`import%20modal%0A%0Aimage%20%3D%20modal.Image.debian_slim().pip_install(%22torch%22)%0A%0Aapp%20%3D%20modal.App(%22gpu-example%22)%0A%0A%40app.function(gpu%3D%22A100%22)%0Adef%20inference_function()%3A%0A%20%20%20%20import%20torch%0A%20%20%20%20return%20torch.cuda.get_device_name(0)`,lang:`python`});var m=c(p,8);d(c(e(m)),{href:`/docs/examples`,children:(e,t)=>{l(),i(e,r(`Modal docs`))},$$slots:{default:!0}}),l(),n(m);var h=c(m,2);d(e(h),{href:`https://www.runpod.io/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod`))},$$slots:{default:!0}}),n(h);var g=c(h,2);d(c(e(g)),{href:`https://docs.runpod.io/serverless/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod Serverless`))},$$slots:{default:!0}}),l(),n(g);var _=c(g,10);d(c(e(_)),{href:`https://docs.runpod.io/pods/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`RunPod Pods`))},$$slots:{default:!0}}),l(),n(_);var v=c(_,2);d(e(v),{href:`https://www.baseten.co/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Baseten`))},$$slots:{default:!0}}),n(v);var y=c(v,4);d(c(e(y)),{href:`https://docs.baseten.co/truss-reference/overview`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Truss`))},$$slots:{default:!0}}),l(3),n(y);var b=c(y,4);u(b,{code:`resources%3A%0A%20%20accelerator%3A%20A10G%0A%20%20cpu%3A%20%224%22%0A%20%20memory%3A%2016Gi%0A%20%20use_gpu%3A%20true`,lang:`yaml`});var x=c(b,6);d(e(x),{href:`https://www.fal.ai/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Fal`))},$$slots:{default:!0}}),n(x);var S=c(x,4);d(c(e(S)),{href:`https://fal.ai/docs/private-serverless-models`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`private serverless models`))},$$slots:{default:!0}}),l(),n(S);var C=c(S,4);d(e(C),{href:`https://replicate.com/`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`Replicate`))},$$slots:{default:!0}}),n(C);var w=c(C,10);d(c(e(w)),{href:`https://replicate.com/docs/guides/deploy-a-custom-model`,rel:`nofollow`,children:(e,t)=>{l(),i(e,r(`deploy custom models`))},$$slots:{default:!0}}),l(),n(w),l(2),i(t,o)},$$slots:{default:!0}}))}export{D as default,p as metadata};
//# sourceMappingURL=BRzdEOgm.js.map
